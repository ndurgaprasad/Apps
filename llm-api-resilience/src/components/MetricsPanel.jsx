export default function MetricsPanel({ result, config }) {
  const items = [
    ["Outcome", result?.outcome ?? "—"],
    ["Attempts", result ? `${result.attempts} physical` : "—"],
    ["Total duration", result ? `${result.durationMs} ms` : "—"],
    [
      "Final HTTP status",
      result?.finalStatus ? `HTTP ${result.finalStatus}` : "—",
    ],
    ["Retry count", result?.retryCount ?? "—"],
    [
      "Policy",
      `${config.timeoutMs} ms timeout · backoff ${config.exponentialBackoff ? "on" : "off"} · jitter ${config.jitter ? "on" : "off"}`,
    ],
  ];
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LATEST REQUEST</span>
          <h2>Outcome metrics</h2>
        </div>
      </div>
      <div className="metrics-grid">
        {items.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {result?.response && (
        <div className="response-note">
          <b>Provider result</b>
          <p>{result.response}</p>
        </div>
      )}
    </section>
  );
}
