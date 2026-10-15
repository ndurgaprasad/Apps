# 45-Minute Technical Recording Script

## React Data Fetching: Manual Hooks vs TanStack Query

This guide is a spoken walkthrough, not a general README. Keep it on your second laptop. The recording should show the task Google Doc first, then the code editor and running app.

## Read-aloud and screen cues

- Commas are short breaths. Full stops finish a thought.
- **[PAUSE]** Stop speaking for two seconds.
- **[HOLD]** Keep the screen and cursor still for three seconds so the recording has a clear frame.
- **[POINT]** Move the cursor to the named code or UI, then stop moving it. Do not cover text.
- **[OPEN]** Open the named document or file.
- **[SELECT]** Highlight only the named code block. Keep its function name visible.
- **[DEMO]** Perform the visible browser action.
- **[STOP]** End the recording.

Do not read the bracketed cues aloud. Give each short explanation at a calm pace. The timestamps include showing the screen, waiting for the 800 ms API delay, and pausing for screenshots.

## Before recording

1. In the project terminal, run `npm start`. Keep the terminal running; it starts both Vite and Express.
2. Open `http://localhost:5173`. The API must also be listening on port 3001.
3. Open the task Google Doc. Start recording with that Doc visible.
4. Keep the code editor and browser available to switch between. Open DevTools Network for the live comparisons, and filter it to `tickets`.

If the browser shows “Failed to fetch,” check the terminal and confirm `npm start` is running both processes. A running frontend alone does not start the API.

---

## Part 1 — Show the Google Doc and establish the goal

### 0:00–5:00

**SHOW:** Open the Google Doc with the approved task. Show the task name, business scenario, and the requirements that say to build both Manual Hooks and TanStack Query versions against the same API.

**SAY:**

“I’ll begin with the task brief. The business problem is a support team that needs a dashboard for ticket volume, open work, high-priority tickets, resolved tickets, and the individual ticket queue.”

“The technical goal is to implement the same user-facing behavior twice. The first implementation manages requests with React state and effects. The second uses TanStack Query.”

**[POINT]** Point to the task’s comparison list: loading, error, refresh, repeated requests, multiple consumers, remounting, cache reuse, and freshness.

**SAY:**

“The comparison only means something if the business data and API are held constant. Both versions therefore call the same local endpoint and render the same synthetic ticket collection.”

“I’m not comparing two different designs or two different data sources. I’m isolating one architectural question, where request state lives and how multiple components can share it.”

**[POINT]** Point to the task’s restrictions: no database, external API, router, mutations, or unrelated features.

**SAY:**

“The project stays intentionally narrow. There is no database or external service, so the demo works locally and the request behavior is repeatable. The focus is server-state management.”

**[PAUSE]**

“I’ll first show the project setup and the running application at a high level. Then I’ll trace the request from the Express route, through the shared API client, into each React implementation. I’ll switch back to the browser after each major code path so we can verify its result.”

**[HOLD]**

## Part 2 — Project setup and technology stack

### 5:00–10:00

**SHOW:** Switch to the editor. Open `package.json`.

**[SELECT]** Select lines 6–11, then point to the dependencies at lines 13–22.

**SAY:**

“The project uses React for the interface and Vite for the local frontend server and production build. The code is JavaScript.”

“TanStack Query is installed for the query implementation. Express runs the local REST API, and `concurrently` lets one command start both services.”

“The `start` script runs the API and Vite together. Vite serves port 5173, and the API serves port 3001. The `build` script checks that Vite can create the production frontend bundle.”

**[POINT]** Point to the `dev`, `server`, `start`, and `build` scripts as you name them.

**SHOW:** In the file explorer, show `server`, then `src/api`, `src/hooks`, `src/components`, and `src/views`.

**SAY:**

“The server folder owns the fixture data and HTTP route. The API client is the common boundary between the UI and the server. The hooks folder contains the two fetching strategies.”

“Components such as the summary and list focus on presentation. The view files connect the fetching hooks to those components. This separation lets the same ticket data appear in both views without duplicating the display design.”

**[POINT]** Point to `docs/recording-transcript.md` only briefly; do not show this guide in the recording.

**SAY:**

“The setup is prepared so we can spend the recording on the behavior and the code paths that implement the comparison.”

**[PAUSE] [HOLD]**

## Part 3 — Basic application demo and high-level architecture

### 10:00–15:00

**SHOW:** Switch to `http://localhost:5173`. Keep the page title and both view tabs visible.

