export type LatLng = { lat: number; lng: number };
export type NavigationInstruction = { index: number; text: string; maneuverType: string; coordinate: LatLng };
export type Path = { id: string; points: LatLng[]; distance: number; duration: number; instructions: NavigationInstruction[]; nodes: string[] };
export type Building = { id: string; name: string; lat: number; lng: number; departments: string[]; imageUrl?: string; rating?: number; reviews?: Array<{ author: string; rating: number; text: string }>; floorMapPath?: string };
export type Edge = [string, string, number, boolean];
export type Amenity = { id: string; name: string; type: 'restroom' | 'water' | 'atm' | 'cafe'; lat: number; lng: number };
export type Room = { id: string; buildingId: string; room: string; label: string };
export type Professor = { id: string; name: string; officeBuildingId: string; officeRoom: string };
export type Event = { id: string; title: string; buildingId: string; time: string };
export type Announcement = { id: string; title: string; body: string; buildingId?: string; severity: 'info' | 'warning' | 'critical'; time: string };
export type Comment = { id: string; buildingId: string; author: string; text: string; parentId?: string; time: string };

import { Campus } from './campus';

export function haversine(a: LatLng, b: LatLng) {
  const R = 6371000;
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

export function nearestBuilding(coord: LatLng) {
  let best: Building | null = null;
  let bestD = Infinity;
  for (const b of Campus.buildings) {
    const d = haversine(coord, { lat: b.lat, lng: b.lng });
    if (d < bestD) { bestD = d; best = b; }
  }
  return best!;
}

export function computeRoute(opts: { originCoord: LatLng; destId: string; accessibility: boolean; closed?: Set<string> }): Path | null {
  const { originCoord, destId, accessibility, closed } = opts;
  const originNode = nearestBuilding(originCoord).id;
  const destNode = destId;

  const nodes = new Set(Campus.buildings.map((b) => b.id));
  const adj: Record<string, [string, number][]> = {};
  for (const n of nodes) adj[n] = [];
  for (const [a, b, w, acc] of Campus.edges) {
    const edgeKey = `${a}-${b}`;
    if (closed && (closed.has(edgeKey) || closed.has(`${b}-${a}`))) continue;
    if (accessibility && !acc) continue; // skip non-accessible edges
    adj[a].push([b, w]);
    adj[b].push([a, w]);
  }

  const dist: Record<string, number> = {}; const prev: Record<string, string> = {}; const visited = new Set<string>();
  for (const n of nodes) dist[n] = Infinity;
  dist[originNode] = 0;

  while (visited.size < nodes.size) {
    let u: string | null = null; let best = Infinity;
    for (const n of nodes) if (!visited.has(n) && dist[n] < best) { best = dist[n]; u = n; }
    if (!u || u === destNode) break;
    visited.add(u);
    for (const [v, w] of adj[u]) {
      const alt = dist[u] + w;
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
    }
  }

  const pathIds: string[] = [];
  let cur: string | undefined = destNode;
  while (cur) { pathIds.unshift(cur); cur = prev[cur]; if (cur === originNode) { pathIds.unshift(originNode); break; } }
  if (!pathIds.length || pathIds[0] !== originNode) return null;

  const idToB: Record<string, Building> = Object.fromEntries(Campus.buildings.map((b: Building) => [b.id, b]));
  const points: LatLng[] = pathIds.map((id: string) => ({ lat: idToB[id].lat, lng: idToB[id].lng }));

  const instructions: NavigationInstruction[] = [];
  const streetNames = ['West Kirby Street', 'East Kirby Street', 'Cass Avenue', 'Lothrop Street', 'Warren Avenue'];
  for (let i = 0; i < pathIds.length - 1; i++) {
    const a = idToB[pathIds[i]]; const b = idToB[pathIds[i + 1]];
    const d = Math.round(haversine({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }));
    const walkTime = Math.round(d / 1.4 / 60); // 1.4 m/s = ~5 km/h walking speed
    const street = streetNames[i % streetNames.length];
    instructions.push({ 
      index: i + 1, 
      text: `Head towards ${b.name} on ${street} (~${d} m, ${walkTime} min)`, 
      maneuverType: 'straight', 
      coordinate: { lat: b.lat, lng: b.lng } 
    });
  }

  return { id: `path-${Date.now()}`, points, distance: Math.round(dist[destNode]), duration: Math.round(dist[destNode] / 1.4), instructions, nodes: pathIds };
}

export function distanceToPathMeters(point: LatLng, polyline: LatLng[]) {
  if (!polyline || polyline.length < 2) return Infinity;
  let best = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i]; const b = polyline[i + 1];
    const d = pointToSegmentDistance(point, a, b);
    if (d < best) best = d;
  }
  return best;
}

function pointToSegmentDistance(p: LatLng, a: LatLng, b: LatLng) {
  const ax = a.lng, ay = a.lat, bx = b.lng, by = b.lat, px = p.lng, py = p.lat;
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const c1 = vx * wx + vy * wy;
  const c2 = vx * vx + vy * vy;
  const t = Math.max(0, Math.min(1, c1 / c2));
  const proj = { lat: ay + t * vy, lng: ax + t * vx };
  return haversine(p, proj);
}
