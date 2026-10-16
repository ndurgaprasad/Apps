import express from "express";
import { randomUUID } from "node:crypto";
import { mockProvider } from "./mockProvider.js";
import { runResilientRequest } from "./resilience.js";

const app = express();
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.post("/mock-provider", async (req, res) => {
  const result = await mockProvider(req.body);
  if (result.retryAfter) res.set("Retry-After", result.retryAfter);
  res
    .status(result.status)
    .json({ ...result.body, latencyMs: result.latencyMs });
});
app.post("/api/requests", async (req, res) => {
  const { scenario, config } = req.body ?? {};
  const allowedScenarios = new Set([
    "normal",
    "slow",
    "transient503",
    "http500",
    "http429",
    "http400",
  ]);
  if (!allowedScenarios.has(scenario))
    return res.status(400).json({ error: "Unknown provider scenario." });
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
  try {
    res.json(
      await runResilientRequest({
        scenario,
        config: normalized,
        requestId: randomUUID().slice(0, 8),
      }),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(3001, () =>
  console.log(
    "Resilience API and mock provider listening on http://localhost:3001",
  ),
);
