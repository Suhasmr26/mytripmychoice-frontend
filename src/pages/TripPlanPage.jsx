import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function parsePlan(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.replace("## ", "").replace(/\*\*/g, "") });
    } else if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.replace("# ", "").replace(/\*\*/g, "") });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.replace("### ", "").replace(/\*\*/g, "") });
    } else if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1"));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    } else if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].includes("---")) {
          const cells = lines[i].split("|").filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ""));
          rows.push(cells);
        }
        i++;
      }
      blocks.push({ type: "table", rows });
      continue;
    } else if (line.startsWith("---")) {
      blocks.push({ type: "divider" });
    } else if (line.trim()) {
      blocks.push({ type: "p", text: line.replace(/\*\*(.*?)\*\*/g, "$1") });
    }
    i++;
  }
  return blocks;
}

const DAY_ICONS = ["🌅", "🌊", "🏛️", "🌿", "🛍️", "🎭", "🌙", "🏔️", "🎪", "🌺"];
const DAY_COLORS = ["#f97316", "#3b82f6", "#10b981", "#a78bfa", "#f59e0b", "#ec4899", "#06b6d4", "#84cc16", "#ef4444", "#8b5cf6"];

export default function TripPlanPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const plan = state?.plan;
  const destination = state?.destination;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!plan) { navigate("/dashboard"); return; }
    setTimeout(() => setVisible(true), 100);
  }, [plan, navigate]);

  if (!plan) return null;

  const blocks = parsePlan(plan);
  let dayCount = 0;

  const elements = [];
  let currentDay = null;
  let currentSection = null;

  const flushDay = () => {
    if (currentDay) {
      const dc = currentDay.index;
      const color = DAY_COLORS[dc % DAY_COLORS.length];
      elements.push(
        <div className="tp-day-card" key={`day-${dc}`} style={{ "--day-color": color }}>
          <div className="tp-day-header">
            <div className="tp-day-num" style={{ background: color }}>Day {dc}</div>
            <div className="tp-day-icon">{DAY_ICONS[dc % DAY_ICONS.length]}</div>
            <div className="tp-day-title-wrap">
              <div className="tp-day-title">{currentDay.title}</div>
              {currentDay.subtitle && <div className="tp-day-subtitle">{currentDay.subtitle}</div>}
            </div>
          </div>
          <div className="tp-day-body">{currentDay.children}</div>
        </div>
      );
      currentDay = null;
    }
  };

  const flushSection = () => {
    if (currentSection) {
      elements.push(
        <div className="tp-section-card" key={`sec-${currentSection.key}`}>
          <div className="tp-section-title">{currentSection.title}</div>
          <div className="tp-section-body">{currentSection.children}</div>
        </div>
      );
      currentSection = null;
    }
  };

  blocks.forEach((block, idx) => {
    if (block.type === "h1") {
      flushDay(); flushSection();
      elements.push(
        <div className="tp-main-title" key={idx}>
          <div className="tp-main-title-icon">✨</div>
          <h2>{block.text}</h2>
        </div>
      );
    } else if (block.type === "h2") {
      flushDay(); flushSection();
      const isDay = /day\s*\d/i.test(block.text);
      const isBudget = /budget|cost|total|expense/i.test(block.text);
      if (isDay) {
        dayCount++;
        const parts = block.text.split(":");
        currentDay = { index: dayCount, title: parts[0].trim(), subtitle: parts[1]?.trim() || "", children: [] };
      } else if (isBudget) {
        currentSection = { title: "💰 " + block.text, key: idx, children: [] };
      } else {
        currentSection = { title: block.text, key: idx, children: [] };
      }
    } else if (block.type === "h3") {
      const el = <div className="tp-h3" key={idx}>— {block.text}</div>;
      if (currentDay) currentDay.children.push(el);
      else if (currentSection) currentSection.children.push(el);
    } else if (block.type === "ul") {
      const isCost = block.items.some(i => /cost|₹|rs\.|hotel|food|transport/i.test(i));
      const el = isCost ? (
        <div className="tp-chips-row" key={idx}>
          {block.items.map((item, i) => <span className="tp-chip" key={i}>{item}</span>)}
        </div>
      ) : (
        <ul className="tp-ul" key={idx}>
          {block.items.map((item, i) => (
            <li key={i}>
              <span className="tp-ul-dot" />
              {item}
            </li>
          ))}
        </ul>
      );
      if (currentDay) currentDay.children.push(el);
      else if (currentSection) currentSection.children.push(el);
      else elements.push(el);
    } else if (block.type === "table") {
      flushDay();
      const el = (
        <div className="tp-table-wrap" key={idx}>
          {currentSection && <div className="tp-table-head">{currentSection.title}</div>}
          <table className="tp-table">
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className={r === block.rows.length - 1 ? "tp-table-last" : ""}>
                  {row.map((cell, c) => <td key={c}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentSection = null;
      elements.push(el);
    } else if (block.type === "p") {
      const el = <p className="tp-p" key={idx}>{block.text}</p>;
      if (currentDay) currentDay.children.push(el);
      else if (currentSection) currentSection.children.push(el);
      else elements.push(el);
    } else if (block.type === "divider") {
      if (!currentDay && !currentSection) elements.push(<div className="tp-divider" key={idx} />);
    }
  });

  flushDay();
  flushSection();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c12; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }

        .tp-root { min-height: 100vh; background: #080c12; }

        /* HERO */
        .tp-hero {
          position: relative;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px 100px;
          overflow: hidden;
        }
        .tp-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          z-index: 0;
        }
        .tp-hero-glow {
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 65%);
          z-index: 1;
          pointer-events: none;
        }
        .tp-hero-content { position: relative; z-index: 2; }
        .tp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(251,191,36,0.12);
          border: 1px solid rgba(251,191,36,0.3);
          color: #fbbf24;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 7px 20px;
          border-radius: 100px;
          margin-bottom: 24px;
        }
        .tp-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 7vw, 4.5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 16px;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .tp-hero h1 .dest {
          background: linear-gradient(90deg, #fbbf24, #f97316, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tp-hero-sub {
          color: rgba(255,255,255,0.4);
          font-size: 0.95rem;
          font-weight: 300;
          letter-spacing: 0.03em;
        }
        .tp-hero-stars {
          position: absolute;
          inset: 0; z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .tp-star {
          position: absolute;
          width: 2px; height: 2px;
          background: #fff;
          border-radius: 50%;
          opacity: 0.4;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        /* BODY */
        .tp-body {
          max-width: 900px;
          margin: -60px auto 0;
          padding: 0 20px 80px;
          position: relative;
          z-index: 10;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.7s ease;
        }
        .tp-body.visible { opacity: 1; transform: translateY(0); }

        /* DISCLAIMER */
        .tp-disclaimer {
          background: linear-gradient(135deg, rgba(251,191,36,0.06), rgba(249,115,22,0.06));
          border: 1px solid rgba(251,191,36,0.2);
          border-radius: 16px;
          padding: 16px 22px;
          font-size: 0.8rem;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 36px;
          backdrop-filter: blur(10px);
        }
        .tp-disclaimer strong { color: #fbbf24; }

        /* MAIN TITLE */
        .tp-main-title {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #1a1f2e, #12182a);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 28px;
          text-align: center;
          justify-content: center;
        }
        .tp-main-title-icon { font-size: 1.8rem; }
        .tp-main-title h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
        }

        /* DAY CARD */
        .tp-day-card {
          background: #0e1420;
          border: 1px solid rgba(255,255,255,0.06);
          border-top: 3px solid var(--day-color);
          border-radius: 20px;
          margin-bottom: 24px;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .tp-day-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .tp-day-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .tp-day-num {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          padding: 5px 12px;
          border-radius: 100px;
          flex-shrink: 0;
        }
        .tp-day-icon { font-size: 1.6rem; flex-shrink: 0; }
        .tp-day-title-wrap { flex: 1; }
        .tp-day-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
        }
        .tp-day-subtitle {
          font-size: 0.76rem;
          color: #60a5fa;
          margin-top: 3px;
          font-weight: 400;
        }
        .tp-day-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 10px; }

        /* H3 inside day */
        .tp-h3 {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fbbf24;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* LIST */
        .tp-ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .tp-ul li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.88rem;
          color: #cbd5e1;
          line-height: 1.6;
        }
        .tp-ul-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--day-color, #a78bfa);
          flex-shrink: 0;
          margin-top: 7px;
        }

        /* CHIPS */
        .tp-chips-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .tp-chip {
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          color: #93c5fd;
          font-size: 0.76rem;
          font-weight: 500;
          padding: 5px 14px;
          border-radius: 100px;
        }

        /* P */
        .tp-p {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.75;
        }

        /* SECTION CARD */
        .tp-section-card {
          background: linear-gradient(135deg, #0d1829, #0a1220);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 20px;
          padding: 26px 28px;
          margin-bottom: 24px;
        }
        .tp-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(59,130,246,0.12);
        }
        .tp-section-body { display: flex; flex-direction: column; gap: 10px; }

        /* TABLE */
        .tp-table-wrap {
          background: #0e1420;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .tp-table-head {
          background: linear-gradient(135deg, #1a2744, #0f1e38);
          padding: 18px 24px;
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .tp-table { width: 100%; border-collapse: collapse; }
        .tp-table td { padding: 13px 24px; font-size: 0.87rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .tp-table td:last-child { text-align: right; color: #fbbf24; font-weight: 600; }
        .tp-table-last td { color: #fbbf24 !important; font-weight: 700 !important; font-size: 0.95rem !important; background: rgba(251,191,36,0.05); }

        /* DIVIDER */
        .tp-divider { height: 1px; background: rgba(255,255,255,0.05); margin: 4px 0 24px; }

        /* ACTIONS */
        .tp-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .tp-btn {
          flex: 1;
          min-width: 160px;
          padding: 15px 24px;
          border: none;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.02em;
        }
        .tp-btn-back {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tp-btn-back:hover { background: rgba(255,255,255,0.09); }
        .tp-btn-print {
          background: linear-gradient(135deg, #fbbf24, #f97316);
          color: #0d1117;
        }
        .tp-btn-print:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(251,191,36,0.3); }

        /* PRINT FOOTER */
        .tp-print-footer { display: none; }

        @media print {
          @page { size: A4; margin: 15mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .tp-hero-bg { background: linear-gradient(135deg, #0f0c29, #302b63) !important; }
          .tp-actions { display: none !important; }
          .tp-body { margin-top: 0; opacity: 1; transform: none; }
          .tp-day-card { break-inside: avoid; }
          .tp-print-footer { display: block !important; text-align: center; font-size: 0.75rem; color: #94a3b8; margin-top: 24px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        }
      `}</style>

      <div className="tp-root">
        {/* HERO */}
        <div className="tp-hero">
          <div className="tp-hero-bg" />
          <div className="tp-hero-glow" />
          <div className="tp-hero-stars">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="tp-star" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }} />
            ))}
          </div>
          <div className="tp-hero-content">
            <div className="tp-hero-badge">✈️ My Trip My Choice</div>
            <h1>
              Your Journey to<br />
              <span className="dest">{destination}</span>
            </h1>
            <p className="tp-hero-sub">Your personalized AI-crafted itinerary is ready ✨</p>
          </div>
        </div>

        {/* BODY */}
        <div className={`tp-body ${visible ? "visible" : ""}`}>
          <div className="tp-disclaimer">
            🌟 <strong>Disclaimer:</strong> My Trip My Choice provides trip plans and suggestions only.
            We do not book, arrange or guarantee any travel services.
          </div>

          {elements}

          <div className="tp-print-footer">
            Generated by My Trip My Choice · Suggested plan only · We do not book or arrange trips
          </div>

          <div className="tp-actions">
            <button className="tp-btn tp-btn-back" onClick={() => navigate("/dashboard")}>
              🏠 Back to Dashboard
            </button>
            <button className="tp-btn tp-btn-print" onClick={() => window.print()}>
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}