**SAY:**

“Before opening the fetching code, I’ll show the dashboard from the user’s point of view. The page has two tabs, but the business view remains the same.”

**[POINT]** Point to each summary metric and read the current visible count. Then point to the ticket table.

**SAY:**

“The summary is derived from the returned tickets. The table shows the same records with their customer, subject, status, and priority.”

**[POINT]** Point to the Failure Mode switch and Refresh Tickets button.

**SAY:**

“Refresh asks the current implementation to request the ticket data again. Failure Mode changes the endpoint so we can see a real HTTP error and then recover without changing server code.”

**[DEMO]** Switch between Manual Hooks and TanStack Query. Do not yet explain the implementation line by line.

**SAY:**

“The selected tab determines which dashboard is mounted. The other one is removed from the React tree. This makes component remounting observable.”

“At a high level, the manual version stores request state in hook instances. TanStack Query stores it in a cache owned by the QueryClient. Next I’ll trace how each version reaches that state.”

**[PAUSE] [HOLD]**

## Part 4 — Trace the API from server to React

### 15:00–20:00

### 15:00–16:30 — Fixed data and deterministic response

**OPEN:** `server/data/tickets.js`.

**[SELECT]** Select the ticket objects.

**SAY:**

“The data file exports twelve fixed ticket objects. Their IDs, customers, subjects, statuses, and priorities are fabricated. Since this array is stable, the same request produces the same dashboard counts every time.”

**[POINT]** Point to one open high-priority ticket and one resolved ticket.

**SAY:**

“These examples also show why the summary values can be computed from the list instead of being separately hard-coded.”

### 16:30–18:00 — Express endpoint

**OPEN:** `server/server.js`.

**[SELECT]** Select lines 4–6, then lines 16–24.

**SAY:**

“The server uses port 3001 by default. `responseDelayMs` is eight hundred milliseconds. The route awaits that delay before either success or failure, so the user can see the loading state.”

“The request is `GET /api/tickets`. If the query parameter `fail` equals true, Express returns status 500 and a JSON message. Otherwise it responds with the ticket array inside a `tickets` property.”

**[POINT]** Point to the delay, the failure branch, and the success response.

**SAY:**

“This gives us a controlled error without editing or restarting the server. It also gives us a known status code to verify in Network.”

### 18:00–20:00 — Shared Fetch client

**OPEN:** `src/api/ticketsApi.js`.

**[SELECT]** Select lines 1–15.

**SAY:**

“Both data-fetching approaches use this same client. The API base URL defaults to localhost port 3001, and it can be overridden through a Vite environment variable.”

“The function uses the URL API to build the endpoint. If failure mode is on, it adds `fail=true`. Fetch then issues the request.”

**[POINT]** Point to lines 7–8.

**SAY:**

“Fetch rejects for network failures, but an HTTP 500 is still a completed HTTP response. That is why this function checks `response.ok` after parsing the JSON.”

**[POINT]** Point to lines 10–14.

**SAY:**

“For a non-success status, the function throws the message supplied by Express. For success, it returns only the ticket array. This keeps HTTP handling shared and makes the fetching-state approach the main difference between the two implementations.”

**[PAUSE] [HOLD]**

## Part 5 — Manual implementation: each code block and the behavior it solves

### 20:00–30:00

### 20:00–22:00 — Manual state ownership

**OPEN:** `src/hooks/useManualTickets.js`.

**[SELECT]** Select lines 1–7.

**SAY:**

“This hook uses `useState`, `useEffect`, and `useCallback`. The three state values have different responsibilities.”

“`data` holds the last successful ticket response. `loading` tells the UI whether a request is in progress. `error` holds a request failure for the UI to display.”

“The initial data is null, loading begins as true, and there is no error yet. This gives the first render enough information to show a loading state.”

**[POINT]** Point to each `useState` declaration as you describe it.

**SAY:**

“This is ordinary React state and it is useful for a small, isolated request. The important architectural property is that this state belongs to one hook instance. Calling this hook in a second component creates another set of these values.”

### 22:00–24:30 — Manual refresh lifecycle

**[SELECT]** Select lines 9–20.

**SAY:**

“This block implements the refresh lifecycle explicitly. First it sets loading to true and clears an earlier error. Then it awaits the shared API client.”

“On success, it replaces data with the returned tickets. In the catch block it stores the error. The finally block ends loading whether the request succeeds or fails.”

