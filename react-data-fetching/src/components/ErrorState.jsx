export function ErrorState({ error, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-mark">!</div>
      <div className="error-copy"><strong>Unable to load tickets</strong><span>{error?.message || 'Please try again.'}</span></div>
      {onRetry && <button className="button button-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}
