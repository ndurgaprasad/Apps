export default function ResilienceControls({ config, setConfig, busy, onSend, onConcurrent }) {
  const update = (key, value) => setConfig((current) => ({ ...current, [key]: value }));
  return <section className="panel config-panel"><div className="section-heading"><div><span className="eyebrow">CLIENT POLICY</span><h2>Resilience configuration</h2></div><span className="quiet">Maximum attempts = 1 + retries</span></div>
    <div className="control-grid">
      <label className="field"><span className="field-label">Timeout <b>{config.timeoutMs} ms</b></span><input type="range" min="500" max="5000" step="100" value={config.timeoutMs} onChange={(e) => update('timeoutMs', Number(e.target.value))}/></label>
      <label className="field"><span className="field-label">Maximum retries <b>{config.maxRetries}</b></span><input type="range" min="0" max="4" step="1" value={config.maxRetries} onChange={(e) => update('maxRetries', Number(e.target.value))}/></label>
      <label className="field"><span className="field-label">Base backoff <b>{config.baseDelayMs} ms</b></span><input type="range" min="0" max="1500" step="50" value={config.baseDelayMs} onChange={(e) => update('baseDelayMs', Number(e.target.value))}/></label>
      <label className="toggle"><input type="checkbox" checked={config.exponentialBackoff} onChange={(e) => update('exponentialBackoff', e.target.checked)}/><span><strong>Exponential backoff</strong><small>base × 2<sup>retry index</sup></small></span></label>
      <label className="toggle"><input type="checkbox" checked={config.jitter} onChange={(e) => update('jitter', e.target.checked)}/><span><strong>Full jitter</strong><small>random delay from 0 through the backoff cap</small></span></label>
    </div>
    <div className="actions"><button className="primary" onClick={onSend} disabled={busy}>Send request</button><button className="secondary" onClick={onConcurrent} disabled={busy}>Run 5 concurrent requests</button>{busy && <span className="running"><i/>Running experiment</span>}</div>
  </section>;
}
