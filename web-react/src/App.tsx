/**
 * App Component - Container/Controller Pattern
 * 
 * Design Patterns Implemented:
 * 1. Container Component Pattern: Manages state and business logic for entire application
 * 2. Facade Pattern: Provides simplified interface to complex subsystems (routing, GPS, favorites)
 * 3. Observer Pattern: Observes location changes and triggers automatic rerouting
 * 4. Strategy Pattern: Uses different routing strategies (accessibility-first, standard)
 * 5. Command Pattern: Encapsulates user actions (navigate, deviate, clear) as commands
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Coordinates between components and manages application state
 * - Open/Closed: Extensible via composition, closed for modification
 * - Liskov Substitution: Child components can be replaced with compatible implementations
 * - Interface Segregation: Each child component receives only props it needs
 * - Dependency Inversion: Components depend on abstractions (props), not concrete implementations
 * 
 * State Management Architecture:
 * - Centralized state management for user location, routing, and preferences
 * - LocalStorage persistence for favorites (Observer Pattern)
 * - GPS simulation with interval-based updates
 * - Automatic rerouting on deviation detection (>30m from path)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import Splash from './components/Splash';
import RouteSelector from './components/RouteSelector';
import BuildingDetailView from './components/BuildingDetailView';
import { Campus } from './lib/campus';
import { computeRoute, distanceToPathMeters, LatLng, Path } from './lib/graph';

/**
 * Internationalization (i18n) Configuration
 * Strategy Pattern: Different translation strategies for EN/ES
 * Demonstrates adherence to Open/Closed Principle - easily extensible to add new languages
 */
const translations = {
  en: {
    accessibility: 'Accessibility-first routing',
    amenities: 'Amenities',
    language: 'Language',
    startNav: 'Start Navigation',
    deviate: 'Deviate',
    clear: 'Clear',
    simulate: 'Simulate Closure',
    useGps: 'Use GPS Location',
  },
  es: {
    accessibility: 'Rutas accesibles',
    amenities: 'Servicios',
    language: 'Idioma',
    startNav: 'Iniciar navegación',
    deviate: 'Desviarse',
    clear: 'Limpiar',
    simulate: 'Simular cierre',
    useGps: 'Usar ubicación GPS',
  },
  ta: {
    accessibility: 'அணுகல் வழிகள்',
    amenities: 'வசதிகள்',
    language: 'மொழி',
    startNav: 'வழிசெலுத்தலை தொடங்கு',
    deviate: 'வழி விலகு',
    clear: 'அழி',
    simulate: 'மூடல் உருவகி',
    useGps: 'GPS இருப்பிடத்தைப் பயன்படுத்து',
  },
  te: {
    accessibility: 'అందుబాటు మార్గాలు',
    amenities: 'సౌకర్యాలు',
    language: 'భాష',
    startNav: 'నావిగేషన్ ప్రారంభించు',
    deviate: 'మార్గం తప్పు',
    clear: 'క్లీర్',
    simulate: 'క్లోజర్ సిమ్యులేట్',
    useGps: 'GPS స్థానం వాడు',
  },
};

