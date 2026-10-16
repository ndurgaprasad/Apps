const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// This deterministic local provider models latency and HTTP failures; it never calls an external LLM.
export async function mockProvider({ scenario, attempt }) {
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
  if (scenario === "slow") {
    await wait(4000);
    return {
      status: 200,
      latencyMs: 4000,
      body: { response: "Slow simulated response completed." },
    };
  }
  if (scenario === "transient503") {
    await wait(180);
    if (attempt <= 2)
      return {
        status: 503,
        latencyMs: 180,
        body: { error: "Simulated temporary service unavailability." },
      };
    return {
      status: 200,
      latencyMs: 180,
      body: { response: "The simulated LLM recovered on attempt 3." },
    };
  }
  if (scenario === "http500") {
    await wait(160);
    return {
      status: 500,
      latencyMs: 160,
      body: { error: "Simulated internal provider error." },
    };
  }
  if (scenario === "http429") {
    await wait(100);
    return {
      status: 429,
      latencyMs: 100,
      retryAfter: "1",
      body: { error: "Simulated rate limit; retry after one second." },
    };
  }
  await wait(80);
  return {
    status: 400,
    latencyMs: 80,
    body: {
      error: "Simulated invalid request; changing the input is required.",
    },
  };
}
