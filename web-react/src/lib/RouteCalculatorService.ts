/**
 * RouteCalculatorService - Singleton Pattern for Route Computation
 * 
 * Design Pattern: Singleton
 * - Ensures only one instance of the route calculator exists
 * - Provides global access point for route computation
 * - Manages routing algorithm state consistently
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Route calculation only
 * - Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations
 */

import { Campus } from './campus';
import { Building, LatLng, Path, NavigationInstruction } from './graph';

/**
 * Haversine formula for calculating distance between two coordinates
 * @param a - First coordinate
 * @param b - Second coordinate
 * @returns Distance in meters
 */
export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * RouteCalculator implements Dijkstra's algorithm for shortest path finding
 * Follows Strategy Pattern - different routing strategies can be plugged in
 */
export class RouteCalculatorService {
  private static instance: RouteCalculatorService;

  private constructor() {
    // Private constructor enforces Singleton pattern
  }

  /**
   * Get singleton instance
   * @returns The single RouteCalculatorService instance
   */
  public static getInstance(): RouteCalculatorService {
    if (!RouteCalculatorService.instance) {
      RouteCalculatorService.instance = new RouteCalculatorService();
    }
    return RouteCalculatorService.instance;
  }

  /**
   * Find nearest building to given coordinates
   * @param coord - Coordinate to search from
   * @returns Nearest building
   */
  public nearestBuilding(coord: LatLng): Building {
    let best: Building | null = null;
    let bestD = Infinity;
    for (const b of Campus.buildings) {
      const d = haversine(coord, { lat: b.lat, lng: b.lng });
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    return best!;
  }

  /**
   * Compute shortest route using Dijkstra's algorithm
   * Strategy Pattern - can be extended with different algorithms (A*, BFS, etc.)
   * 
   * @param originCoord - Starting coordinate
   * @param destId - Destination building ID
   * @param accessibility - Whether to filter for accessible routes
   * @param closed - Set of closed edges to avoid
   * @returns Computed path or null if no route exists
   */
  public computeRoute(opts: {
    originCoord: LatLng;
    destId: string;
    accessibility: boolean;
    closed?: Set<string>;
  }): Path | null {
    const { originCoord, destId, accessibility, closed } = opts;
    const originNode = this.nearestBuilding(originCoord).id;
    const destNode = destId;

    // Build adjacency list (Graph representation)
    const nodes = new Set(Campus.buildings.map((b) => b.id));
    const adj: Record<string, [string, number][]> = {};
    for (const n of nodes) adj[n] = [];
    
    // Filter edges based on accessibility and closures
    for (const [a, b, w, acc] of Campus.edges) {
      const edgeKey = `${a}-${b}`;
      if (closed && (closed.has(edgeKey) || closed.has(`${b}-${a}`))) continue;
      if (accessibility && !acc) continue;
      adj[a].push([b, w]);
      adj[b].push([a, w]);
    }

    // Dijkstra's algorithm implementation
    const dist: Record<string, number> = {};
    const prev: Record<string, string> = {};
    const visited = new Set<string>();
    
    for (const n of nodes) dist[n] = Infinity;
    dist[originNode] = 0;

    while (visited.size < nodes.size) {
      let u: string | null = null;
      let best = Infinity;
      for (const n of nodes) {
        if (!visited.has(n) && dist[n] < best) {
          best = dist[n];
          u = n;
        }
      }
      if (!u || u === destNode) break;
      visited.add(u);
      
      for (const [v, w] of adj[u]) {
        const alt = dist[u] + w;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }

    // Reconstruct path
    const pathIds: string[] = [];
    let cur: string | undefined = destNode;
    while (cur) {
      pathIds.unshift(cur);
      cur = prev[cur];
      if (cur === originNode) {
        pathIds.unshift(originNode);
        break;
      }
    }
    
    if (!pathIds.length || pathIds[0] !== originNode) return null;

    // Convert to coordinate polyline
    const idToB: Record<string, Building> = Object.fromEntries(
      Campus.buildings.map((b) => [b.id, b])
    );
    const points: LatLng[] = pathIds.map((id) => ({
      lat: idToB[id].lat,
      lng: idToB[id].lng,
    }));

    // Generate turn-by-turn instructions
    const instructions: NavigationInstruction[] = [];
    for (let i = 0; i < pathIds.length - 1; i++) {
      const a = idToB[pathIds[i]];
      const b = idToB[pathIds[i + 1]];
      const d = Math.round(haversine({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }));
      instructions.push({
        index: i + 1,
        text: `Walk to ${b.name} (~${d} m)`,
        maneuverType: 'straight',
        coordinate: { lat: b.lat, lng: b.lng },
      });
    }

    return {
      id: `path-${Date.now()}`,
      points,
      distance: Math.round(dist[destNode]),
      duration: Math.round(dist[destNode] / 1.4), // Average walking speed: 1.4 m/s
      instructions,
      nodes: pathIds,
    };
  }

  /**
   * Calculate distance from a point to a polyline
   * Used for off-path detection during navigation
   * 
   * @param point - Current location
   * @param polyline - Route polyline
   * @returns Distance in meters
   */
  public distanceToPath(point: LatLng, polyline: LatLng[]): number {
    if (!polyline || polyline.length < 2) return Infinity;
    let best = Infinity;
    for (let i = 0; i < polyline.length - 1; i++) {
      const a = polyline[i];
      const b = polyline[i + 1];
      const d = this.pointToSegmentDistance(point, a, b);
      if (d < best) best = d;
    }
    return best;
  }

  /**
   * Calculate perpendicular distance from point to line segment
   * @private
   */
  private pointToSegmentDistance(p: LatLng, a: LatLng, b: LatLng): number {
    const ax = a.lng,
      ay = a.lat,
      bx = b.lng,
      by = b.lat,
      px = p.lng,
      py = p.lat;
    const vx = bx - ax,
      vy = by - ay;
    const wx = px - ax,
      wy = py - ay;
    const c1 = vx * wx + vy * wy;
    const c2 = vx * vx + vy * vy;
    const t = Math.max(0, Math.min(1, c1 / c2));
    const proj = { lat: ay + t * vy, lng: ax + t * vx };
    return haversine(p, proj);
  }
}

// Export singleton instance as default export
export const routeCalculator = RouteCalculatorService.getInstance();
