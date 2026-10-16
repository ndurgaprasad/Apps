export default function RequestTrace({ result, error }) {
  return (
    <section className="panel trace-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CHRONOLOGICAL EVENTS</span>
          <h2>Request trace</h2>
        </div>
        <span className="quiet">
          {result?.requestId
            ? `Request ${result.requestId}`
            : "Waiting for an experiment"}
        </span>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {!result && !error ? (
        <div className="empty-state">
          Choose a scenario, then send a request to inspect provider attempts,
          classification and retry timing.
        </div>
      ) : (
        result && (
          <ol className="trace-list">
            {result.trace.map((event, i) => (
              <li
                className={`trace-event ${event.type}`}
                key={`${i}-${event.message}`}
              >
                <span className="trace-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{event.message}</span>
              </li>
            ))}
          </ol>
        )
      )}
    </section>
  );
}
