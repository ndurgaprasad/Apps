const metrics = [
  { label: 'Total tickets', value: (tickets) => tickets.length, tone: 'indigo' },
  { label: 'Open tickets', value: (tickets) => tickets.filter((ticket) => ticket.status === 'Open').length, tone: 'blue' },
  { label: 'High priority', value: (tickets) => tickets.filter((ticket) => ticket.priority === 'High').length, tone: 'rose' },
  { label: 'Resolved', value: (tickets) => tickets.filter((ticket) => ticket.status === 'Resolved').length, tone: 'green' },
];

export function TicketSummary({ tickets }) {
  return (
    <section className="summary-grid" aria-label="Ticket summary">
      {metrics.map((metric) => (
        <article className="summary-card" key={metric.label}>
          <div className={`summary-icon ${metric.tone}`} aria-hidden="true">{metric.label === 'Total tickets' ? '▦' : metric.label === 'Open tickets' ? '◷' : metric.label === 'High priority' ? '↑' : '✓'}</div>
          <div>
            <p className="summary-label">{metric.label}</p>
            <p className="summary-value">{metric.value(tickets)}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
