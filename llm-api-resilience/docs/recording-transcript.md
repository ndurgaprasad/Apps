# Recording Guide: LLM API Resilience Lab

**Target recording time: approximately 45 minutes.** The times include code inspection, UI actions, waiting for the experiments, reading the live values, and explaining what the values mean. Keep the code ready before recording. The work shown is analysis and validation of the existing implementation.

For the opening, show the approved Goal in Google Docs first and introduce the app for about 45 seconds before switching to the app. For each technical walkthrough after the opening, show the code snippet first, then use the **UX Action**, **Where and How**, and **What to Say** notes. The snippets below are from the current project. Jitter values and request durations will change each run, so read the values shown on screen.

## Run plan

| Section | Time |
|---|---:|
| 1. Goal in Google Docs and app introduction | 45 sec |
| 2. Architecture and request boundaries | 4 min 45 sec |
| 3. Normal baseline | 3 min |
| 4. Slow provider and timeout budget | 5 min |
| 5. Transient failure and bounded retries | 4 min 30 sec |
| 6. Failure classification, HTTP 400 and HTTP 429 | 4 min |
| 7. Immediate retry and amplification | 3 min 30 sec |
| 8. Exponential backoff | 5 min |
| 9. Full jitter | 4 min |
| 10. Five concurrent requests | 4 min 30 sec |
| 11. Configuration and trade-offs | 3 min |
| 12. Evidence review and conclusion | 3 min |
| **Total** | **45 min** |

## 1. Goal in Google Docs and app introduction — 45 seconds

### On-screen Goal to show first

Show the complete approved Goal from `docs/task.md` in Google Docs. Keep all four paragraphs visible as the task Goal; do not shorten or paraphrase them:

> Analyze and validate an existing LLM API resilience implementation that protects an application from slow and temporarily failing AI-provider requests.
>
> The application simulates common downstream failure conditions including slow responses, transient HTTP errors, rate limiting, and non-retryable client errors. The existing resilience layer applies configurable request timeouts, bounded retry policies, failure classification, exponential backoff, and jitter.
>
> During the analysis, controlled provider scenarios will be executed to observe how each mechanism affects request attempts, latency, retry timing, and final outcomes. Request traces and browser-visible metrics will be used to explain why immediate retries can amplify failures, why retries should be limited to appropriate transient conditions, how exponential backoff reduces retry pressure, and how jitter helps prevent synchronized retry traffic across multiple clients.
>
> The final result will be an evidence-based technical evaluation of the resilience strategy, including the trade-offs involved in selecting timeout values, retry limits, and backoff behavior for LLM integrations.

### UX Action

Open the approved task description in Google Docs in Microsoft Edge. Keep the Goal visible while giving the short app introduction below. After approximately 45 seconds, switch to Microsoft Edge at `http://localhost:5173/` and show the running app.

### Where and How

- Google Docs content: show the complete, exact Goal in `docs/task.md`. The concise opening brief is `docs/task-description.md`.
- After the introduction, app path: `http://localhost:5173/`.
- On the app, point to the title, subtitle, and “LOCAL MOCK ENVIRONMENT” label.

### What to Say

“Today I’ll analyse and validate an existing LLM API resilience application. It has a React interface and a local Node.js mock provider. I’ll show how it handles slow responses and temporary HTTP failures using a timeout, retry classification, a retry limit, exponential backoff, and jitter. I’ll run the scenarios and explain the request traces, timing, and trade-offs. The code is already prepared, and the provider is simulated locally. I’ll start with the application now.”

Keep the Goal visible while you give this approximately 45-second introduction; do not use the introduction to read every Goal paragraph. After about 45 seconds, switch to the app, point out its title and local mock label, and begin the application walkthrough. Open VS Code only after the app has been introduced.

## 2. Architecture and request boundaries — 4 minutes 45 seconds

### Code snippet to show first

```js
// src/App.jsx
async function runOne() {
  setBusy(true);
  setError("");
  setConcurrentResults(null);
  try {
    setResult(await sendRequest(scenario, config));
  } catch (e) {
    setError(e.message);
  } finally {
    setBusy(false);
  }
}
```

