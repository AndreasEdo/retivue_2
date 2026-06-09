// Warna per tingkat keparahan (hijau -> merah), nada sedikit diredam agar klinis.
const GRADE_COLORS = ["#16a34a", "#65a30d", "#d97706", "#ea580c", "#dc2626"];
const GRADE_SHORT = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l9 16H3l9-16z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export default function ResultCard({ result }) {
  const { grade, label, raw_score, confidence, thresholds, disclaimer } = result;
  const color = GRADE_COLORS[grade] ?? "#64748b";

  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__title">2 · Triage result</span>
        <span className="hint">Regression score {raw_score}</span>
      </div>

      <div className="result__top">
        <div className="grade-chip" style={{ background: color }}>
          <span className="grade-chip__num">GRADE {grade}</span>
          <span className="grade-chip__label">{label}</span>
        </div>
        <div className="result__score">
          Continuous score <b>{raw_score}</b> mapped to a grade using thresholds{" "}
          {thresholds.map((t) => t.toFixed(2)).join(" · ")}.
        </div>
      </div>

      {/* Skala keparahan 0–4 */}
      <div className="scale">
        <div className="scale__track">
          {GRADE_SHORT.map((_, i) => (
            <div
              key={i}
              className="scale__seg"
              style={i <= grade ? { background: GRADE_COLORS[i] } : undefined}
            />
          ))}
        </div>
        <div className="scale__labels">
          {GRADE_SHORT.map((name, i) => (
            <span key={i} className={i === grade ? "active" : ""}>
              {i} · {name}
            </span>
          ))}
        </div>
      </div>

      {typeof confidence === "number" && (
        <div className="meter-wrap">
          <div className="label">
            <span>Confidence (distance from the decision threshold)</span>
            <span>{(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="meter">
            <span style={{ width: `${Math.min(100, confidence * 100)}%`, background: color }} />
          </div>
        </div>
      )}

      <div className="notice">
        <WarnIcon />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
}
