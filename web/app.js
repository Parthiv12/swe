// Campus Navigation App - Minimal Prototype

// ------------ Sample Campus Data ------------
const Campus = (() => {
  const center = { lat: 37.7749, lng: -122.4194 };
  const buildings = [
    { id: 'ENG', name: 'Engineering Hall', lat: 37.7756, lng: -122.4199, departments: ['ECE', 'CSE'] },
    { id: 'LIB', name: 'Main Library', lat: 37.7742, lng: -122.4185, departments: ['Library'] },
    { id: 'SCI', name: 'Science Center', lat: 37.7751, lng: -122.4175, departments: ['Physics', 'Chemistry'] },
    { id: 'BUS', name: 'Business School', lat: 37.7739, lng: -122.4208, departments: ['MBA'] },
    { id: 'ART', name: 'Arts Building', lat: 37.7762, lng: -122.4186, departments: ['Design'] },
    { id: 'GYM', name: 'Recreation Center', lat: 37.7747, lng: -122.4218, departments: ['Rec'] },
  ];

  // Edges in meters (approx), with accessibility flag
  const edges = [
    ['ENG', 'LIB', 180, true],
    ['ENG', 'SCI', 170, true],
    ['ENG', 'GYM', 220, true],
    ['LIB', 'SCI', 160, true],
    ['LIB', 'BUS', 220, true],
    ['SCI', 'ART', 180, true],
    ['ART', 'GYM', 260, true],
    ['BUS', 'GYM', 200, false], // not accessible
    ['BUS', 'ENG', 190, true],
    ['ART', 'ENG', 200, true],
  ];

  return { center, buildings, edges };
})();

// ------------ Utilities ------------
function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const x = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function nearestBuilding(coord) {
  let best = null;
  let bestD = Infinity;
  for (const b of Campus.buildings) {
    const d = haversine(coord, { lat: b.lat, lng: b.lng });
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  return best;
}

// Dijkstra on building graph
function computeRoute(options) {
  const { originCoord, destId, accessibility } = options;
  const originNode = nearestBuilding(originCoord).id;
  const destNode = destId;

  const nodes = new Set(Campus.buildings.map((b) => b.id));
  const adj = {};
  for (const n of nodes) adj[n] = [];
  for (const [a, b, w, acc] of Campus.edges) {
    if (accessibility && !acc) continue; // skip non-accessible edges
    adj[a].push([b, w]);
    adj[b].push([a, w]);
  }

  const dist = {}; const prev = {}; const visited = new Set();
  for (const n of nodes) dist[n] = Infinity;
  dist[originNode] = 0;

  while (visited.size < nodes.size) {
    let u = null; let best = Infinity;
    for (const n of nodes) if (!visited.has(n) && dist[n] < best) { best = dist[n]; u = n; }
    if (!u || u === destNode) break;
    visited.add(u);
    for (const [v, w] of adj[u]) {
      const alt = dist[u] + w;
      if (alt < dist[v]) { dist[v] = alt; prev[v] = u; }
    }
  }

  const pathIds = [];
  let cur = destNode;
  while (cur) { pathIds.unshift(cur); cur = prev[cur]; if (cur === originNode) { pathIds.unshift(originNode); break; } }
  if (!pathIds.length || pathIds[0] !== originNode) return null;

  // Convert to coordinates polyline
  const idToB = Object.fromEntries(Campus.buildings.map((b) => [b.id, b]));
  const points = pathIds.map((id) => ({ lat: idToB[id].lat, lng: idToB[id].lng }));

  // Instructions (simple step per edge)
  const instructions = [];
  for (let i = 0; i < pathIds.length - 1; i++) {
    const a = idToB[pathIds[i]]; const b = idToB[pathIds[i + 1]];
    const d = Math.round(haversine({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }));
    instructions.push({ index: i + 1, text: `Walk to ${b.name} (~${d} m)`, maneuverType: 'straight', coordinate: { lat: b.lat, lng: b.lng } });
  }

  return { id: `path-${Date.now()}`, points, distance: Math.round(dist[destNode]), duration: Math.round(dist[destNode] / 1.4), instructions, nodes: pathIds };
}

// Distance from point to polyline (rough)
function distanceToPathMeters(point, polyline) {
  if (!polyline || polyline.length < 2) return Infinity;
  let best = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i]; const b = polyline[i + 1];
    const d = pointToSegmentDistance(point, a, b);
    if (d < best) best = d;
  }
  return best;
}

function pointToSegmentDistance(p, a, b) {
  // Convert to planar approximation (OK for short distances)
  const ax = a.lng, ay = a.lat, bx = b.lng, by = b.lat, px = p.lng, py = p.lat;
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const c1 = vx * wx + vy * wy;
  const c2 = vx * vx + vy * vy;
  const t = Math.max(0, Math.min(1, c1 / c2));
  const proj = { lat: ay + t * vy, lng: ax + t * vx };
  return haversine(p, proj);
}

// ------------ Map + UI ------------
let map, markers = {}, pathLine = null, gpsMarker = null, navTimer = null;
let currentPath = null, currentDest = null;

