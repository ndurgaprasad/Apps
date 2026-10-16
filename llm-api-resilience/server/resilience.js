const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isRetryableStatus(status) {
  return RETRYABLE_STATUSES.has(status);
}

// retryIndex is zero-based: first retry uses baseDelayMs * 2^0.
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

function retryAfterMs(value) {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const dateDelay = Date.parse(value) - Date.now();
  return Number.isFinite(dateDelay) ? Math.max(0, dateDelay) : 0;
}

async function providerAttempt({ scenario, attempt, requestId, timeoutMs }) {
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
    return {
      ...result,
      status: response.status,
      retryAfter: response.headers.get("retry-after"),
    };
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      const timeout = new Error(
        `Provider attempt exceeded the ${timeoutMs} ms timeout budget.`,
      );
      timeout.code = "TIMEOUT";
      throw timeout;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function runResilientRequest({ scenario, config, requestId }) {
  const startedAt = Date.now();
  const trace = [
    {
      type: "info",
      message: `Request ${requestId} started · scenario ${scenario}`,
    },
  ];
  if (scenario === "slow")
    trace.push({
      type: "info",
      message: `Mock provider modeled latency: 4000 ms · client timeout budget: ${config.timeoutMs} ms per attempt.`,
    });
  const attemptDelays = [];
  let lastStatus = null;
  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt += 1) {
    trace.push({
      type: "attempt",
      message: `Attempt ${attempt} started · timeout budget ${config.timeoutMs} ms`,
    });
    const attemptStartedAt = Date.now();
    try {
      const result = await providerAttempt({
        scenario,
        attempt,
        requestId,
        timeoutMs: config.timeoutMs,
      });
      lastStatus = result.status;
      trace.push({
        type: result.status < 400 ? "success" : "failure",
        message: `Provider returned HTTP ${result.status} · observed attempt time ${Date.now() - attemptStartedAt} ms${result.latencyMs > config.timeoutMs ? ` · provider modeled ${result.latencyMs} ms latency` : ""}`,
      });
      if (result.status < 400) {
        trace.push({
          type: "success",
          message: "Request completed successfully.",
        });
        return {
          requestId,
          outcome: "Success",
          attempts: attempt,
          retryCount: attempt - 1,
          durationMs: Date.now() - startedAt,
          finalStatus: result.status,
          response: result.response,
          trace,
          attemptDelays,
        };
      }
      const retryable = isRetryableStatus(result.status);
      trace.push({
        type: retryable ? "info" : "stop",
        message: `Retry classification → ${retryable ? "RETRYABLE" : "NOT RETRYABLE"}`,
      });
      if (!retryable) {
        trace.push({
          type: "stop",
          message:
            "Request stopped; deterministic client error is not retried.",
        });
        return {
          requestId,
          outcome: "Failed",
          attempts: attempt,
          retryCount: attempt - 1,
          durationMs: Date.now() - startedAt,
          finalStatus: result.status,
          response: result.error,
          trace,
          attemptDelays,
        };
      }
      if (attempt > config.maxRetries) break;
      const retryIndex = attempt - 1;
      const { rawDelayMs, delayMs } = calculateBackoff(
        config.baseDelayMs,
        retryIndex,
        config.exponentialBackoff,
        config.jitter,
      );
      const serverDelay = retryAfterMs(result.retryAfter);
      const waitMs = Math.max(delayMs, serverDelay);
      if (serverDelay)
        trace.push({
          type: "info",
          message: `Retry-After guidance: ${serverDelay} ms; applied wait honors this minimum.`,
        });
      trace.push({
        type: "backoff",
        message: `Backoff before retry ${attempt} → ${rawDelayMs} ms${config.jitter ? `; full jitter selected ${delayMs} ms` : ""}${serverDelay ? `; effective wait ${waitMs} ms` : ""}`,
      });
      attemptDelays.push(waitMs);
      trace.push({
        type: "wait",
        message: `Waiting ${waitMs} ms before next attempt.`,
      });
      await sleep(waitMs);
    } catch (error) {
      if (error.code !== "TIMEOUT") {
        trace.push({
          type: "failure",
          message: `Provider transport error: ${error.message}`,
        });
      } else
        trace.push({
          type: "failure",
          message: `Client timeout after ${Date.now() - attemptStartedAt} ms; caller stopped waiting for this attempt.`,
        });
      lastStatus = null;
      trace.push({
        type: "info",
        message:
          "Failure classification → RETRYABLE (timeout/transport failure for this experiment).",
      });
      if (attempt > config.maxRetries) break;
      const retryIndex = attempt - 1;
      const { rawDelayMs, delayMs } = calculateBackoff(
        config.baseDelayMs,
        retryIndex,
        config.exponentialBackoff,
        config.jitter,
      );
      trace.push({
        type: "backoff",
        message: `Backoff before retry ${attempt} → ${rawDelayMs} ms${config.jitter ? `; full jitter selected ${delayMs} ms` : ""}`,
      });
      attemptDelays.push(delayMs);
      trace.push({
        type: "wait",
        message: `Waiting ${delayMs} ms before next attempt.`,
      });
      await sleep(delayMs);
    }
  }
  trace.push({
    type: "stop",
    message: `Retry limit reached; maximum ${config.maxRetries + 1} total attempts.`,
  });
  return {
    requestId,
    outcome: "Failed",
    attempts: config.maxRetries + 1,
    retryCount: config.maxRetries,
    durationMs: Date.now() - startedAt,
    finalStatus: lastStatus,
    response:
      "No successful provider response within the configured attempt limit.",
    trace,
    attemptDelays,
  };
}