**[POINT]** Point through `setLoading`, `setError`, `try`, `catch`, and `finally` in that order.

**SAY:**

“`useCallback` keeps the refresh function stable until `failureMode` changes. That dependency matters because a refresh must request the currently selected endpoint mode.”

“This block solves refresh for one manual hook instance. The dashboard still has to coordinate the refresh functions from both consumers.”

### 24:30–27:00 — Manual initial request and cleanup

**[SELECT]** Select lines 22–41.

**SAY:**

“The effect starts the initial request when the component mounts, and it runs again if failure mode changes.”

“The `active` flag is a cleanup guard. If this component unmounts before the request completes, the callbacks do not write the result into state.”

**[POINT]** Point to `let active = true`, the success and error callbacks, and `active = false` in cleanup.

**SAY:**

“This guard prevents a stale state update, but it does not abort the HTTP request. The request may still finish on the network. TanStack Query receives an AbortSignal in its query function, which can be passed through to Fetch.”

“The initial effect has its own promise handling instead of calling `refresh`. That means the lifecycle code is visible here, but the request and error-handling pattern appears in two places.”

**[POINT]** Point to the return object at line 43.

**SAY:**

“The returned object is the small API that each consumer uses. It is readable, but this hook itself does not provide a shared cache, freshness policy, or request deduplication.”

### 27:00–28:30 — What creates repeated manual requests

**OPEN:** `src/views/ManualDashboard.jsx`.

**[SELECT]** Select lines 8–21.

**SAY:**

“Here is the key comparison point. `ManualSummaryConsumer` calls `useManualTickets`, and `ManualListConsumer` calls `useManualTickets` separately.”

“Because the hook stores state locally and has an effect in each instance, each consumer starts and manages its own request. Neither component knows that the other one is loading the same URL.”

“This is not a defect in React Hooks. It is the behavior of this deliberately uncached manual design. For a single component, it can be perfectly reasonable. Coordination becomes additional application work when several components need the same resource.”

**[POINT]** Point at the two hook calls, one after the other.

### 28:30–30:00 — What manual UI does with each state

**[POINT]** Point at lines 11–13 and 19–21.

**SAY:**

“Each consumer checks its own error, then its initial loading state, then renders its presentation component when data exists.”

“That is why a failed manual request can show two error cards, one for the summary consumer and one for the list consumer. Each card reflects a separate hook instance.”

**[SELECT]** Select lines 24–39.

**SAY:**

“The dashboard holds both refresh callbacks in refs. The toolbar invokes both callbacks with `Promise.all`. This solves the practical problem of refreshing both consumers from one button, but the dashboard has to wire the two hook instances together.”

**[PAUSE] [HOLD]**

## Part 6 — Manual browser proof

### 30:00–34:00

**SHOW:** Browser, Manual Hooks selected. Open Network, clear it, and filter for `tickets`.

**SAY:**

“The code predicts that these are two independent manual consumers. I’ll verify the actual browser requests instead of assuming an exact count.”

**[DEMO]** Select Manual Hooks or switch away and back to trigger a fresh mount. Point to loading while the request runs.

**SAY:**

“The loading state appears while the API delay is in progress. After the response, both the summary and list display the same ticket data.”

**[POINT]** Point to each summary count, then the ticket rows.

**[POINT]** Point to the Network request entries, status, and timing.

**SAY:**

“The Network panel shows what the browser really sent. This is the evidence for repeated requests in this run.”

**[DEMO]** Click Refresh Tickets.

**SAY:**

“The toolbar calls both manual refresh functions. I can observe the new requests here. The UI has no shared manual cache, so a refresh is coordinated by the dashboard rather than by a common server-state layer.”

**[PAUSE] [HOLD]**

## Part 7 — TanStack Query: identify the improvement in each block

### 34:00–41:00

### 34:00–36:00 — QueryClient and provider

**OPEN:** `src/main.jsx`.

**[SELECT]** Select lines 7–15.

**SAY:**

“The QueryClient is created once outside the React component tree. It owns the cache that lets query data outlive an individual dashboard component.”

“The defaults set a thirty second stale time, disable retry for the controlled error, and disable refetch-on-focus so switching focus does not add unrelated requests.”

**[POINT]** Point to each of the three values.

**[SELECT]** Select lines 17–21.

**SAY:**

“The provider places this client above the app. Both dashboard implementations can reach the same client, even though the selected dashboard itself unmounts when we change tabs.”

