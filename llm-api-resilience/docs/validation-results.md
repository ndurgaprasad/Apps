# Validation results

Validation was performed on 2026-10-16 against the local app started with `npm start` on UI port 5173 and API port 3001. Values below are observed examples; normal latency and jitter values vary between runs.

## Scenario results

| Scenario | Observed result | Evidence |
|---|---|---|
| Normal response | **PASS** — HTTP 200, success, 1 attempt, 0 retries, 452 ms in API run. Browser run also returned HTTP 200 in 680 ms with the expected synthetic response. | `POST /api/requests`; browser metrics and trace. |
| Slow timeout | **PASS** — default 2,000 ms timeout, 2 retries; each attempt timed out at 2,002–2,004 ms; maximum 3 attempts; total 7,509 ms. No final HTTP status because the caller timed out on every attempt. | API trace distinguishes timeout budget and caller stop-waiting event. An additional 500 ms timeout / zero retry run ended after 507 ms. |
| Transient HTTP 503 recovery | **PASS** — HTTP 503, HTTP 503, then HTTP 200; 3 attempts, 2 retries, 2,061 ms with jitter off. | API request trace and observed provider statuses. |
| HTTP 500 | **PASS** — retryable classification; 3 HTTP 500 attempts then bounded stop; final HTTP 500, 2 retries, 2,011 ms with jitter off. | API request trace. This demonstrates this experiment's policy only. |
| HTTP 429 | **PASS** — retryable classification; 3 attempts then bounded stop; each effective wait was 1,000 ms, honoring `Retry-After: 1`; final HTTP 429, 2,327 ms with jitter off. | API trace included Retry-After guidance and effective wait. |
| HTTP 400 | **PASS** — HTTP 400 classified NOT RETRYABLE; stopped after 1 attempt, 0 retries, 84 ms. | API request trace. |
| Exponential backoff | **PASS** — with 500 ms base and jitter off, retry waits were 500 ms and 1,000 ms. `retryIndex` starts at zero. | Transient 503 trace and `calculateBackoff` implementation. |
| Concurrent jitter | **PASS** — five browser-visible clients succeeded in 3 attempts. Observed retry waits (ms): A 442/705; B 236/304; C 443/559; D 83/257; E 474/68. Values were runtime-generated. Separate API run also produced five successful clients with independently sampled waits. | Concurrent request table in the browser; `Promise.all` in `src/App.jsx`. |

## Build and runtime

- **Frontend build: PASS.** `npm run build` completed with Vite 7.3.7; 35 modules transformed and production assets emitted.
- **Local service health: PASS.** `GET http://localhost:3001/api/health` returned `{"status":"ok"}`.
- **Browser rendering and interaction: PASS.** The app loaded at `http://localhost:5173`, the normal scenario completed and displayed its trace and metrics, and the concurrent table rendered five completed successful clients.
- **Browser console: NOT INDEPENDENTLY INSPECTED.** The available browser control exposed page state and screenshots but not DevTools console logs. No UI runtime error was displayed during the observed interactions; this is not a substitute for a console-log audit.
- **App remains usable after experiments: PASS.** Browser controls remained enabled after completion and the concurrent result table populated.

## Notes

- A first integration run uncovered incorrect handling of the provider HTTP status and response body. `server/resilience.js` was corrected to read `response.status` and the top-level JSON response fields. All scenario checks above were run after that correction.
- `AbortController` aborts the resilience layer's provider fetch. The mock provider does not consume a propagated cancellation signal, so its simulated delay can continue after the caller stops waiting.
- Immediate retry is explained conceptually; the UI does not implement a separate immediate-retry mode.
- Update `Metadata.rtf` after recording if the actual application-switch sequence differs from the planned topology.
