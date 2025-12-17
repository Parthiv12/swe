# Unit Testing Strategy

## Boundaries and Mocks
- Mock GPSService to emit deterministic location streams.
- Stub SearchEngine with fixed datasets for search ranking tests.
- Isolate RouteCalculator with a small in-memory Map graph.

## Example Test Cases
- SearchEngine: query prefix/synonyms return ranked destinations; empty results handled.
- RouteCalculator: shortest path selection; accessibility toggle excludes stairs-only edges; reroute near-miss vs true deviation.
- Path/Instructions: generate correct first-step text and maneuver types.
- FavoritesList: add/remove/list behavior; duplicates prevented.
- On-path detection: tolerate GPS jitter; threshold-based reroute only when off-path persists.

## Test Data
- Mini campus graph with 6 buildings, 10 paths, annotated accessible entrances.

## Metrics
- Unit coverage target ≥ 80%; mutation score baseline ≥ 60%.
