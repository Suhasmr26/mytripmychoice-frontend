import { useState } from "react";
import { useNavigate } from "react-router-dom";

const plans = [
  { credits: 3, amount: 99, label: "Starter", desc: "3 Trip Plans", icon: "🌱" },
  { credits: 7, amount: 199, label: "Explorer", desc: "7 Trip Plans", icon: "🗺️" },
  { credits: 20, amount: 499, label: "Traveller", desc: "20 Trip Plans", icon: "✈️" },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (!selected) return setError("Please select a plan first.");
    setError("");
    setLoading(true);

    try {
      // Step 1: Create order
      const orderRes = await fetch("https://mytripmychoice-backend.onrender.com/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ amount: selected.amount * 100 }),
      });

      const orderData = JSON.parse(await orderRes.text());

      // Step 2: Open Razorpay
      const options = {
      key: "rzp_test_Slzxis9Y6hN5Ek",
        amount: orderData.amount,
        currency: "INR",
        name: "My Trip My Choice",
        description: `${selected.credits} Trip Plan Credits`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // Step 3: Verify payment
            const verifyRes = await fetch("https://mytripmychoice-backend.onrender.com/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                credits: selected.credits.toString(),
              }),
            });

            if (verifyRes.ok) {
              alert(`✅ ${selected.credits} credits added successfully!`);
              navigate("/dashboard");
            } else {
              alert("❌ Payment verification failed. Contact support.");
            }
          } catch {
            alert("❌ Verification error. Please contact support.");
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#a78bfa" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c12; font-family: 'DM Sans', sans-serif; color: #e2e8f0; min-height: 100vh; }

        .py-root {
          min-height: 100vh;
          background: #080c12;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .py-root::before {
          content: '';
          position: absolute;
          top: -200px; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .py-card {
          background: #0e1420;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 40px 36px;
          width: 100%;
          max-width: 520px;
          position: relative;
          z-index: 1;
        }
        .py-brand {
          text-align: center;
          margin-bottom: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #475569;
        }
        .py-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          text-align: center;
          margin-bottom: 8px;
        }
        .py-title span {
          background: linear-gradient(90deg, #a78bfa, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .py-subtitle {
          text-align: center;
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 32px;
        }
        .py-plans { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .py-plan {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #131c27;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .py-plan:hover { border-color: rgba(167,139,250,0.3); transform: translateX(4px); }
        .py-plan.selected { border-color: #a78bfa; background: rgba(167,139,250,0.07); box-shadow: 0 0 24px rgba(167,139,250,0.1); }
        .py-plan-icon { font-size: 1.6rem; flex-shrink: 0; }
        .py-plan-info { flex: 1; }
        .py-plan-name { font-weight: 700; font-size: 0.95rem; color: #fff; margin-bottom: 2px; }
        .py-plan-desc { font-size: 0.78rem; color: #64748b; }
        .py-plan-price { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; color: #a78bfa; flex-shrink: 0; }
        .py-plan-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .py-plan.selected .py-plan-radio { border-color: #a78bfa; background: #a78bfa; }
        .py-plan.selected .py-plan-radio::after { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #fff; }

        .py-info {
          background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.15);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .py-info-row { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: #94a3b8; }

        .py-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 12px; padding: 12px 16px; color: #f87171; font-size: 0.83rem; text-align: center; margin-bottom: 16px; }

        .py-pay-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        }
        .py-pay-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
        .py-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .py-back-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          color: #475569;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .py-back-btn:hover { border-color: rgba(255,255,255,0.15); color: #94a3b8; }
        .py-note { text-align: center; font-size: 0.72rem; color: #334155; margin-top: 16px; }
      `}</style>

      <div className="py-root">
        <div className="py-card">
          <div className="py-brand">✈️ My Trip My Choice</div>
          <div className="py-title">Buy <span>Credits</span></div>
          <div className="py-subtitle">Each credit = 1 AI-generated trip plan</div>

          <div className="py-plans">
            {plans.map((plan) => (
              <div
                key={plan.credits}
                className={`py-plan ${selected?.credits === plan.credits ? "selected" : ""}`}
                onClick={() => setSelected(plan)}
              >
                <div className="py-plan-radio" />
                <div className="py-plan-icon">{plan.icon}</div>
                <div className="py-plan-info">
                  <div className="py-plan-name">{plan.label} — {plan.desc}</div>
                  <div className="py-plan-desc">{plan.credits} credits · ₹{Math.round(plan.amount / plan.credits)}/credit</div>
                </div>
                <div className="py-plan-price">₹{plan.amount}</div>
              </div>
            ))}
          </div>

          <div className="py-info">
            <div className="py-info-row"><span>🔒</span><span>Secure payment via Razorpay</span></div>
            <div className="py-info-row"><span>⚡</span><span>Credits added instantly after payment</span></div>
            <div className="py-info-row"><span>💳</span><span>UPI, Credit/Debit Card, Net Banking</span></div>
          </div>

          {error && <div className="py-error">⚠️ {error}</div>}

          <button className="py-pay-btn" onClick={handlePayment} disabled={loading || !selected}>
            {loading ? "Processing..." : selected ? `Pay ₹${selected.amount}` : "Select a Plan"}
          </button>

          <button className="py-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>

          <div className="py-note">Powered by Razorpay · 100% secure transactions</div>
        </div>
      </div>
    </>
  );
}