```js
// src/api/resilienceApi.js
export async function sendRequest(scenario, config) {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scenario, config }),
  });
  if (!response.ok)
    throw new Error(`Resilience API returned HTTP ${response.status}`);
  return response.json();
}
```

### UX Action

In VS Code open `src/App.jsx`, `src/api/resilienceApi.js`, `server/server.js`, `server/resilience.js`, and `server/mockProvider.js` in that order. Use the browser’s architecture pill to orient the viewer, then return to the source.

### Where and How

- UI state and `runOne`: `src/App.jsx`, lines 16–34.
- Browser request: `src/api/resilienceApi.js`, `sendRequest`, lines 1–10.
- API routes: `server/server.js`, `POST /api/requests` at lines 16–49 and `POST /mock-provider` at lines 9–15.
- Policy and provider boundary: `server/resilience.js`, `runResilientRequest` and `providerAttempt`.
- Scenarios: `server/mockProvider.js`, `mockProvider`.

### What to Say

“The React page collects the scenario and configuration. `runOne` makes one logical request from the user’s point of view. `sendRequest` sends that configuration to the Express endpoint, `POST /api/requests`. Express passes it to `runResilientRequest`. That function owns retry policy and makes one or more physical calls to the local mock provider.”

“Let us keep two counts separate. A logical request is the user action, such as clicking Send Request. A physical attempt is one provider call. One logical request can therefore create one, two, or several physical attempts. The retry count is the extra physical attempts after the initial one.”

“In `server.js`, the API route accepts the user’s scenario and config, checks that the scenario is supported, then normalises the settings. The policy method returns a result containing attempts, retry count, duration, final status, trace events, and any waits. The React page displays those values.”

“The provider boundary is local. `POST /mock-provider` calls `mockProvider`, which waits for the configured simulated latency and returns a status and response body. It does not call an outside model. That makes the scenarios predictable enough for analysis, but it does not measure a real provider’s performance.”

Follow the request from the UI into the browser API, through the Express route, and into the retry method. Explain that this separation helps us locate each decision: the UI chooses settings, the API validates inputs, the resilience layer decides whether and when to retry, and the provider simulation supplies controlled outcomes.

## 3. Normal baseline — 3 minutes

### Code snippet to show first

```js
if (scenario === "normal") {
  const latencyMs = 400 + Math.floor(Math.random() * 301);
  await wait(latencyMs);
  return {
    status: 200,
    latencyMs,
    body: {
      response: "The simulated LLM successfully processed the request.",
    },
  };
}
```

### UX Action

In the UI select **Normal response**. Leave all controls at their defaults and click **Send request**. Let the request complete. Read the outcome, physical attempts, duration, HTTP status, retries, and the final trace lines aloud.

### Where and How

- Provider behaviour: `server/mockProvider.js`, `mockProvider`, lines 5–15.
- Request path: UI **Send request** → `runOne` in `src/App.jsx` → `sendRequest` → `POST /api/requests`.
- Result display: `src/components/MetricsPanel.jsx`, `MetricsPanel`; trace display: `src/components/RequestTrace.jsx`, `RequestTrace`.

### What to Say

“This is our baseline. The normal scenario selects a delay from 400 through 700 milliseconds, waits for that amount, and returns HTTP 200 with a synthetic response. It is intentionally simple: there is no failure and no retry.”

“Now I’ll compare the configured two-second timeout with the actual provider time shown in the trace. The request should finish well within its timeout budget, so the expected outcome is Success, one physical attempt, zero retries, and HTTP 200.”

Read the actual metric values. “The total duration is the time measured by the resilience layer around the logical request. It includes the provider wait and small local processing overhead. It can differ slightly from the provider’s modeled latency because the timer measures the whole local request path.”

“The result text is synthetic. It confirms that the normal mock scenario returned its prepared response. It does not claim that a language model generated this sentence.”

Explain why a baseline is useful. When we later introduce failure, we can compare additional attempts and elapsed time with this one-attempt path. A resilience mechanism should preserve the normal path without adding retry waits when no failure happened.

Confirm the trace has one attempt start, an HTTP 200 response, and a completion event. If the values differ from the previous run, read the new values. Do not memorise a fixed duration.

