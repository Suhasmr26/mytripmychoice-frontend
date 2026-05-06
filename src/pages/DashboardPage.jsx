import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [tripType, setTripType] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [travelMode, setTravelMode] = useState("");
  const [members, setMembers] = useState([{ name: "", age: "", sex: "" }]);

  const loadingMessages = [
    { icon: "🌍", text: "Exploring the destination..." },
    { icon: "🏨", text: "Finding the best hotels..." },
    { icon: "🍽️", text: "Discovering local cuisine..." },
    { icon: "🗺️", text: "Planning your itinerary..." },
    { icon: "💰", text: "Calculating your budget..." },
    { icon: "✈️", text: "Finalizing your trip plan..." },
  ];

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchProfile();
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 20000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("https://mytripmychoice-backend-production.up.railway.app/api/auth/profile", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setUser(data);
    } catch {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const addMember = () => setMembers([...members, { name: "", age: "", sex: "" }]);

  const removeMember = (index) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleGenerate = async () => {
    if (!tripType) return setError("Please select a trip type first.");
    if (!destination.trim()) return setError("Please enter a destination.");
    if (!budget || isNaN(budget)) return setError("Please enter a valid budget.");
    if (!travelMode) return setError("Please select a travel mode.");
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim()) return setError(`Please enter name for traveler ${i + 1}.`);
      if (!members[i].age || isNaN(members[i].age)) return setError(`Please enter valid age for traveler ${i + 1}.`);
      if (!members[i].sex) return setError(`Please select gender for traveler ${i + 1}.`);
    }

    setError("");
    setLoading(true);
    setLoadingStep(0);

    try {
      const res = await fetch("https://mytripmychoice-backend-production.up.railway.app/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          tripType,
          destination,
          budget: parseFloat(budget),
          travelMode,
          members: members.map((m) => ({
            name: m.name,
            age: parseInt(m.age),
            sex: m.sex,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate trip. Please try again.");
        setLoading(false);
        return;
      }

      fetchProfile();
      navigate("/trip-plan", { state: { plan: data.plan, destination } });
    } catch {
      setError("Something went wrong. Please check your connection.");
      setLoading(false);
    }
  };

  const tripTypes = [
    { id: "local", label: "Local Trip", icon: "🏙️", desc: "Explore within your city or nearby areas", color: "#10b981" },
    { id: "state", label: "Out of State", icon: "🗺️", desc: "Travel across states within India", color: "#3b82f6" },
    { id: "country", label: "International", icon: "✈️", desc: "Explore destinations outside India", color: "#a78bfa" },
  ];

  // FULL SCREEN LOADING
  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0d1117; font-family: 'DM Sans', sans-serif; }
          .ld-root {
            min-height: 100vh;
            background: #0d1117;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
          }
          .ld-globe {
            font-size: 5rem;
            margin-bottom: 24px;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-16px); }
          }
          .ld-title {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            font-weight: 900;
            color: #fff;
            margin-bottom: 8px;
          }
          .ld-title span {
            background: linear-gradient(90deg, #fbbf24, #f97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .ld-dest {
            color: #64748b;
            font-size: 0.95rem;
            margin-bottom: 48px;
          }
          .ld-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 48px;
            min-height: 80px;
          }
          .ld-step-icon {
            font-size: 2.5rem;
            animation: popIn 0.4s ease;
          }
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .ld-step-text {
            font-size: 1.1rem;
            font-weight: 500;
            color: #e2e8f0;
            animation: fadeIn 0.4s ease;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .ld-bar-wrap {
            width: 320px;
            height: 6px;
            background: rgba(255,255,255,0.08);
            border-radius: 100px;
            overflow: hidden;
            margin-bottom: 20px;
          }
          .ld-bar {
            height: 100%;
            background: linear-gradient(90deg, #a78bfa, #f97316);
            border-radius: 100px;
            animation: progress 120s linear forwards;
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 95%; }
          }
          .ld-note {
            font-size: 0.78rem;
            color: #334155;
          }
          .ld-dots {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 32px;
          }
          .ld-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #a78bfa;
            animation: bounce 1.2s ease-in-out infinite;
          }
          .ld-dot:nth-child(2) { animation-delay: 0.2s; background: #fbbf24; }
          .ld-dot:nth-child(3) { animation-delay: 0.4s; background: #f97316; }
          @keyframes bounce {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.4); opacity: 1; }
          }
        `}</style>
        <div className="ld-root">
          <div className="ld-globe">🌏</div>
          <div className="ld-title">Planning Your Trip to<br /><span>{destination}</span></div>
          <div className="ld-dest">Our AI is crafting your perfect itinerary...</div>
          <div className="ld-step">
            <div className="ld-step-icon" key={loadingStep + "icon"}>{loadingMessages[loadingStep].icon}</div>
            <div className="ld-step-text" key={loadingStep + "text"}>{loadingMessages[loadingStep].text}</div>
          </div>
          <div className="ld-bar-wrap">
            <div className="ld-bar" />
          </div>
          <div className="ld-note">⏳ This usually takes 1–2 minutes. Please don't close this tab.</div>
          <div className="ld-dots">
            <div className="ld-dot" />
            <div className="ld-dot" />
            <div className="ld-dot" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d1117; font-family: 'DM Sans', sans-serif; color: #e2e8f0; min-height: 100vh; }
        .db-root { min-height: 100vh; background: #0d1117; }
        .db-nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; background: rgba(13,17,23,0.95); border-bottom: 1px solid rgba(255,255,255,0.07); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px); }
        .db-nav-brand { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #fff; }
        .db-nav-brand span { background: linear-gradient(90deg, #fbbf24, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .db-nav-right { display: flex; align-items: center; gap: 16px; }
        .db-credits-badge { background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.35); color: #fbbf24; font-size: 0.82rem; font-weight: 600; padding: 6px 14px; border-radius: 100px; }
        .db-logout-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 0.82rem; font-weight: 600; padding: 6px 14px; border-radius: 100px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .db-logout-btn:hover { background: rgba(239,68,68,0.2); }
        .db-hero { text-align: center; padding: 60px 24px 40px; position: relative; overflow: hidden; }
        .db-hero::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%); pointer-events: none; }
        .db-welcome { font-size: 0.82rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #a78bfa; margin-bottom: 12px; }
        .db-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 900; color: #fff; line-height: 1.15; margin-bottom: 12px; }
        .db-hero h1 span { background: linear-gradient(90deg, #fbbf24, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .db-hero-sub { color: #64748b; font-size: 1rem; font-weight: 300; }
        .db-body { max-width: 860px; margin: 0 auto; padding: 0 20px 80px; opacity: 0; transform: translateY(20px); transition: all 0.5s ease; }
        .db-body.visible { opacity: 1; transform: translateY(0); }
        .db-section-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #475569; margin-bottom: 14px; }
        .db-trip-types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 32px; }
        @media (max-width: 600px) { .db-trip-types { grid-template-columns: 1fr; } }
        .db-type-card { background: #131c27; border: 2px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 22px 18px; cursor: pointer; transition: all 0.25s; text-align: center; }
        .db-type-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
        .db-type-card.selected { border-color: var(--card-color); background: rgba(255,255,255,0.04); box-shadow: 0 0 24px rgba(0,0,0,0.3); }
        .db-type-icon { font-size: 2rem; margin-bottom: 10px; }
        .db-type-label { font-weight: 700; font-size: 0.95rem; color: #fff; margin-bottom: 4px; }
        .db-type-desc { font-size: 0.75rem; color: #64748b; line-height: 1.4; }
        .db-form-card { background: #131c27; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; margin-bottom: 20px; }
        .db-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .db-form-grid { grid-template-columns: 1fr; } }
        .db-form-group { display: flex; flex-direction: column; gap: 8px; }
        .db-form-group.full { grid-column: 1 / -1; }
        .db-label { font-size: 0.78rem; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em; }
        .db-input { background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; font-size: 0.9rem; color: #e2e8f0; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; outline: none; width: 100%; }
        .db-input:focus { border-color: #a78bfa; }
        .db-input::placeholder { color: #334155; }
        select.db-input option { background: #131c27; }
        .db-members-section { margin-bottom: 20px; }
        .db-member-card { background: #131c27; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 12px; }
        .db-member-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .db-member-title { font-size: 0.85rem; font-weight: 600; color: #a78bfa; }
        .db-remove-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: 100px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .db-remove-btn:hover { background: rgba(239,68,68,0.2); }
        .db-member-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        @media (max-width: 600px) { .db-member-grid { grid-template-columns: 1fr; } }
        .db-add-member-btn { width: 100%; padding: 12px; background: transparent; border: 1px dashed rgba(167,139,250,0.4); border-radius: 14px; color: #a78bfa; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-bottom: 20px; }
        .db-add-member-btn:hover { background: rgba(167,139,250,0.06); border-color: #a78bfa; }
        .db-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 12px 16px; color: #f87171; font-size: 0.85rem; margin-bottom: 16px; text-align: center; }
        .db-generate-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #a78bfa, #7c3aed); border: none; border-radius: 14px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .db-generate-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
        .db-generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-credits-info { background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2); border-radius: 14px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 10px; }
        .db-credits-info-text { font-size: 0.85rem; color: #94a3b8; }
        .db-credits-info-text strong { color: #fbbf24; }
        .db-buy-btn { background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.35); color: #fbbf24; font-size: 0.8rem; font-weight: 600; padding: 6px 14px; border-radius: 100px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .db-buy-btn:hover { background: rgba(251,191,36,0.25); }
      `}</style>

      <div className="db-root">
        <nav className="db-nav">
          <div className="db-nav-brand">✈️ My Trip <span>My Choice</span></div>
          <div className="db-nav-right">
            {user && <div className="db-credits-badge">💎 {user.credits ?? 0} Credits</div>}
            <button className="db-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="db-hero">
          <div className="db-welcome">Welcome back 👋</div>
          <h1>Hello, <span>{user?.name ?? "Traveler"}</span>!<br />Where to next?</h1>
          <p className="db-hero-sub">Plan your perfect trip in seconds with AI</p>
        </div>

        <div className={`db-body ${visible ? "visible" : ""}`}>
          {user && (
            <div className="db-credits-info">
              <div className="db-credits-info-text">
                You have <strong>{user.credits ?? 0} credits</strong> remaining. Each trip plan costs <strong>1 credit</strong>.
              </div>
              <button className="db-buy-btn" onClick={() => navigate("/payment")}>+ Buy Credits</button>
            </div>
          )}

          <div className="db-section-label">Step 1 — Choose Trip Type</div>
          <div className="db-trip-types">
            {tripTypes.map((t) => (
              <div key={t.id} className={`db-type-card ${tripType === t.id ? "selected" : ""}`} style={{ "--card-color": t.color }} onClick={() => setTripType(t.id)}>
                <div className="db-type-icon">{t.icon}</div>
                <div className="db-type-label" style={{ color: tripType === t.id ? t.color : "#fff" }}>{t.label}</div>
                <div className="db-type-desc">{t.desc}</div>
              </div>
            ))}
          </div>

          <div className="db-section-label">Step 2 — Trip Details</div>
          <div className="db-form-card">
            <div className="db-form-grid">
              <div className="db-form-group full">
                <label className="db-label">Destination *</label>
                <input className="db-input"
                  placeholder={tripType === "local" ? "e.g. Bengaluru city tour" : tripType === "state" ? "e.g. Goa, Rajasthan" : tripType === "country" ? "e.g. Paris, Thailand" : "Select a trip type first"}
                  value={destination} onChange={(e) => setDestination(e.target.value)} disabled={!tripType} />
              </div>
              <div className="db-form-group">
                <label className="db-label">Budget (₹) *</label>
                <input className="db-input" type="number" placeholder="e.g. 20000" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label className="db-label">Travel Mode *</label>
                <select className="db-input" value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
                  <option value="">Select mode</option>
                  <option value="flight">✈️ Flight</option>
                  <option value="train">🚆 Train</option>
                  <option value="bus">🚌 Bus</option>
                  <option value="car">🚗 Car</option>
                  <option value="any">🌐 Any</option>
                </select>
              </div>
            </div>
          </div>

          <div className="db-section-label">Step 3 — Traveler Details</div>
          <div className="db-members-section">
            {members.map((member, index) => (
              <div className="db-member-card" key={index}>
                <div className="db-member-header">
                  <div className="db-member-title">👤 Traveler {index + 1}</div>
                  {members.length > 1 && <button className="db-remove-btn" onClick={() => removeMember(index)}>✕ Remove</button>}
                </div>
                <div className="db-member-grid">
                  <div className="db-form-group">
                    <label className="db-label">Name *</label>
                    <input className="db-input" placeholder="e.g. Rahul" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} />
                  </div>
                  <div className="db-form-group">
                    <label className="db-label">Age *</label>
                    <input className="db-input" type="number" placeholder="e.g. 25" min="1" value={member.age} onChange={(e) => updateMember(index, "age", e.target.value)} />
                  </div>
                  <div className="db-form-group">
                    <label className="db-label">Gender *</label>
                    <select className="db-input" value={member.sex} onChange={(e) => updateMember(index, "sex", e.target.value)}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button className="db-add-member-btn" onClick={addMember}>+ Add Another Traveler</button>
          </div>

          {error && <div className="db-error">⚠️ {error}</div>}

          <button className="db-generate-btn" onClick={handleGenerate} disabled={loading}>
            ✨ Generate My Trip Plan
          </button>
        </div>
      </div>
    </>
  );
}