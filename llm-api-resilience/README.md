# LLM API Resilience Lab

A prepared technical demo for analyzing timeout, retry classification, bounded retries, exponential backoff, and jitter around a deterministic local mock LLM provider. The recording evaluates existing behavior; it does not present the session as live software development.

## Architecture

```text
React UI (5173) → Resilience API (Express, 3001) → resilience.js → local mock provider
```

The UI submits one logical request to `POST /api/requests`. The resilience layer may make multiple physical calls to `POST /mock-provider`. No external LLM, credentials, or API key are used.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:5173](http://localhost:5173). The API health endpoint is [http://localhost:3001/api/health](http://localhost:3001/api/health).

## Experiments

- **Normal response:** HTTP 200 after a randomized 400–700 ms delay.
- **Slow provider:** 4,000 ms modeled provider delay; each call has its own client timeout.
- **Transient HTTP 503:** first two physical attempts fail and the third succeeds, for each logical request.
- **HTTP 500:** repeatable server error, classified retryable in this experiment.
- **HTTP 429:** includes `Retry-After: 1`; the effective wait honors that minimum.
- **HTTP 400:** deterministic client error, classified non-retryable.

Default controls are a 2,000 ms timeout, two retries (three maximum attempts), 500 ms base delay, exponential backoff on, and full jitter on. Full jitter selects an integer delay from zero through the calculated backoff cap. Exponential retry index starts at zero: with 500 ms base, caps are 500 ms, 1,000 ms, then 2,000 ms. The effective 429 wait is the greater of the selected jitter delay and server guidance.

A timeout aborts the resilience layer's provider `fetch`, so the caller stops waiting for that attempt. This local mock does not receive cancellation propagation and may finish its simulated delay after the caller has aborted.

## Demo workflow

1. Establish the normal response baseline.
2. Select Slow Provider and compare the 4,000 ms modeled latency with the timeout budget.
3. Run Transient HTTP 503 and inspect attempt count and calculated/applied retry waits.
4. Run HTTP 400 to show failure classification prevents retry.
5. Inspect HTTP 500 and HTTP 429 behavior, including Retry-After.
6. Run five concurrent requests under Transient HTTP 503 and compare runtime jitter values.
7. Discuss retry amplification, idempotency, latency budgets, and policy trade-offs.

## Project structure

```text
server/mockProvider.js            deterministic local provider scenarios
server/resilience.js              timeout, classification, retry, backoff and jitter
server/server.js                  Express API and mock-provider endpoints
src/api/resilienceApi.js          browser API client
src/components/                   scenario, controls, metrics, trace and table UI
src/App.jsx                       application composition and experiment state
docs/task.md                      Odin Dashboard fields and exact Goal
docs/task-description.md          concise opening brief
docs/recording-transcript.md      presenter reference guide
docs/validation-results.md        observed validation evidence
Metadata.rtf                      Odin metadata
```

## Odin materials

See `docs/task.md`, `docs/task-description.md`, `docs/recording-transcript.md`, `docs/validation-results.md`, and `Metadata.rtf`. Update `Metadata.rtf` after recording if the actual application-switch sequence differs from the planned topology.
