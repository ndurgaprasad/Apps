function StatusBadge({ status }) {
  const tone = status === 'Open' ? 'status-open' : status === 'Resolved' ? 'status-resolved' : 'status-progress';
  return <span className={`badge ${tone}`}><span className="badge-dot" />{status}</span>;
}

function PriorityBadge({ priority }) {
  const tone = priority === 'High' ? 'priority-high' : priority === 'Medium' ? 'priority-medium' : 'priority-low';
  return <span className={`priority ${tone}`}><span aria-hidden="true">{priority === 'High' ? '↑' : priority === 'Medium' ? '→' : '↓'}</span>{priority}</span>;
}

export function TicketList({ tickets }) {
  return (
    <section className="ticket-panel" aria-labelledby="tickets-heading">
      <div className="panel-heading">
        <div><h2 id="tickets-heading">Recent tickets</h2><p>Support requests across your workspace</p></div>
        <span className="count-pill">{tickets.length} tickets</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ticket</th><th>Customer &amp; subject</th><th>Status</th><th>Priority</th></tr></thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="ticket-id">#{ticket.id}</td>
                <td><div className="customer-name">{ticket.customer}</div><div className="ticket-subject">{ticket.subject}</div></td>
                <td><StatusBadge status={ticket.status} /></td>
                <td><PriorityBadge priority={ticket.priority} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
