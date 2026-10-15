import { useTicketsQuery } from '../hooks/useTicketsQuery.js';
import { ErrorState } from '../components/ErrorState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { TicketList } from '../components/TicketList.jsx';
import { TicketSummary } from '../components/TicketSummary.jsx';
import { DashboardFrame } from './ManualDashboard.jsx';

function QuerySummaryConsumer({ failureMode }) {
  const query = useTicketsQuery(failureMode);
  if (query.isLoading) return <LoadingState />;
  if (query.isError && !query.data) return null;
  return query.data ? <TicketSummary tickets={query.data} /> : null;
}

function QueryListConsumer({ failureMode }) {
  const query = useTicketsQuery(failureMode);
  if (query.isLoading) return <LoadingState />;
  if (query.isError && !query.data) return null;
  return query.data ? <><TicketList tickets={query.data} />{query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}</> : null;
}

export function QueryDashboard({ failureMode }) {
  const query = useTicketsQuery(failureMode);
  const refresh = () => query.refetch();

  return <>
    <DashboardFrame
      label="TanStack Query"
      description="Independent consumers share a query key and server-state cache."
      onRefresh={refresh}
      refreshing={query.isFetching}
    />
    {query.isFetching && !query.isLoading && <div className="fetching-note" role="status"><span className="tiny-spinner" />Refreshing in the background… Current data stays visible.</div>}
    <div className="dashboard-content"><QuerySummaryConsumer failureMode={failureMode} /><QueryListConsumer failureMode={failureMode} />{query.isError && !query.data && <ErrorState error={query.error} onRetry={refresh} />}{query.isError && query.data && <ErrorState error={query.error} onRetry={refresh} />}</div>
  </>;
}