## 4. Slow provider and timeout budget — 5 minutes

### Code snippet to show first

```js
// server/resilience.js: one provider call and its timeout
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch("http://localhost:3001/mock-provider", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ scenario, attempt, requestId }),
    signal: controller.signal,
  });
  const result = await response.json();
  return { ...result, status: response.status };
} finally {
  clearTimeout(timer);
}
```

```js
// server/mockProvider.js
if (scenario === "slow") {
  await wait(4000);
  return {
    status: 200,
    latencyMs: 4000,
    body: { response: "Slow simulated response completed." },
  };
}
```

### UX Action

Select **Slow provider**. Keep the timeout at 2,000 ms and maximum retries at two. Click **Send request** and wait for the final result. Read the trace’s modeled provider latency and per-attempt timeout budget before reading the timeout events and backoff waits.

### Where and How

- Timeout setup and cleanup: `server/resilience.js`, `providerAttempt`, lines 32–60.
- Slow scenario: `server/mockProvider.js`, `mockProvider`, lines 16–23.
- Timeout error and retry handling: `server/resilience.js`, `runResilientRequest`, lines 160–195.
- Visible experiment: UI **Provider scenario → Slow provider**, then **Send request**.

### What to Say

“The mock is configured to take four seconds. The resilience layer gives each physical provider call a two-second timeout budget. That is why the trace explicitly prints both values. The provider’s modeled latency is four seconds; the caller’s wait budget for one attempt is two seconds.”

“`providerAttempt` creates an `AbortController`, starts a timer, and passes its signal into the local fetch. When the timer fires, the controller aborts that fetch. The catch block recognises the abort and turns it into a timeout error. The `finally` block clears the timer after the attempt ends, including when it ends with an error.”

“Read the first timeout line. The caller stopped waiting after about two seconds, even though the mock provider was configured for four seconds. Timeouts are classified as retryable in this experiment, so the retry policy may make another attempt. With two retries, the maximum is three physical attempts. The overall duration can therefore be much longer than the two-second timeout value because that value is per attempt, and backoff also adds time.”

“Please notice what this timeout does not prove. It proves that this code aborted its fetch and stopped waiting for that response. The mock provider does not listen for a cancellation signal from the resilience layer. Its own timer can continue and finish after the caller has given up. In a real system, cancellation needs to be propagated and supported at each layer before we claim downstream work has stopped.”

“A timeout is a budget for latency and resource use. If it is too high, requests may hold resources while waiting on a dependency that is not meeting the application’s needs. If it is too low, normal provider variation can cause false timeouts. Those false timeouts may create retries and extra traffic even when the first provider request was close to completing.”

Use the trace as evidence: point out the 4,000 ms modeled latency, 2,000 ms per-attempt budget, each timeout, each wait, and the final attempt limit. Compare the total duration with the per-attempt budget. Explain that an overall deadline would be a separate limit; this demo does not implement one.

## 5. Transient failure and bounded retries — 4 minutes 30 seconds

### Code snippet to show first

```js
// server/mockProvider.js
if (scenario === "transient503") {
  await wait(180);
  if (attempt <= 2) {
    return {
      status: 503,
      latencyMs: 180,
      body: { error: "Simulated temporary service unavailability." },
    };
  }
  return {
    status: 200,
    latencyMs: 180,
    body: { response: "The simulated LLM recovered on attempt 3." },
  };
}
```

```js
// server/resilience.js
for (let attempt = 1; attempt <= config.maxRetries + 1; attempt += 1) {
  // One provider call happens inside this loop for each attempt.
}
```

### UX Action

Select **Transient HTTP 503**, keep maximum retries at two, and click **Send request**. Follow the trace from attempt one to the final outcome. Read the sequence of HTTP statuses and waits aloud.

### Where and How

- Deterministic scenario: `server/mockProvider.js`, `mockProvider`, lines 24–36.
- Attempt loop: `server/resilience.js`, `runResilientRequest`, line 77 onwards.
- Maximum-attempt hint: `src/components/ResilienceControls.jsx`, `ResilienceControls`, line 17.
- Visible experiment: UI **Provider scenario → Transient HTTP 503 → Send request**.

### What to Say

