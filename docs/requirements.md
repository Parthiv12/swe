# Campus Navigation App — Requirements Summary

## Scope & Assumptions
- Phase 1 scope: inter-building navigation on campus (outdoor graph), with basic entry/exit handling. Limited indoor (per-building POI only) for now.
- Accessibility: user-toggle preference; when enabled, routes avoid stairs and prefer ramps/elevators/accessible entrances (if data available).
- Rerouting: triggered when user deviates beyond 10–20m off the planned path or misses a turn (threshold configurable). Target end-to-end reroute latency ≤ 2s.
- GPS: external device location at ~1–2s cadence; accuracy varies (5–25m). Map-matching smooths jitter.
- Platforms: mobile-first (Android/iOS via cross-platform), responsive web as stretch. Confirm final scope.
- Offline: cache last-used map tiles, building metadata, and recent routes for basic operation without network.

## Functional Requirements
- Search destinations (buildings, departments, landmarks); typeahead results.
- Select destination and start navigation from current GPS or a chosen origin.
- Compute route using shortest-path with constraints (accessibility, walk-only).
- Display path with turn-by-turn navigation instructions.
- Real-time GPS updates; progress along path.
- Automatic reroute on deviation; notify user succinctly.
- Manage favorites (add/remove, quick start from favorites list).
- Basic settings: accessibility toggle; units (miles/meters).

## Non-Functional Requirements
- Performance: search results < 200ms p95; route calculation < 500ms p95; reroute < 2s p95.
- Reliability: graceful degradation when GPS is weak; persist last known location.
- Usability: clear, minimal UI; readable instruction text; colorblind-friendly palette.
- Privacy: no raw GPS logs stored; anonymized analytics only.
- Compatibility: works with variable GPS accuracy and intermittent network.

## Open Questions
- Indoor detail (stairs/elevators/floors) timeline—stay excluded in Phase 1?
- Final platform commitment (mobile only vs. mobile + web)?
- Data availability for accessible entrances/paths per building?
- Preferred map provider and licensing constraints?