function initMap() {
  map = L.map('map').setView([Campus.center.lat, Campus.center.lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add building markers
  for (const b of Campus.buildings) {
    const m = L.marker([b.lat, b.lng]).addTo(map).bindPopup(`<b>${b.name}</b><br>${b.departments.join(', ')}`);
    m.on('click', () => selectDestination(b));
    markers[b.id] = m;
  }

  // Simulated current location starts at center
  gpsMarker = L.circleMarker([Campus.center.lat, Campus.center.lng], { radius: 6, color: '#4f46e5' }).addTo(map).bindPopup('You are here');
}

function renderPath(path) {
  if (pathLine) map.removeLayer(pathLine);
  pathLine = L.polyline(path.points, { color: '#22c55e', weight: 5 }).addTo(map);
  map.fitBounds(pathLine.getBounds(), { padding: [40, 40] });
}

function renderInstructions(path) {
  const list = document.getElementById('instructions');
  list.innerHTML = '';
  path.instructions.forEach((ins) => {
    const li = document.createElement('li');
    li.textContent = ins.text;
    list.appendChild(li);
  });
}

function selectDestination(building) {
  currentDest = building;
  document.getElementById('selectedDestination').textContent = building.name;
  maybeComputeRoute();
}

function maybeComputeRoute() {
  if (!currentDest) return;
  const accessibility = document.getElementById('accessibilityToggle').checked;
  const origin = { lat: gpsMarker.getLatLng().lat, lng: gpsMarker.getLatLng().lng };
  const route = computeRoute({ originCoord: origin, destId: currentDest.id, accessibility });
  if (!route) {
    alert('No route found with current constraints.');
    return;
  }
  currentPath = route;
  renderPath(route);
  renderInstructions(route);
}

function startNavigation() {
  if (!currentPath) return alert('Select a destination first.');
  stopNavigation();
  let i = 0;
  navTimer = setInterval(() => {
    if (i >= currentPath.points.length) { stopNavigation(); return; }
    const p = currentPath.points[i++];
    gpsMarker.setLatLng([p.lat, p.lng]);

    // Off-path detection
    const d = distanceToPathMeters({ lat: p.lat, lng: p.lng }, currentPath.points);
    if (d > 30) { // 30m threshold
      rerouteFromCurrent();
    }
  }, 1000);
}

function stopNavigation() {
  if (navTimer) clearInterval(navTimer);
  navTimer = null;
}

function rerouteFromCurrent() {
  stopNavigation();
  const accessibility = document.getElementById('accessibilityToggle').checked;
  const origin = { lat: gpsMarker.getLatLng().lat, lng: gpsMarker.getLatLng().lng };
  const route = computeRoute({ originCoord: origin, destId: currentDest.id, accessibility });
  if (route) {
    currentPath = route;
    renderPath(route);
    renderInstructions(route);
  }
}

function deviate() {
  // Move user ~50m west to simulate deviation
  const ll = gpsMarker.getLatLng();
  const newLL = { lat: ll.lat, lng: ll.lng - 0.0006 };
  gpsMarker.setLatLng([newLL.lat, newLL.lng]);
  if (currentPath) rerouteFromCurrent();
}

// ------------ Search + Favorites ------------
function filterResults(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const byName = Campus.buildings.filter((b) => b.name.toLowerCase().includes(q));
  const byDept = Campus.buildings.filter((b) => b.departments.some((d) => d.toLowerCase().includes(q)));
  const merged = [...new Set([...byName, ...byDept])];
  return merged.map((b) => ({ id: b.id, displayName: b.name }));
}

function showResults(items) {
  const wrap = document.getElementById('searchResults');
  wrap.innerHTML = '';
  if (!items.length) { wrap.classList.add('hidden'); return; }
  for (const item of items) {
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = item.displayName;
    div.addEventListener('click', () => {
      const b = Campus.buildings.find((x) => x.id === item.id);
      selectDestination(b);
      wrap.classList.add('hidden');
      document.getElementById('searchInput').value = '';
    });
    wrap.appendChild(div);
  }
  wrap.classList.remove('hidden');
}

function loadFavorites() {
  const data = JSON.parse(localStorage.getItem('favorites') || '[]');
  const ul = document.getElementById('favorites');
  ul.innerHTML = '';
  data.forEach((d, idx) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = d.displayName;
    const go = document.createElement('button');
    go.textContent = 'Go';
    go.addEventListener('click', () => {
      const b = Campus.buildings.find((x) => x.id === d.id);
      selectDestination(b);
      maybeComputeRoute();
    });
    const rm = document.createElement('button');
    rm.textContent = 'Remove';
    rm.addEventListener('click', () => {
      data.splice(idx, 1);
      localStorage.setItem('favorites', JSON.stringify(data));
      loadFavorites();
    });
    li.appendChild(span); li.appendChild(go); li.appendChild(rm);
    ul.appendChild(li);
  });
}

function addFavorite() {
  if (!currentDest) return;
  const data = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (!data.some((x) => x.id === currentDest.id)) {
    data.push({ id: currentDest.id, displayName: currentDest.name });
    localStorage.setItem('favorites', JSON.stringify(data));
    loadFavorites();
  }
}

function clearAll() {
  stopNavigation();
  currentPath = null; currentDest = null;
  document.getElementById('selectedDestination').textContent = 'None';
  document.getElementById('instructions').innerHTML = '';
  if (pathLine) { map.removeLayer(pathLine); pathLine = null; }
}

// ------------ Boot ------------
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadFavorites();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const items = filterResults(e.target.value);
    showResults(items);
  });
  document.getElementById('accessibilityToggle').addEventListener('change', maybeComputeRoute);
  document.getElementById('startNavBtn').addEventListener('click', startNavigation);
  document.getElementById('deviateBtn').addEventListener('click', deviate);
  document.getElementById('addFavBtn').addEventListener('click', addFavorite);
  document.getElementById('clearBtn').addEventListener('click', clearAll);

  // Hide search results on outside click
  document.addEventListener('click', (e) => {
    const sr = document.getElementById('searchResults');
    const si = document.getElementById('searchInput');
    if (!sr.contains(e.target) && e.target !== si) sr.classList.add('hidden');
  });
});