“That client lifetime is the structural change that makes cache reuse possible across the view switch.”

### 36:00–38:30 — Query key, function, and options

**OPEN:** `src/hooks/useTicketsQuery.js`.

**[SELECT]** Select lines 4–12.

**SAY:**

“This hook maps the API request to a query. The query key is `tickets` plus the failure mode. Query keys identify the data being cached, so parameters that change the response belong in the key.”

“With failure mode off, all the consumers ask for the same successful ticket resource. With failure mode on, the key changes because the server response is expected to be an error.”

**[POINT]** Point to `queryFn`.

**SAY:**

“The query function uses the same API client. It forwards TanStack Query’s AbortSignal to Fetch. That connects query cancellation to the underlying browser request.”

**[POINT]** Point to each option.

**SAY:**

“`staleTime` says how long successful data is considered fresh. While it is fresh, a remounted observer can reuse it without a mount-triggered request.”

“`retry: false` makes the controlled error appear after the first failed response. `refetchOnWindowFocus: false` prevents focus changes from affecting the Network comparison.”

“These values are chosen for this recording. They are not universal production settings.”

### 38:30–41:00 — Shared consumers, refetch, and fetching states

**OPEN:** `src/views/QueryDashboard.jsx`.

**[SELECT]** Select lines 8–20.

**SAY:**

“The summary and list each call `useTicketsQuery` with the same failure-mode value. They are separate observers of the same keyed query.”

“The dashboard also calls the hook to drive its toolbar and top-level error display. So there are three observers of this key in this view, the summary, the list, and the dashboard.”

“When observers use the same QueryClient and query key, TanStack Query shares query state and can deduplicate overlapping in-flight work. I’ll verify actual requests in the browser rather than making a claim from the code alone.”

**[SELECT]** Select lines 22–35.

**SAY:**

“The dashboard’s refresh function calls `refetch`. Its `isFetching` value disables the button and displays the small background indicator.”

“Initial loading means there is no data yet. A background refetch is a later request while cached data can remain on screen. That distinction is visible here because this dashboard keeps its query data rendered during refresh.”

**[POINT]** Point to `query.refetch`, `query.isFetching`, and the fetching message.

**[PAUSE] [HOLD]**

## Part 8 — TanStack browser proof: request reuse, refresh, remount

### 41:00–43:00

**SHOW:** Browser, select TanStack Query, clear Network, filter for `tickets`.

**SAY:**

“I’ve cleared the request list. I’ll mount the TanStack dashboard and observe its initial query.”

**[DEMO]** Select TanStack Query. Point to loading, then to the loaded metrics and list.

**SAY:**

“The dashboard shows the same data as Manual Hooks. I’ll inspect the Network entries to see the request behavior for the consumers sharing this key.”

**[POINT]** Point to the observed request entries.

**[DEMO]** Click Refresh Tickets and point to the background indicator.

**SAY:**

“The explicit refetch produces a request even if the cached value is still fresh. The current data remains visible while `isFetching` reports the request.”

**[PAUSE]**

**[DEMO]** Switch to Manual Hooks and back to TanStack Query within thirty seconds of the successful result.

**SAY:**

“The Query dashboard unmounted and mounted again. The QueryClient stayed alive above it. I’m checking whether the fresh cache is reused and whether another request appears.”

**[POINT]** Point to the loaded dashboard and Network panel.

**SAY:**

“The code provides a thirty second freshness window. The Network panel tells us what happened in this specific run.”

## Part 9 — Error, recovery, and compare the actual improvement

### 43:00–44:00

**SHOW:** TanStack Query selected, Network visible.

**[DEMO]** Turn on Failure Mode. Wait for the 500 response and error display.

**SAY:**

“Failure Mode changes the query key and adds `fail=true` to the endpoint. Express returns HTTP 500. The API client throws the message, and the query moves into its error state. Retry is disabled, so this is one controlled failure.”

**[POINT]** Point to HTTP 500 and the error message.

**[DEMO]** Turn off Failure Mode. Wait for the normal dashboard to return.

**SAY:**

“Turning failure mode off selects the normal ticket query. The successful data returns and the dashboard recovers.”

## Part 10 — Final technical conclusion and delivered work

### 44:00–45:00

**SHOW:** Healthy dashboard with both implementation tabs visible.

**SAY:**

“The improvement is not that manual Hooks are wrong. The manual version is explicit and reasonable for a small, isolated request. Its state belongs to each hook instance, so multiple consumers require separate requests and dashboard-level coordination.”

