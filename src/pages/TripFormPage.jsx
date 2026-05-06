import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateTrip } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function TripFormPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  const [budget, setBudget] = useState("");
  const [destination, setDestination] = useState("");
  const [travelMode, setTravelMode] = useState("BUS");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([
    { name: "", age: "", sex: "Male" },
  ]);

  const addMember = () => {
    setMembers([...members, { name: "", age: "", sex: "Male" }]);
  };

  const removeMember = (index) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const validateMembers = () => {
    for (let m of members) {
      if (!m.name || !m.age) {
        toast.error("Please fill all member details!");
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!budget || !destination) {
      toast.error("Please fill all fields!");
      return;
    }
    if (!validateMembers()) return;

    setLoading(true);
    try {
      const res = await generateTrip({
        tripType: type,
        destination,
        budget: parseFloat(budget),
        travelMode,
        members,
      });

      // Update user credits
      const updatedUser = { ...user, credits: user.credits - 1 };
      loginUser(updatedUser, localStorage.getItem("token"));

      navigate("/trip-plan", { state: { plan: res.data.plan, destination } });
    } catch (err) {
      toast.error("Failed to generate trip plan. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const tripTitle = {
    LOCAL: "🏘️ Local Trip",
    OUTSTATE: "🗺️ Out of State Trip",
    OUTCOUNTRY: "✈️ International Trip",
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>{tripTitle[type]} — Plan Details</h2>

        {/* Budget */}
        <div className="form-group">
          <label>💰 Total Budget (₹)</label>
          <input
            type="number"
            placeholder="Enter your total budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        {/* Destination */}
        <div className="form-group">
          <label>📍 Destination / Place</label>
          <input
            type="text"
            placeholder={
              type === "LOCAL"
                ? "e.g. Mysore, Coorg"
                : type === "OUTSTATE"
                ? "e.g. Rajasthan, Kerala"
                : "e.g. Thailand, Dubai"
            }
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        {/* Travel Mode */}
        <div className="form-group">
          <label>🚌 Travel Mode</label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value)}
          >
            <option value="BUS">🚌 Bus</option>
            <option value="PLANE">✈️ Plane</option>
            <option value="TRAIN">🚂 Train</option>
            <option value="CAR">🚗 Car</option>
          </select>
        </div>

        {/* Members */}
        <div className="form-group">
          <label>👥 Trip Members ({members.length} person{members.length > 1 ? "s" : ""})</label>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "12px" }}>
            ℹ️ Children below 7 years travel free
          </p>

          {members.map((member, index) => (
            <div className="member-card" key={index}>
              <h4>Person {index + 1}</h4>
              <div className="member-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={member.age}
                    onChange={(e) => updateMember(index, "age", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Sex</label>
                  <select
                    value={member.sex}
                    onChange={(e) => updateMember(index, "sex", e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(index)}
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button className="btn-add" onClick={addMember}>
            + Add Another Person
          </button>
        </div>

        {/* Generate Button */}
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "✨ Generating Your Plan..." : "🚀 Generate Trip Plan"}
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            color: "#94a3b8",
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}