/**
 * MapView Component - Adapter Pattern for Leaflet Integration
 * 
 * Design Patterns:
 * 1. Adapter Pattern: Adapts Leaflet.js API to React component interface
 * 2. Facade Pattern: Simplifies complex Leaflet API into declarative props
 * 3. Flyweight Pattern: Reuses marker instances instead of creating new ones on each render
 * 
 * SOLID Principles:
 * - Single Responsibility: Renders interactive map with markers, routes, and overlays
 * - Open/Closed: Extensible via props (amenities, buildings), closed for modification
 * - Liskov Substitution: Can be replaced with any map provider that implements same interface
 * - Interface Segregation: Accepts minimal props needed for map rendering
 * - Dependency Inversion: Depends on abstract types (Building, Path, Amenity), not concrete implementations
 * 
 * Performance Optimizations:
 * - Uses refs to maintain Leaflet instances across renders (avoids recreation)
 * - Flyweight Pattern: Reuses marker objects, updates positions instead of recreating
 * - Conditional rendering: Only updates elements when relevant props change
 */

import { useEffect, useRef } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Amenity, Building, LatLng, Path } from '../lib/graph';
import markerPng from '../assets/marker.png';

// Custom map marker icon using provided asset
const DefaultIcon = L.icon({
  iconUrl: markerPng,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  className: 'map-marker-icon'
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Props Interface - Interface Segregation Principle
 * Component receives only data it needs, nothing more
 */
interface Props {
  userLocation: LatLng;
  buildings: Building[];
  route: Path | null;
  onSelectDestination: (id: string) => void;
  amenities: Amenity[];
  showAmenities: boolean;
}

export default function MapView({ userLocation, buildings, route, onSelectDestination, amenities, showAmenities }: Props) {
  /**
   * Flyweight Pattern: Refs maintain Leaflet instances across renders
   * Avoids expensive recreation of map objects on every state change
   */
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const pathRef = useRef<L.Polyline | null>(null);
  const userRef = useRef<L.CircleMarker | null>(null);
  const amenityRef = useRef<Record<string, L.CircleMarker>>({});
  /**
   * Initialization Effect: Creates map instance once on mount
   * Adapter Pattern: Adapts Leaflet API to React lifecycle
   * 
   * Creates:
   * - Base map with OpenStreetMap tiles
   * - Building markers with click handlers
   * - User location indicator
   */
  useEffect(() => {
    if (!mapRef.current) {
      // Initialize Leaflet map centered on user location
      mapRef.current = L.map('map', { zoomControl: true }).setView([userLocation.lat, userLocation.lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Flyweight Pattern: Create building markers once, reuse across renders
      for (const b of buildings) {
        const img = b.imageUrl ? `<div style="margin-top:6px"><img src="${b.imageUrl}" width="220" height="132" style="object-fit:cover;border-radius:8px"/></div>` : '';
        const rating = typeof b.rating === 'number' ? ` • ⭐ ${b.rating.toFixed(1)}` : '';
        const m = L.marker([b.lat, b.lng]).addTo(mapRef.current).bindPopup(`<b>${b.name}${rating}</b>${img}`);
        m.on('click', () => onSelectDestination(b.id));
        markersRef.current[b.id] = m;
      }

      // User location marker with pulsing effect (distinct styling)
      userRef.current = L.circleMarker([userLocation.lat, userLocation.lng], { 
        radius: 10, 
        color: '#4f46e5', 
        fillColor: '#8b5cf6',
        fillOpacity: 0.7,
        weight: 3,
        className: 'pulse-marker'
      }).addTo(mapRef.current).bindPopup('<b>📍 Your Current Location</b>');
    }
  }, []);

  /**
   * Observer Pattern: Update user marker when location changes
   * Flyweight: Reuses existing marker, updates position instead of recreating
   */
  useEffect(() => {
    if (userRef.current) userRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    if (mapRef.current) mapRef.current.panTo([userLocation.lat, userLocation.lng]);
  }, [userLocation]);

  /**
   * Observer Pattern: Update route visualization when route changes
   * Flyweight Pattern: Reuses polyline object, removes old and creates new
   * 
   * Automatically fits map bounds to show entire route (UX enhancement)
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    
    // Clean up previous route polyline
    if (pathRef.current) { map.removeLayer(pathRef.current); pathRef.current = null; }
    
    if (route) {
      // Convert route points to Leaflet format
      const latlngs: LatLngExpression[] = route.points.map((p: LatLng) => [p.lat, p.lng]);
      
      // Create green polyline for route visualization
      pathRef.current = L.polyline(latlngs, { color: '#22c55e', weight: 5 }).addTo(map);
      
      // Auto-fit map to show entire route
      map.fitBounds(pathRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [route]);

  /**
   * Strategy Pattern: Dynamic amenities overlay with color-coding strategy
   * Observer Pattern: Responds to showAmenities toggle and amenities changes
   * 
   * Color Strategy:
   * - Restroom: Sky blue (#38bdf8)
   * - Water: Ocean blue (#0ea5e9)
   * - ATM: Amber (#f59e0b)
   * - Other: Pink (#ec4899)
   */
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    
    // Clean up previous amenity markers
  /**
   * Render: Presentational Pattern
   * Minimal inline styles (width/height required for Leaflet initialization)
   */
    Object.values(amenityRef.current).forEach((m) => map.removeLayer(m));
    amenityRef.current = {};
    
    if (!showAmenities) return;
    
    // Create color-coded markers for each amenity
    for (const a of amenities) {
      const color = a.type === 'restroom' ? '#38bdf8' 
                  : a.type === 'water' ? '#0ea5e9' 
                  : a.type === 'atm' ? '#f59e0b' 
                  : '#ec4899';
      const m = L.circleMarker([a.lat, a.lng], { radius: 6, color, fillColor: color, fillOpacity: 0.8 }).addTo(map)
        .bindPopup(`<b>${a.name}</b><br>${a.type.toUpperCase()}`);
      amenityRef.current[a.id] = m;
    }
  }, [amenities, showAmenities]);

  return <div id="map" />;
}
