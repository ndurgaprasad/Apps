const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function fetchTickets({ failureMode = false, signal } = {}) {
  const url = new URL('/api/tickets', API_BASE_URL);
  if (failureMode) url.searchParams.set('fail', 'true');

  const response = await fetch(url, { signal });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || `Ticket request failed with status ${response.status}`);
  }

  return payload.tickets;
}