“This scenario is deterministic for each logical request. The mock checks the physical attempt number. Attempts one and two return HTTP 503; attempt three returns HTTP 200. We can therefore inspect a recovery sequence without relying on a random outage.”

“Now let us be precise about the setting. Maximum retries is two. It means two retries after the initial attempt, so the loop permits one plus two, which is three physical calls. It does not mean two physical calls total.”

“On the first 503 response, the policy classifies the status, calculates a wait, and continues to the next loop iteration. The second 503 follows the same path. Attempt three returns 200, so the method returns a successful logical result. The trace records the first two failures and the last success.”

“Bounded retries matter because the provider may remain unavailable. If we retried forever, we could keep occupying server resources and sending additional traffic without a clear end. This loop has a fixed maximum attempt count. Once it is reached, the request stops and returns a failed outcome.”

“Success after retry is not the same as a clean first-attempt success. We should interpret the final outcome together with physical attempt count, retry count, and total duration. Two extra calls mean more work and more latency, even though the final user-facing result is successful.”

Read the actual trace. Confirm attempt one returned 503, attempt two returned 503, and attempt three returned 200. With jitter on, read the selected waits rather than assuming they are 500 and 1,000 milliseconds. They are bounded by those exponential caps, but can be lower.

## 6. Failure classification, HTTP 400 and HTTP 429 — 4 minutes

### Code snippet to show first

```js
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export function isRetryableStatus(status) {
  return RETRYABLE_STATUSES.has(status);
}
```

```js
const serverDelay = retryAfterMs(result.retryAfter);
const waitMs = Math.max(delayMs, serverDelay);
```

### UX Action

First select **HTTP 400** and send a request. Read the classification and stop event. Then select **HTTP 429**, send a request, and read the Retry-After guidance and applied wait. If time permits, run **HTTP 500** and show that it retries only up to the configured maximum.

### Where and How

- Status classification: `server/resilience.js`, `RETRYABLE_STATUSES` and `isRetryableStatus`, lines 1–6.
- Non-retryable exit: `server/resilience.js`, `runResilientRequest`, lines 112–134.
- Retry-After parser: `server/resilience.js`, `retryAfterMs`, lines 24–30.
- Header creation: `server/mockProvider.js`, HTTP 429 scenario, lines 46–53; header is sent by `server/server.js`, lines 9–14.
- UI path: **Provider scenario → HTTP 400** or **HTTP 429**.

### What to Say

“Retrying every error is not a good policy. HTTP 400 usually means the request needs to change. Repeating the same invalid request does not fix the input. In this implementation, status 400 is not in `RETRYABLE_STATUSES`. The code records NOT RETRYABLE and returns immediately, after one physical call.”

“The set contains 429, 500, 502, 503, and 504. This is the policy for this lab. It is not a statement that every HTTP 500 should always be retried in every product. We need to consider provider behaviour, the meaning of the operation, and whether another attempt can safely succeed.”

“HTTP 429 is a rate-limit response. The local provider includes a Retry-After value of one second. The parser accepts either seconds or an HTTP date. The policy calculates its own backoff and then uses the larger of the selected delay and the server’s guidance. That means jitter cannot make the client retry earlier than the one-second instruction.”

“Also consider idempotency. A retry repeats the request. If an operation can create a side effect, a retry could create that effect twice unless the surrounding system has an idempotency key or another deduplication method. The demo does not implement such a key because its mock operation has no side effects. In a real integration, operation semantics are part of retry classification.”

For HTTP 400, verify one attempt and zero retries. For HTTP 429, verify up to three attempts, and read each effective wait from the trace. For HTTP 500, explain that the experiment retries it but stops at the configured attempt limit. Do not call that universal policy.

## 7. Immediate retry and retry amplification — 3 minutes 30 seconds

### Code snippet to show first

This section uses a simple load calculation to explain the attempt limit; it is not a separate feature in the app.

```text
maximum physical attempts per logical request = 1 + maximum retries
maximum provider attempts = logical requests × maximum physical attempts
1,000 × (1 + 2) = up to 3,000 provider attempts
```

### UX Action

