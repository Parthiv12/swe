# Engineering Metrics and Control Plan

## Key Metrics (Targets p95)
- Search latency: < 200ms
- Route calculation latency: < 500ms
- Reroute latency (off-path → new path shown): < 2s
- GPS update cadence: 1–2s; UI update within 200ms of tick
- Crash-free sessions: > 99.5%
- Unit test coverage: ≥ 80%

## Measurement
- Instrument timers around search, computeRoute, reroute; log anonymized durations.
- Count reroute events per session; track false positives (rerouted but returned immediately).
- Record GPS accuracy buckets; correlate with on-path false negatives.

## Control Plan
- Monitor: weekly dashboard with trendlines; alert if two consecutive p95 breaches.
- Containment: rollback feature flags for new ranking or routing changes.
- Root Cause: 5-Why analysis for sustained breaches; action items tracked.
- Verification: add regression tests; replay traces until metrics recover.

## Risks & Mitigations
- GPS drift → map-matching + hysteresis before reroute.
- Sparse accessibility data → crowd-sourcing feedback and admin curation.
- Offline gaps → prefetch top campus tiles and building metadata.
