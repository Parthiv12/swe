# Domain Model

## Classes
- User: id, currentLocation (lat,lng), preferences (accessibility, units), favorites: FavoritesList
- FavoritesList: items [Destination], add(), remove(), list()
- Building: id, name, type, coordinate (lat,lng), departments[], accessibleEntrances[], notes
- Map: buildings [Building], paths [Path], landmarks[]
- Destination: ref to Building (and optional POI tag), displayName
- SearchEngine: search(query): [Destination]
- RouteCalculator: computeRoute(map, origin, destination, prefs): Path; reroute(map, currentLocation, destination, prefs): Path
- GPSService: start(), stop(), onLocationUpdate(cb)
- Path: id, points [(lat,lng)], distance, duration, instructions [NavigationInstruction]
- NavigationInstruction: index, text, maneuverType (left/right/straight/enter/exit), coordinate

## Relationships
- User 1—1 FavoritesList (composition)
- Map 1—* Building (aggregation)
- Map 1—* Path (aggregation)
- Destination — Building (association)
- SearchEngine → Building/Destination (uses)
- RouteCalculator → Map, Path, GPSService (uses)
- Path *—* NavigationInstruction (composition)