“TanStack Query moves that server state into a shared cache. The common query key connects consumers to the same resource, while stale time defines freshness and `refetch` handles deliberate updates. This reduces the amount of request coordination application code must own.”

“I delivered the React and Vite dashboard, the Manual Hooks and TanStack Query implementations, the local Express API with deterministic ticket data and failure mode, and the recording guide. I verified the API responses, both dashboard states, refresh, error and recovery, and the remount behavior in the browser.”

**[POINT]** Point to the two tabs, the metric cards, and the ticket list.

**[HOLD] [STOP]**

---

## Exact file and code selection map

Use editor line numbers or search for the function name. Select only the relevant block and keep its function/component name visible.

| Order | File | Select | Problem this block solves |
|---|---|---|---|
| 1 | Google Doc | Goal and required comparison | Defines what the two implementations must demonstrate |
| 2 | `package.json` | Lines 6–22 | Identifies stack, dependencies, and run/build commands |
| 3 | `server/data/tickets.js` | Ticket object array | Supplies repeatable data for both dashboards |
| 4 | `server/server.js` | Lines 4–6, 16–24 | Local endpoint, visible delay, controlled failure and success |
| 5 | `src/api/ticketsApi.js` | Lines 1–15 | Shared URL construction, Fetch, HTTP error handling |
| 6 | `src/hooks/useManualTickets.js` | Lines 4–7 | Manual ownership of data/loading/error |
| 7 | `src/hooks/useManualTickets.js` | Lines 9–20 | Manual refresh success/error lifecycle |
| 8 | `src/hooks/useManualTickets.js` | Lines 22–43 | Initial request, cleanup guard, hook return contract |
| 9 | `src/views/ManualDashboard.jsx` | Lines 8–21 | Two separate hook instances create independent consumers |
| 10 | `src/views/ManualDashboard.jsx` | Lines 24–39 | Wires both manual refresh functions to one control |
| 11 | `src/main.jsx` | Lines 7–21 | Shared QueryClient lifetime and provider |
| 12 | `src/hooks/useTicketsQuery.js` | Lines 4–12 | Key-based shared query, freshness, retries and focus behavior |
| 13 | `src/views/QueryDashboard.jsx` | Lines 8–20 | Summary and list observe the same query key |
| 14 | `src/views/QueryDashboard.jsx` | Lines 22–35 | Refetch, `isFetching`, shared error presentation |
| 15 | Browser | Manual then Query views | Network evidence, loading, refresh, remount, error and recovery |

## Code-to-improvement summary

| Manual code/problem | TanStack code/improvement |
|---|---|
| `useState` creates data, loading, and error for every hook instance. | `useQuery` stores server state in the QueryClient cache and exposes lifecycle state to each observer. |
| The effect in each consumer independently calls `fetchTickets`. | Matching `queryKey` values identify the same resource and let observers share query state and coordinate overlapping work. |
| The dashboard collects two refresh callbacks and invokes both. | The shared query observer exposes `refetch` for the resource. |
| Local state disappears when the manual consumer unmounts. | The QueryClient remains mounted above the view tabs, allowing a fresh cache entry to be reused after remount. |
| There is no manual freshness rule. | `staleTime: 30_000` defines a visible freshness period. |
| Each manual consumer catches and displays its own failure. | A failed shared query has one query error state; this dashboard presents the message at the top-level observer. |
| Cleanup prevents late state updates but does not abort the manual fetch. | The query function forwards TanStack’s `AbortSignal` to Fetch. |

## 45-minute timing check

| Time | Segment |
|---|---|
| 0:00–5:00 | Google Doc and task goal |
| 5:00–10:00 | Project setup and technology stack |
| 10:00–15:00 | Basic application tour and high-level architecture |
| 15:00–20:00 | REST API and shared API client |
| 20:00–30:00 | Manual hook code, purpose of each block, manual consumer wiring |
| 30:00–34:00 | Manual browser and Network verification |
| 34:00–41:00 | QueryClient, query key/options, query consumers and fetching states |
| 41:00–43:00 | TanStack refresh and remount/cache demo |
| 43:00–44:00 | Failure and recovery |
| 44:00–45:00 | Technical conclusion and deliverables |

If a request takes longer to settle, wait for it and shorten the project-tree tour. Keep the task goal, code-to-behavior explanations, Network evidence, and final comparison; those are the core evaluation points.
