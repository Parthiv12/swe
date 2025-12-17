# Service Interfaces and Data Schemas

## Interfaces (pseudo-code)
```ts
interface SearchEngine {
  search(query: string): Promise<Destination[]>;
}

interface RouteCalculator {
  computeRoute(map: Map, origin: LatLng, dest: Destination, prefs: Preferences): Promise<Path>;
  reroute(map: Map, current: LatLng, dest: Destination, prefs: Preferences): Promise<Path>;
}

interface GPSService {
  start(): void;
  stop(): void;
  onLocationUpdate(cb: (loc: LatLng) => void): void;
}
```

## Data Schemas (JSON examples)

### Building
```json
{
  "id": "ENG-01",
  "name": "Engineering Hall",
  "type": "academic",
  "coordinate": { "lat": 35.123, "lng": -80.456 },
  "departments": ["ECE", "CSE"],
  "accessibleEntrances": [{ "lat": 35.1231, "lng": -80.4562 }]
}
```

### Destination
```json
{ "buildingId": "ENG-01", "displayName": "Engineering Hall" }
```

### Path
```json
{
  "id": "path-abc",
  "points": [ {"lat": 35.123, "lng": -80.456}, {"lat": 35.124, "lng": -80.457} ],
  "distance": 420.5,
  "duration": 360,
  "instructions": [
    { "index": 1, "text": "Head north 100m", "maneuverType": "straight", "coordinate": {"lat": 35.1235, "lng": -80.4565} },
    { "index": 2, "text": "Turn right at Library", "maneuverType": "right", "coordinate": {"lat": 35.1240, "lng": -80.4569} }
  ]
}
```

### FavoritesList
```json
{
  "items": [ { "buildingId": "ENG-01", "displayName": "Engineering Hall" } ]
}
```
