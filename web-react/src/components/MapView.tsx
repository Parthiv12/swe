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

// Fix default icon URLs for Leaflet in bundlers (Vite-specific asset handling)
let DefaultIcon = L.icon({ 
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAV50Ry1GREWEgCc1AAAACXBIWXMAAA7DAAAOwwHHb6hkAAACWUlEQVRYCe2XQWoUQRCGa7t1BiOe7JLEV7jkIIKieNmDB0Gw0YsHb+LFkyePogfxZBEPCp7Ei0QP4kUTeEVx8aI5qBD/VEsz29PT001N94xV3/RP1VSn6+vq6p7pAQCAxes8m81mqVRqNbMdxzEul8tdSZKw1+ul2Wym+Xy+JkkSjkarlaZpuN1uKZFIUKvVomq1KvmASi6Xo7W1NcrlcjQYDCiVSklCoZA0HA6p1WqRKIoUh8OhL5PJ0Pf3N3m9XqpUKpRIJKTjn8/n4na7xTxPp1NSqRRVKhWp/+PjIz0/P9P39zel0+mFJq1Wi9bW1uQ4QZ+fnxQKhaRBqrKAsiwLBPWaVnG/XqfJZCJpUJVQKPTvJfJarUZer5eGwyHt7u7S/v4+PXx80N7eHgHwqbczFo2jKArFYjEqFApUr9dJlmVRi4v4fD5qNBpULBbp4eGB7u7u6Pb2VnSILGhDQwNFo1Fa9N8xvV6n5eVlqtVq4qD/gOklTU0NvzpBr9ej+8eHf+d4PCxO0M29mIFyb96ubm5ofn4+9t1Yrv/8/KSzszPa3Nyk3d1dymQyj24a9dz6R1zfOO45bpoAVLUV2HqXrPvG9dXVLVztXlBFwWQyeXR2c3PDR0dH4gg4vjL8zPMN4i1jYWEhVYe8G/E2AJ+k6aQlbvPm5uazEKGxsfFfzB1ViqTfqI/H+jvuSf5v0oq+wv6tvmYbRJ0maMmAZfuKu3YG6ZEATGwANRqhRKhzBMUKYKzwE3eLVmhTW1+a0pf8Ib3Hj32UusFdNT0b3X8RRYFSK1l5cQ5QQkqEHLPzA9HgzcN9E7kiqZvd0XzIVU1ixB0aV00qKZF5LPXJ+lAk6mnyj5H0X/MfkLXp5UYSz7BKqQD7I/8VxkW/TXdz1yFWNJXgENVDGYUvN8KYAAAAlxBVW5OAV5Q', 
  shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAABqCAYAAACoWfH9AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAIRJREFUeJzt2DEBAQAAgxBH+M8OI0AAAAAAAAAAf/Z+FHxQV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3BXcFdwV3AHQs4DGYxUZKEAAAAASUVORK5CYII=', 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
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