Keep the app on the transient 503 scenario. Point to its attempt count and retry count. Then show the two-retry setting. No separate immediate-retry switch exists in the UI; explain this comparison using the displayed attempt model and the equation above.

### Where and How

- UI label: `src/components/ResilienceControls.jsx`, **Maximum attempts = 1 + retries**.
- Runtime loop: `server/resilience.js`, `runResilientRequest`, line 77 onwards.
- Experiment evidence: latest request metrics in `src/components/MetricsPanel.jsx`.

### What to Say

“Let us use a simple upper-bound calculation. One thousand logical requests, with two retries each, can make up to three physical attempts per logical request. One thousand times three gives a maximum of three thousand physical attempts.”

“This is an upper bound in a simplified example. It does not mean every real request always makes three calls. Some requests succeed on the first attempt; some fail with a status that is not retryable; some callers may stop waiting. The point is that retries can multiply downstream work.”

“If all clients fail at nearly the same time and retry immediately, their second attempts may arrive together. If the provider is already struggling, this new burst can make recovery harder. The additional request volume is called retry amplification. The retry feature is intended to handle temporary failure, but it needs limits and spacing.”

“This UI has no immediate-retry mode. I am not going to present an unimplemented comparison as a measured experiment. The code and the formula explain the load model; the next sections show how backoff and jitter schedule the retries that this implementation does make.”

Use the live metrics to identify a logical request and its actual physical attempt count. Then compare that observed count with the maximum possible under the selected setting. Keep “possible maximum” distinct from “actual count.”

## 8. Exponential backoff — 5 minutes

### Code snippet to show first

```js
export function calculateBackoff(
  baseDelayMs,
  retryIndex,
  exponentialBackoff,
  jitter,
) {
  const rawDelayMs = exponentialBackoff
    ? baseDelayMs * 2 ** retryIndex
    : baseDelayMs;
  const delayMs = jitter
    ? Math.floor(Math.random() * (rawDelayMs + 1))
    : rawDelayMs;
  return { rawDelayMs, delayMs };
}
```

### UX Action

Select **Transient HTTP 503**. Set base backoff to 500 ms. Turn **Full jitter** off and keep **Exponential backoff** on. Send a request and inspect both waits. Then turn jitter back on and send the request again to compare the cap with the selected wait.

### Where and How

- Formula: `server/resilience.js`, `calculateBackoff`, lines 8–22.
- Retry index: `server/resilience.js`, inside `runResilientRequest`, lines 135–142.
- Trace output: same method, lines 150–159.
- UI controls: `src/components/ResilienceControls.jsx`, base-delay slider and toggle labels.

### What to Say

“The formula in the code is base delay multiplied by two to the retry index. The retry index starts at zero. After the first failed attempt, `retryIndex` is `attempt - 1`, which is zero. So if the base is 500 milliseconds, the first retry cap is 500 times two to the zero, which is 500 milliseconds.”

“After the second failed attempt, the retry index is one. The cap becomes 500 times two to the one, or 1,000 milliseconds. If we allowed another retry, the next cap would be 2,000 milliseconds. With the default maximum of two retries, we use the first two delays only.”

“With jitter off, the selected delay is exactly the calculated cap. We can use this setting to make the trace easy to compare with the formula. The deterministic 503 sequence will show a 500 millisecond wait, then a 1,000 millisecond wait, and then attempt three.”

“Now turn jitter back on. The calculated cap remains the same, but the applied delay is selected between zero and that cap. The trace reports the cap and selected value. These are two different quantities: the cap comes from backoff, while the selected delay comes from jitter.”

“Backoff gives the provider more time before another attempt and reduces the pressure of rapid repeat calls. The cost is added end-to-end latency. The request duration includes the provider time for each attempt and the waits between attempts. If the caller has a strict latency target, retry count, timeout, and backoff must fit inside that target. This demo has a timeout per attempt, but it does not impose a separate overall deadline.”

Read both actual waits with jitter off. Then enable jitter and read the new trace values. Make sure to say “cap” for the exponential value and “selected wait” for the jitter result.

## 9. Full jitter — 4 minutes

### Code snippet to show first

