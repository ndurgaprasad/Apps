import { useState } from 'react';
import { ManualDashboard } from './views/ManualDashboard.jsx';
import { QueryDashboard } from './views/QueryDashboard.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('manual');
  const [failureMode, setFailureMode] = useState(false);

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Support desk home"><span className="brand-mark">S</span><span>support<span className="brand-light">desk</span></span></a><div className="topbar-right"><span className="online-dot" /> Demo workspace <span className="avatar">JD</span></div></header>
    <main id="top" className="main-content">
      <div className="page-intro"><div className="breadcrumb">Engineering <span>/</span> Frontend patterns</div><div className="intro-row"><div><span className="eyebrow">DATA FETCHING PLAYGROUND</span><h1>React Server-State Comparison</h1><p className="page-subtitle">Manual Hooks vs TanStack Query</p></div><div className="demo-badge"><span className="demo-dot" /> Local demo</div></div></div>
      <section className="workspace-card">
        <div className="controls-row"><div className="view-switch" role="tablist" aria-label="Data fetching implementation">
          <button role="tab" aria-selected={activeView === 'manual'} className={activeView === 'manual' ? 'view-tab active' : 'view-tab'} onClick={() => setActiveView('manual')}><span className="tab-code">{`{ }`}</span>Manual Hooks</button>
          <button role="tab" aria-selected={activeView === 'query'} className={activeView === 'query' ? 'view-tab active' : 'view-tab'} onClick={() => setActiveView('query')}><span className="tab-query">◉</span>TanStack Query</button>
        </div><label className={`failure-toggle ${failureMode ? 'enabled' : ''}`}><span className="failure-label"><span className="warning-icon">!</span>Failure Mode</span><input type="checkbox" checked={failureMode} onChange={(event) => setFailureMode(event.target.checked)} /><span className="toggle-track" aria-hidden="true"><span /></span></label></div>
        {activeView === 'manual' ? <ManualDashboard failureMode={failureMode} /> : <QueryDashboard failureMode={failureMode} />}
      </section>
      <footer className="page-footer"><span>Requests are served by a local Express API</span><span className="footer-separator">·</span><span>Artificial response delay: 800 ms</span></footer>
    </main>
  </div>;
}
