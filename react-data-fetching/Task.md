# Task Title

React Data Fetching — Manual Hooks vs TanStack Query

## Goal — What are you trying to accomplish?

Present and explain a completed React Customer Support Ticket Dashboard that compares manual API data fetching with TanStack Query.

The working application is already implemented before the 45-minute recording. The recording will be an explanation and verification walkthrough, not a live coding session. I will first show the approved task goal in Google Docs, then introduce the completed project and technology stack, give a high-level tour of the UI, and explain the important code blocks alongside the corresponding browser behavior.

The completed application has two views of the same dashboard:

- **Manual Hooks:** `useEffect`, `useState`, and Fetch manage ticket data, loading, errors, and refresh behavior in each hook instance.
- **TanStack Query:** `QueryClient`, `QueryClientProvider`, `useQuery`, a query key, `staleTime`, `refetch`, and fetching-state indicators manage the same ticket resource through a shared query cache.

The walkthrough will compare how the two approaches behave when separate dashboard consumers request the same server data, when the views unmount and mount again, during manual refresh, and when the API returns a controlled error. The goal is to explain the implementation choices and report what is actually visible in the browser and Network panel.

## Starting Point — What is already available?

Using existing material. The completed React + Vite application and local Node.js REST API are available before recording. No feature implementation is planned during the recording.

The project already contains:

- React and Vite project structure, dependencies, and run/build scripts
- The completed dashboard shell and navigation between Manual Hooks and TanStack Query views
- The completed Manual Hooks fetching hook and its two independent dashboard consumers
- The completed TanStack Query client/provider setup, reusable ticket query, and query consumers
- Equivalent ticket summary, ticket list, loading, error, refresh, and failure-mode UI
- A Node.js/Express REST API with a deterministic 800 ms response delay and `?fail=true` HTTP 500 mode
- Twelve synthetic support tickets and reusable presentation components
- Shared CSS styling
- The approved Google Docs task-description document
- `docs/recording-transcript.md`, the detailed 45-minute technical narration and screen-selection guide

The recording will inspect and explain this completed code. It will not implement missing hooks, configure the query client, add components, or type new features. During the UI walkthrough, the app will be run locally and browser behavior will be demonstrated.

## Apps

- **Visual Studio Code:** Open the completed project, navigate to the important implementation blocks, and show the integrated terminal when needed.
- **Microsoft Edge:** Display the local application and inspect its Network and Console panels.
- **Google Docs (not via Chrome):** Display the approved task goal at the beginning of the recording.
- **Node.js:** Runs Vite and the local Express API through the project terminal using `npm start`.

## Result and Checks — What will you actually create, analyze, or decide?

No new application code will be created during the recording. The deliverable already exists as a working reference implementation. The recording will present and explain these completed results:

1. Show the dashboard UI, its ticket summary and ticket list, then switch between the two implementations.
2. Explain the manual hook in `src/hooks/useManualTickets.js`: component-owned `data`, `loading`, and `error`; the `refresh` lifecycle; the initial effect; and the unmount cleanup guard.
3. Explain `src/views/ManualDashboard.jsx`: why the summary and list create separate manual hook instances, how that can produce repeated requests, and how the dashboard wires both refresh functions to its button.
4. Explain `src/api/ticketsApi.js` and `server/server.js`: shared Fetch behavior, the `response.ok` check, the response delay, and the controlled failure response.
5. Explain `src/main.jsx` and `src/hooks/useTicketsQuery.js`: the shared QueryClient and provider, `['tickets', failureMode]`, the 30-second `staleTime`, disabled retries, and disabled focus refetching.
6. Explain `src/views/QueryDashboard.jsx`: the summary, list, and dashboard observers use the same query key; how `refetch` works; and how `isLoading` differs from background `isFetching`.
7. Demonstrate both approaches in the browser and compare their actual Network activity, refresh behavior, remount behavior, error display, and recovery.
8. Conclude with an evidence-based comparison: manual fetching is reasonable for isolated requests, while a shared query cache can reduce coordination work when several components depend on the same server resource.

## How will you verify the result?

Run the completed application with `npm start` and use Microsoft Edge at `http://localhost:5173`. Keep the terminal running so both Vite and the API remain available.

Verify the existing implementation during the walkthrough:

- Open each view and confirm the same twelve tickets and summary values render.
- Use the Network panel, filtered to `tickets`, to inspect the requests from Manual Hooks and TanStack Query. Describe the requests actually shown; do not claim an assumed request count.
- Click Refresh Tickets in each view and verify the resulting Network activity. In TanStack Query, observe the background fetching indicator while existing data remains visible.
- Switch away from and back to each view. For TanStack Query, return within 30 seconds of a successful response and check whether fresh cached data is reused; use Network activity as the evidence.
- Enable Failure Mode and confirm the request returns HTTP 500 and the UI displays the server error. Disable it and confirm that the successful response restores the dashboard.
- Inspect the Edge Console for unexpected runtime errors during the demonstration.
- The project has already been installed and its production build has succeeded with `npm run build`; keep this as a pre-recording validation rather than a live coding activity.

## Previous Work

New task. The completed reference application and recording transcript are prepared before the demonstration. This recording explains and verifies that work; it does not begin implementation from scratch.
