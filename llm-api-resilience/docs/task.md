# Odin Dashboard Task

## Task Title

LLM API Resilience — Timeout, Retry, Exponential Backoff and Jitter

## Goal — What are you trying to accomplish?

Analyze and validate an existing LLM API resilience implementation that protects an application from slow and temporarily failing AI-provider requests.

The application simulates common downstream failure conditions including slow responses, transient HTTP errors, rate limiting, and non-retryable client errors. The existing resilience layer applies configurable request timeouts, bounded retry policies, failure classification, exponential backoff, and jitter.

During the analysis, controlled provider scenarios will be executed to observe how each mechanism affects request attempts, latency, retry timing, and final outcomes. Request traces and browser-visible metrics will be used to explain why immediate retries can amplify failures, why retries should be limited to appropriate transient conditions, how exponential backoff reduces retry pressure, and how jitter helps prevent synchronized retry traffic across multiple clients.

The final result will be an evidence-based technical evaluation of the resilience strategy, including the trade-offs involved in selecting timeout values, retry limits, and backoff behavior for LLM integrations.

## Starting Point

Using existing material.

Before recording, the completed project already contains a React application, a Node.js local mock LLM provider, timeout logic, retry classification, bounded retry logic, exponential backoff, jitter, scenario simulation, request traces, metrics, and a concurrent-request demonstration. The recording focuses on analyzing and validating this existing implementation; code creation is not part of the recorded task.

## Apps

- Google Docs in Microsoft Edge: display the approved task goal and task description at the beginning.
- Visual Studio Code: inspect and explain the prepared implementation.
- Microsoft Edge: run the application, execute failure experiments, inspect results, and validate behavior.

## What Will You Actually Create / Analyze / Decide?

- Inspect the provider interaction and where the resilience layer applies policy.
- Explain timeout behavior and analyze retry classification.
- Test transient versus permanent errors and bounded attempts.
- Compare immediate retry conceptually with exponential backoff.
- Examine runtime retry delays and demonstrate jitter with concurrent requests.
- Interpret request traces and metrics, evaluate latency/reliability trade-offs, decide when retry is appropriate, and identify limitations.

## How Will You Verify the Result?

1. Run a normal provider request and verify HTTP 200.
2. Use a slow provider and verify configured timeout behavior.
3. Run deterministic transient HTTP 503 and verify bounded retries and recovery on attempt three.
4. Run HTTP 400 and verify no retry occurs.
5. Inspect exponential backoff delays.
6. Run concurrent requests and verify jitter generates different retry waits.
7. Verify final attempt counts and request durations.
8. Inspect the browser console for unexpected runtime errors.
9. Verify the application remains functional after all experiments.

## Previous Work

New task