```js
const rawDelayMs = exponentialBackoff
  ? baseDelayMs * 2 ** retryIndex
  : baseDelayMs;
const delayMs = jitter
  ? Math.floor(Math.random() * (rawDelayMs + 1))
  : rawDelayMs;
```

### UX Action

Keep **Transient HTTP 503** selected. Show the backoff cap with jitter off, then enable **Full jitter** and send again. Read the cap and actual selected wait from each retry trace line.

### Where and How

- Sampling formula: `server/resilience.js`, `calculateBackoff`, lines 15–21.
- Control: `src/components/ResilienceControls.jsx`, `Full jitter` checkbox, lines 72–82.
- Trace: `runResilientRequest`, lines 150–159.

### What to Say

“Backoff alone still gives every client the same schedule if they fail at the same time. If many clients use a 500 millisecond first delay, many of them can wake at around the same boundary. The next boundary can be around one second. That can create a second burst while the provider is still recovering.”

“This code uses full jitter. It first calculates a backoff cap. Then `Math.random` chooses a value, and `Math.floor` makes it a whole number of milliseconds. The `rawDelayMs + 1` part means zero through the cap are both possible values. At a 500 millisecond cap, the chosen value is from 0 to 500. At a 1,000 millisecond cap, it is from 0 to 1,000.”

“Each retry calculates a new sample. This spreads retry times across the interval. It does not promise that every client receives a unique delay; two clients can randomly get the same value. It also does not limit the total number of requests. The retry limit bounds attempts, and jitter reduces synchronisation. Those are different jobs.”

“The trade-off is that exact retry time is less predictable. We know the cap and the allowed range, but not the exact selected value until runtime. That is why the trace must display the values rather than the recording relying on a memorised example.”

Point to one trace line and distinguish “calculated exponential backoff” from “full jitter selected.” Explain why the actual wait is no greater than the cap. Mention that jitter helps reduce aligned retry bursts but does not guarantee availability or a global request-rate limit.

## 10. Five concurrent requests — 4 minutes 30 seconds

### Code snippet to show first

```js
async function runConcurrent() {
  setBusy(true);
  setError("");
  setConcurrentResults(null);
  setResult(null);
  try {
    setConcurrentResults(
      await Promise.all(
        Array.from({ length: 5 }, () => sendRequest(scenario, config)),
      ),
    );
  } catch (e) {
    setError(e.message);
  } finally {
    setBusy(false);
  }
}
```

### UX Action

Select **Transient HTTP 503**, ensure the retry count is two and jitter is on, then click **Run 5 concurrent requests**. Wait for all rows. Read each client’s Retry 1 and Retry 2 values aloud from the live table. Do not use example values from an earlier run.

### Where and How

- Concurrent launch: `src/App.jsx`, `runConcurrent`, lines 35–51.
- Table: `src/components/ConcurrentResults.jsx`, `ConcurrentResults`, lines 1–54.
- Returned waits: `server/resilience.js`, `attemptDelays` entries in `runResilientRequest`.
- UX path: **Run 5 concurrent requests** button → **Concurrent request comparison** table.

### What to Say

“`runConcurrent` creates five calls and waits for all five using `Promise.all`. Each call is a separate logical request. The API generates a separate request ID for each one. The mock 503 scenario uses each call’s attempt number, so each logical request gets two 503 responses and then a 200 response.”

“The table shows the waits returned by each completed request. For every row, I’ll read the first retry wait and second retry wait from the actual browser output. The first retry is capped at 500 milliseconds; the second is capped at 1,000 milliseconds with these settings. Because jitter is on, the observed values can be lower.”

“Compare the five rows. We want to see how the sampled waits vary across clients, instead of every client using exactly the same backoff boundary. The five calls are started together, but their later retry times can be spread by those selected waits.”

“Be careful about what this table proves. It shows the runtime-selected delay values. It does not plot provider arrival timestamps, and it does not prove that retry traffic is globally safe. The numbers may sometimes match by chance. This is an educational comparison of per-request scheduling.”

Read values from Client A through Client E. Confirm each one has three attempts and Success. Avoid saying the jitter values should all be different. Explain that the useful observation is the spread across values, while equality remains possible with random sampling.

## 11. Configuration and trade-offs — 3 minutes

### Code snippet to show first

