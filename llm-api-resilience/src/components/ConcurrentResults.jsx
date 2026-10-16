export default function ConcurrentResults({ results }) {
  if (!results) return null;
  return (
    <section className="panel concurrent-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">PARALLEL CLIENTS</span>
          <h2>Concurrent request comparison</h2>
        </div>
        <span className="quiet">Runtime-generated waits · milliseconds</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Request</th>
              <th>Retry 1 wait</th>
              <th>Retry 2 wait</th>
              <th>Attempts</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.requestId}>
                <td>Client {String.fromCharCode(65 + index)}</td>
                <td>
                  {result.attemptDelays[0] === undefined
                    ? "—"
                    : `${result.attemptDelays[0]} ms`}
                </td>
                <td>
                  {result.attemptDelays[1] === undefined
                    ? "—"
                    : `${result.attemptDelays[1]} ms`}
                </td>
                <td>{result.attempts}</td>
                <td>
                  <span className={`outcome ${result.outcome.toLowerCase()}`}>
                    {result.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        For HTTP 429, the displayed effective wait honors the simulated
        Retry-After minimum. Random jitter values vary on each run.
      </p>
    </section>
  );
}
