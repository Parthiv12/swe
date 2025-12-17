/**
 * RouteSelector Component - Searchable To/From Inputs
 * 
 * Design Patterns:
 * - Presentational Component Pattern: Focuses on UI presentation
 * - Observer Pattern: Responds to user input changes
 */

import { useState, useRef, useEffect } from 'react';
import { Building } from '../lib/graph';

interface Props {
  buildings: Building[];
  fromId: string;
  toId: string | null;
  onFromChange: (id: string) => void;
  onToChange: (id: string) => void;
}

export default function RouteSelector({ buildings, fromId, toId, onFromChange, onToChange }: Props) {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromDropdown, setFromDropdown] = useState(false);
  const [toDropdown, setToDropdown] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Get display name for selected building or current location
  const getDisplayName = (id: string) => {
    if (id === 'CURRENT') return 'Current Location';
    const building = buildings.find((b) => b.id === id);
    return building ? building.name : '';
  };

  // Filter buildings based on query
  const filterBuildings = (query: string) => {
    if (!query.trim()) return buildings;
    const lowerQuery = query.toLowerCase();
    return buildings.filter((b) =>
      b.name.toLowerCase().includes(lowerQuery) || 
      b.departments.some((d) => d.toLowerCase().includes(lowerQuery))
    );
  };

  const fromFiltered = filterBuildings(fromQuery);
  const toFiltered = filterBuildings(toQuery);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFromSelect = (id: string) => {
    onFromChange(id);
    setFromQuery('');
    setFromDropdown(false);
  };

  const handleToSelect = (id: string) => {
    onToChange(id);
    setToQuery('');
    setToDropdown(false);
  };

  return (
    <div className="route-selector">
      {/* FROM Input - Origin (on top) */}
      <div className="route-input-group" ref={fromRef}>
        <label className="route-input-label">🚶 From (Starting Point)</label>
        <input
          type="text"
          className="route-input"
          placeholder={getDisplayName(fromId)}
          value={fromQuery}
          onChange={(e) => {
            setFromQuery(e.target.value);
            setFromDropdown(true);
          }}
          onFocus={() => setFromDropdown(true)}
        />
        {fromDropdown && (fromQuery || fromId === 'CURRENT') && (
          <div className="route-dropdown">
            <div
              className={`item ${fromId === 'CURRENT' ? 'highlighted' : ''}`}
              onClick={() => handleFromSelect('CURRENT')}
            >
              📍 Current Location
            </div>
            {fromFiltered.map((b) => (
              <div
                key={b.id}
                className={`item ${b.id === fromId ? 'highlighted' : ''}`}
                onClick={() => handleFromSelect(b.id)}
              >
                {b.name}
                <span className="text-muted text-xs ml-2">
                  {b.departments.join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TO Input - Destination (below FROM) */}
      <div className="route-input-group" ref={toRef}>
        <label className="route-input-label">📍 To (Destination)</label>
        <input
          type="text"
          className="route-input"
          placeholder={toId ? getDisplayName(toId) : "Search destination..."}
          value={toQuery}
          onChange={(e) => {
            setToQuery(e.target.value);
            setToDropdown(true);
          }}
          onFocus={() => setToDropdown(true)}
        />
        {toDropdown && (toQuery || !toId) && (
          <div className="route-dropdown">
            {toFiltered.length > 0 ? (
              toFiltered.map((b) => (
                <div
                  key={b.id}
                  className={`item ${b.id === toId ? 'highlighted' : ''}`}
                  onClick={() => handleToSelect(b.id)}
                >
                  {b.name}
                  <span className="text-muted text-xs ml-2">
                    {b.departments.join(', ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="item text-muted">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
