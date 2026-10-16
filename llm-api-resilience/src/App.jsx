import { useState } from "react";
import { sendRequest } from "./api/resilienceApi.js";
import ScenarioSelector from "./components/ScenarioSelector.jsx";
import ResilienceControls from "./components/ResilienceControls.jsx";
import MetricsPanel from "./components/MetricsPanel.jsx";
import RequestTrace from "./components/RequestTrace.jsx";
import ConcurrentResults from "./components/ConcurrentResults.jsx";

const initialConfig = {
  timeoutMs: 2000,
  maxRetries: 2,
  baseDelayMs: 500,
  exponentialBackoff: true,
  jitter: true,
};
export default function App() {
  const [scenario, setScenario] = useState("normal");
  const [config, setConfig] = useState(initialConfig);
  const [result, setResult] = useState(null);
  const [concurrentResults, setConcurrentResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function runOne() {
    setBusy(true);
    setError("");
    setConcurrentResults(null);
    try {
      setResult(await sendRequest(scenario, config));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function runConcurrent() {
    setBusy(true);
    setError("");
    setConcurrentResults(null);
    setResult(null);
    try {
      setConcurrentResults(
        await Promise.all(
          Array.from({ length: 5 }, () => sendRequest(scenario, config)),
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand-mark">LR</div>
        <div className="brand-name">
          Resilience Lab <span>TECHNICAL DEMO</span>
        </div>
        <div className="topbar-right">
          <span className="local-dot" />
          LOCAL MOCK ENVIRONMENT
        </div>
      </header>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">
            SYSTEMS ENGINEERING <span>/</span> DEPENDENCY RELIABILITY
          </div>
          <h1>LLM API Resilience Lab</h1>
          <p>Timeout, Retry, Exponential Backoff and Jitter</p>
        </div>
        <div className="architecture-pill">
          <span>APP</span>
          <b>→</b>
          <span>RESILIENCE API</span>
          <b>→</b>
          <span>MOCK LLM</span>
        </div>
      </div>
      <div className="workspace">
        <section className="panel scenario-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPERIMENT SETUP</span>
              <h2>Provider scenario</h2>
            </div>
            <span className="step-number">01</span>
          </div>
          <ScenarioSelector value={scenario} onChange={setScenario} />
          <div className="scenario-note">
            <span className="note-icon">i</span>
            <p>
              All provider behavior is simulated locally. No API key or external
              LLM request is used.
            </p>
          </div>
        </section>
        <ResilienceControls
          config={config}
          setConfig={setConfig}
          busy={busy}
          onSend={runOne}
          onConcurrent={runConcurrent}
        />
        <div className="results-grid">
          <MetricsPanel result={result} config={config} />
          <RequestTrace result={result} error={error} />
        </div>
        <ConcurrentResults results={concurrentResults} />
      </div>
      <footer>
        <span>LLM API RESILIENCE LAB</span>
        <span>Prepared implementation · analysis and validation session</span>
        <span>API :3001&nbsp;&nbsp; / &nbsp;&nbsp;UI :5173</span>
      </footer>
    </main>
  );
}
