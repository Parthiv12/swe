# Use Cases

## UC1: User selects destination
- Trigger: User enters a query and chooses a result.
- Preconditions: GPS available or origin provided; map data loaded.
- Main Flow:
  1. User types in search.
  2. System shows ranked destinations.
  3. User selects a destination.
  4. System computes route from current location with preferences.
  5. System displays route and instructions.
- Alternate Flows:
  - A1: No GPS — user selects origin manually.
  - A2: No results — suggest categories or nearest buildings.
  - A3: Accessibility on — system filters to accessible entrances.
- Postconditions: Active Path set; navigation view visible.

## UC2: System displays route
- Trigger: UC1 step 4 completes.
- Main Flow: Render polyline, markers, and first instruction; begin progress tracking.
- Alternate: If route calc fails, show error and retry option.

## UC3: GPS updates user location
- Trigger: GPS tick (1–2s cadence).
- Main Flow: Update user marker, advance instruction when passing maneuver point; smooth via map-matching.
- Alternate: Low accuracy — show warning; do not advance step prematurely.

## UC4: System reroutes if user deviates
- Trigger: Off-path detection.
- Main Flow: Compute new shortest path to destination; replace current Path; inform user.
- Alternate: Temporary drift — wait one tick to confirm before rerouting; threshold configurable.
