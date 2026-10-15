import { useCallback, useRef } from 'react';
import { useManualTickets } from '../hooks/useManualTickets.js';
import { ErrorState } from '../components/ErrorState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { TicketList } from '../components/TicketList.jsx';
import { TicketSummary } from '../components/TicketSummary.jsx';

function ManualSummaryConsumer({ failureMode, onRefreshReady }) {
  const { data, loading, error, refresh } = useManualTickets(failureMode);
  onRefreshReady(refresh);
  if (error) return <ErrorState error={error} />;
  if (loading && !data) return <LoadingState />;
  return data ? <TicketSummary tickets={data} /> : null;
}

function ManualListConsumer({ failureMode, onRefreshReady }) {
  const { data, loading, error, refresh } = useManualTickets(failureMode);
  onRefreshReady(refresh);
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (loading && !data) return <LoadingState />;
  return data ? <TicketList tickets={data} /> : null;
}

export function ManualDashboard({ failureMode }) {
  const summaryRefresh = useRef(null);
  const listRefresh = useRef(null);
  const refresh = useCallback(() => Promise.all([summaryRefresh.current?.(), listRefresh.current?.()]), []);

  return (
    <DashboardFrame
      label="Manual Hooks"
      description="Each component owns its request lifecycle with useState, useEffect, and fetch."
      onRefresh={refresh}
      refreshing={false}
    >
      <ManualSummaryConsumer failureMode={failureMode} onRefreshReady={(handler) => { summaryRefresh.current = handler; }} />
      <ManualListConsumer failureMode={failureMode} onRefreshReady={(handler) => { listRefresh.current = handler; }} />
    </DashboardFrame>
  );
}

function DashboardFrame({ label, description, onRefresh, refreshing, children }) {
  return <>
    <div className="implementation-heading"><div><span className="eyebrow">CURRENT IMPLEMENTATION</span><h2>{label}</h2><p>{description}</p></div>
      <button className="button button-secondary" onClick={onRefresh} disabled={refreshing}><span className={refreshing ? 'refresh-icon spinning' : 'refresh-icon'}>↻</span> Refresh Tickets</button>
    </div>
    <div className="dashboard-content">{children}</div>
  </>;
}

export { DashboardFrame };
