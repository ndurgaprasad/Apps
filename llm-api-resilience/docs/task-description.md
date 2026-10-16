# LLM API Resilience — Timeout, Retry, Exponential Backoff and Jitter

## Goal

Analyze and validate an existing LLM API resilience implementation that protects an application from slow and temporarily failing AI-provider requests.

## What will be analyzed

I will inspect the prepared React and Node.js application, then run controlled normal, slow, transient, rate-limit, and client-error scenarios. I will examine timeout behavior, retry classification, bounded attempts, exponential backoff, jitter, request traces, concurrent request timing, and the resulting latency and reliability trade-offs.

## How the results will be verified

Visible HTTP outcomes, attempt counts, durations, retry waits, and final results will be checked in the application. I will also inspect the browser console and verify the app remains usable after the experiments.
