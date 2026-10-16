export async function sendRequest(scenario, config) {
  const response = await fetch('/api/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scenario, config }) });
  if (!response.ok) throw new Error(`Resilience API returned HTTP ${response.status}`);
  return response.json();
}
