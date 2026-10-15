# React Server-State Comparison

A focused Customer Support Ticket Dashboard comparing component-owned fetching with TanStack Query. Both views use the same local Express endpoint and the same synthetic ticket collection.

## Architecture

- **Manual Hooks:** `useManualTickets` owns data, loading, error, and refresh state per hook instance. The summary and list are separate consumers, so each performs its own request.
- **TanStack Query:** the summary, list, and dashboard status consumer share `['tickets', failureMode]`. QueryClient provides shared cache state, request coordination, and refetch behavior.
- **API:** Express serves 12 deterministic fabricated tickets at `GET /api/tickets`. The response waits 800 ms so loading states are visible.
- **Failure demo:** turn on **Failure Mode** to request `/api/tickets?fail=true`; the API returns HTTP 500 with a JSON message. Turn it off and refresh to recover.

## Run locally

Requires Node.js 20.19+ or 22.12+ for Vite 7.

```bash
npm install
npm start
```

Frontend: [http://localhost:5173](http://localhost:5173)  
API: [http://localhost:3001/api/tickets](http://localhost:3001/api/tickets)

To run either process separately, use `npm run dev` and `npm run server` in separate terminals. The API port can be changed with `PORT`; the frontend API base can be changed with `VITE_API_BASE_URL` before starting Vite.

## Demo outline

1. Open DevTools Network and select **Manual Hooks**. Clear the log and observe initial requests and refresh requests.
2. Switch to **TanStack Query** and inspect the shared query behavior.
3. Switch away and return within 30 seconds to demonstrate fresh cache reuse.
4. Enable **Failure Mode**, inspect the 500 response and error UI, then disable it and refresh.

The views are switched with React state, so changing tabs unmounts the inactive dashboard. React StrictMode is intentionally not enabled to keep the manual effect request demonstration straightforward. TanStack Query uses `staleTime: 30_000`, `retry: false`, and `refetchOnWindowFocus: false` for predictable recording behavior.

See [`docs/recording-transcript.md`](docs/recording-transcript.md) for the complete walkthrough and narration plan.