```js
const normalized = {
  timeoutMs: Math.min(
    10000,
    Math.max(100, Number(config?.timeoutMs) || 2000),
  ),
  maxRetries: Math.min(4, Math.max(0, Number(config?.maxRetries) || 0)),
  baseDelayMs: Math.min(5000, Math.max(0, Number(config?.baseDelayMs) || 0)),
  exponentialBackoff: Boolean(config?.exponentialBackoff),
  jitter: Boolean(config?.jitter),
};
```

### UX Action

In the UI point to the timeout slider, maximum retries slider, base backoff slider, exponential backoff checkbox, and full jitter checkbox. Change one value at a time and explain its effect; do not start extra long timeout experiments unless time allows.

### Where and How

- Server-side bounds: `server/server.js`, `POST /api/requests`, lines 16–37.
- Controls: `src/components/ResilienceControls.jsx`, `ResilienceControls`, lines 19–82.
- Defaults: `src/App.jsx`, `initialConfig`, lines 9–15.

### What to Say

“The browser presents understandable controls, and the API also normalises the values before passing them into the policy. For example, timeout is limited to a minimum of 100 milliseconds and a maximum of 10,000. Retries are limited to four in the API. This prevents an unexpected client value from asking the local server for unlimited work.”

“A short timeout can return control quickly, but it can also mark a slow yet valid provider response as a failure. A longer timeout gives the provider more time, but may keep resources occupied and increase user waiting time. We need to choose it using the application deadline and observed provider latency.”

“More retries may help when failures are temporary. They also increase the maximum physical calls and can amplify load. Larger backoff gives the provider more recovery time, but adds delay to the user’s request. Jitter spreads clients across time, but makes the exact wait less predictable.”

“There is no universal setting that is best for every provider and every operation. We need to consider the provider’s latency pattern, caller deadline, cost of another call, whether the operation can safely repeat, and the amount of retry traffic the system can handle.”

Point to the range controls and relate each one to a metric or trace event. Remind the viewer that the controls affect one logical request’s policy and that the server applies bounds separately.

## 12. Evidence review and conclusion — 3 minutes

### Code snippet to show first

```js
return {
  requestId,
  outcome: "Failed",
  attempts: config.maxRetries + 1,
  retryCount: config.maxRetries,
  durationMs: Date.now() - startedAt,
  finalStatus: lastStatus,
  response: "No successful provider response within the configured attempt limit.",
  trace,
  attemptDelays,
};
```

### UX Action

Return to the browser and review the latest request metrics and trace. Mention the normal result, the transient 503 recovery, the HTTP 400 stop, the HTTP 429 wait, and the five-client jitter table. Close with the validation record in `docs/validation-results.md` if time allows.

### Where and How

- Failure result after the retry limit: `server/resilience.js`, `runResilientRequest`, lines 197–213.
- Visible metrics: `src/components/MetricsPanel.jsx`, `MetricsPanel`.
- Visible chronological events: `src/components/RequestTrace.jsx`, `RequestTrace`.
- Validation evidence: `docs/validation-results.md`.

### What to Say

“The result object keeps the evidence together. It records the request ID, final outcome, number of physical attempts, retry count, total duration, final HTTP status, trace, and retry waits. This lets us distinguish a successful first attempt from a request that eventually succeeded after retries.”

“Our controlled experiments showed a normal request succeeding with one attempt, a slow provider exceeding the per-attempt timeout budget, a transient 503 recovering on the third attempt, a 400 stopping without a retry, and a 429 respecting its Retry-After minimum. The concurrent run showed the actual jitter waits for five clients.”

“The main technical conclusion is that timeouts set a caller-side waiting budget; retry classification decides which failures may be retried; bounded retries limit extra attempts; exponential backoff increases the time between retries; and jitter reduces synchronised retry timing.”

“These controls improve the chance of completing an operation during some transient failures, but they do not guarantee availability. They also add physical calls and latency. The policy has to fit the application deadline and the operation’s repeat-safety. A timeout does not by itself prove that downstream computation has stopped.”

Finish by reading the observed values rather than estimated ones. State any skipped check clearly. The recording has analysed and validated an existing implementation; the code was prepared before the recording.