export default function App() {
  // State Management - Single Responsibility Principle
  // Each state variable manages one aspect of application behavior
  
  const [accessibility, setAccessibility] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [route, setRoute] = useState<Path | null>(null);
  // Generate a random starting location nearby (simulated user position)
  const [userLoc, setUserLoc] = useState<LatLng>(() => ({
    lat: Campus.center.lat + (Math.random() - 0.5) * 0.01,
    lng: Campus.center.lng + (Math.random() - 0.5) * 0.01,
  }));
  const [showSplash, setShowSplash] = useState(true);
  const [xp, setXp] = useState(0);
  const [showAmenities, setShowAmenities] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es' | 'ta' | 'te'>('en');
  const [activeClosures, setActiveClosures] = useState(new Set<string>());
  const [loadingMap, setLoadingMap] = useState(false);
  const [fromId, setFromId] = useState<string>('CURRENT');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [favorites, setFavorites] = useState<{ id: string; displayName: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
  });
  const navTimer = useRef<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedBuilding = useMemo(() => Campus.buildings.find((b: any) => b.id === selectedDestId) || null, [selectedDestId]);
  const t = useMemo(() => translations[language], [language]);

  useEffect(() => {
    if (showSplash) return;
    setLoadingMap(true);
    const timer = setTimeout(() => setLoadingMap(false), 1200);
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    document.title = 'Campus Quest';
    if (selectedBuilding) {
      const originCoord = fromId === 'CURRENT'
        ? userLoc
        : (() => { const b = Campus.buildings.find((x) => x.id === fromId); return b ? { lat: b.lat, lng: b.lng } : userLoc; })();
      const r = computeRoute({ originCoord, destId: selectedBuilding.id, accessibility, closed: activeClosures });
      setRoute(r);
    } else {
      setRoute(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestId, accessibility, activeClosures, fromId, userLoc]);

  function startNavigation() {
    if (!route) return alert('Select a destination first.');
    stopNavigation();
    setXp((x) => Math.min(100, x + 10));
    let i = 0;
    navTimer.current = window.setInterval(() => {
      if (!route) { stopNavigation(); return; }
      if (i >= route.points.length) { stopNavigation(); return; }
      const p = route.points[i++];
      setUserLoc({ lat: p.lat, lng: p.lng });

      const d = distanceToPathMeters({ lat: p.lat, lng: p.lng }, route.points);
      if (d > 30 && selectedBuilding) rerouteFromCurrent();
    }, 1000);
  }

  function stopNavigation() {
    if (navTimer.current) { window.clearInterval(navTimer.current); navTimer.current = null; }
  }

  function deviate() {
    // shift ~50m west
    setUserLoc((prev: LatLng) => ({ lat: prev.lat, lng: prev.lng - 0.0006 }));
    if (selectedBuilding) rerouteFromCurrent();
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude });
        setFromId('CURRENT');
      },
      () => alert('Unable to retrieve your location'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  function rerouteFromCurrent() {
    if (!selectedBuilding) return;
    const r = computeRoute({ originCoord: userLoc, destId: selectedBuilding.id, accessibility, closed: activeClosures });
    if (r) setRoute(r);
  }

  function addFavorite() {
    if (!selectedBuilding) return;
    const next = favorites.some(f => f.id === selectedBuilding.id)
      ? favorites
      : [...favorites, { id: selectedBuilding.id, displayName: selectedBuilding.name }];
    setFavorites(next);
    localStorage.setItem('favorites', JSON.stringify(next));
    setXp((x) => Math.min(100, x + 5));
  }

  function removeFavorite(id: string) {
    const next = favorites.filter(f => f.id !== id);
    setFavorites(next);
    localStorage.setItem('favorites', JSON.stringify(next));
  }

  function clearAll() {
    stopNavigation();
    setSelectedDestId(null);
    setRoute(null);
  }

  return (
    <div className="app">
      {showSplash && <Splash onEnter={() => setShowSplash(false)} />}
      <header className="app-header">
        <div className="header-left">
          <img src="/src/assets/w.png" alt="Wayne State" className="logo" />
          <h2 className="header-title">Campus Quest</h2>
        </div>
        <div className="controls">
          <RouteSelector
            buildings={Campus.buildings}
            fromId={fromId}
            toId={selectedDestId}
            onFromChange={(id: string) => setFromId(id)}
            onToChange={(id: string) => setSelectedDestId(id)}
          />
          <label>
            <input type="checkbox" checked={accessibility} onChange={e => setAccessibility(e.target.checked)} />
            {t.accessibility}
          </label>
          <label>
            <input type="checkbox" checked={showAmenities} onChange={e => setShowAmenities(e.target.checked)} />
            {t.amenities}
          </label>
          <label>
            {t.language}
            <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'es' | 'ta' | 'te')}>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="ta">TA</option>
              <option value="te">TE</option>
            </select>
          </label>
          <button onClick={useCurrentLocation}>{t.useGps}</button>
          <button className="primary" onClick={startNavigation}>Simulate Navigation</button>
          <button onClick={deviate}>{t.deviate}</button>
          <button onClick={clearAll}>{t.clear}</button>
          <button onClick={() => { setActiveClosures(new Set(Campus.closures.map((edge: any) => `${edge[0]}-${edge[1]}`))); setNotification('Sudden closure detected: BUS–GYM. Rerouting...'); setTimeout(() => setNotification(null), 4000); }}>
            {t.simulate}
          </button>
        </div>
        {notification && <div className="pill distance">{notification}</div>}
        <div className="xp">
          <div className="xp-label">XP</div>
          <div className="xp-bar" style={{ '--xp-width': `${xp}%` } as React.CSSProperties}><span /></div>
        </div>
      </header>
      <main className="layout">
        <aside className="sidebar">
          <section>
            <h2>Destination</h2>
            <div className="pill muted">{selectedBuilding ? selectedBuilding.name : 'None'}</div>
            <button className="small" onClick={addFavorite}>Add to Favorites</button>
          </section>
          <Sidebar
            route={route}
            favorites={favorites}
            onGoFavorite={(id: string) => setSelectedDestId(id)}
            onRemoveFavorite={removeFavorite}
            events={Campus.events}
            onSelectEvent={(id: string) => setSelectedDestId(id)}
            selectedBuildingId={selectedDestId}
            announcements={Campus.announcements}
          />
        </aside>
        <section className="map-wrap">
          <MapView
            userLocation={userLoc}
            route={route}
            buildings={Campus.buildings}
            onSelectDestination={(id: string) => {
              setSelectedDestId(id);
              setShowDetailPanel(true);
            }}
            amenities={Campus.amenities}
            showAmenities={showAmenities}
          />
          {loadingMap && <div className="loading-overlay">Loading map...</div>}
        </section>
      </main>
      <footer className="app-footer">
        <p>Developed by Wayne State Students: Parthiv, Abhi, Vish, Aaraiz, and Sugi</p>
      </footer>

      {/* Building Detail Panel */}
      {showDetailPanel && selectedBuilding && (
        <BuildingDetailView
          building={selectedBuilding}
          onClose={() => setShowDetailPanel(false)}
        />
      )}
    </div>
  );
}
