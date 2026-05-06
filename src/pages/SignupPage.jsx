import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ name, email, password });
      toast.success("Account created! Please login 🎉");
      navigate("/login");
    } catch (err) {
      toast.error("Email already exists or something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🌍 My Trip My Choice</h1>
          <p>Your journey, your way</p>
        </div>
        <div className="auth-form">
          <h2>Create Account</h2>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          <div className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}