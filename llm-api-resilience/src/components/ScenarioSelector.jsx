const scenarios = [
  ["normal", "Normal response", "200 · 400–700 ms"],
  ["slow", "Slow provider", "4,000 ms modeled latency"],
  ["transient503", "Transient HTTP 503", "503 → 503 → 200"],
  ["http500", "HTTP 500", "Retryable in this experiment"],
  ["http429", "HTTP 429", "Retry-After: 1 second"],
  ["http400", "HTTP 400", "Not retryable"],
];
export default function ScenarioSelector({ value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">Provider scenario</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {scenarios.map(([id, label, hint]) => (
          <option key={id} value={id}>
            {label} — {hint}
          </option>
        ))}
      </select>
    </label>
  );
}
