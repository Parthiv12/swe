/**
 * SearchBar Component - Strategy Pattern for Multi-Criteria Search
 * 
 * Design Patterns:
 * 1. Strategy Pattern: Implements multiple search strategies (by building, department, room, professor)
 * 2. Composite Pattern: Combines multiple search results into unified output
 * 3. Observer Pattern: Responds to input changes and recomputes results
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles search input and result display only
 * - Open/Closed: Easily extensible to add new search criteria without modifying existing logic
 * - Interface Segregation: Minimal props interface (only callback needed)
 * - Dependency Inversion: Depends on Campus abstraction, not concrete data structures
 * 
 * Search Strategies:
 * 1. By building name (exact or partial match)
 * 2. By department (searches building's department list)
 * 3. By room number or label
 * 4. By professor name (shows professor's office location)
 */

import { useMemo, useState } from 'react';
import { Campus } from '../lib/campus';

/**
 * Props Interface - Interface Segregation Principle
 * Only requires callback, no unnecessary dependencies
 */
interface Props { onSelect: (id: string) => void }

export default function SearchBar({ onSelect }: Props) {
  const [q, setQ] = useState(''); // Search query state
  
  // Suggested searches
  const suggestedSearches = [
    { label: 'ATEC', id: 'ATEC' },
    { label: 'Engineering', id: 'ENG' },
    { label: 'Library', id: 'LIB' },
    { label: 'Science Center', id: 'SCI' },
  ];
  
  /**
   * Strategy Pattern: Multi-criteria search with memoization
   * Composite Pattern: Merges results from 4 different search strategies
   * 
   * Performance Optimization: useMemo caches results to avoid recomputation
   * on every render (only recomputes when query changes)
   */
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [] as { id: string; displayName: string }[];
    
    // Strategy 1: Search by building name
    const byName = Campus.buildings.filter(b => b.name.toLowerCase().includes(s));
    
    // Strategy 2: Search by department name
  /**
   * Presentational Component: Renders search input with dropdown results
   * Command Pattern: Click handler encapsulates selection action
   */
    const byDept = Campus.buildings.filter(b => b.departments.some(d => d.toLowerCase().includes(s)));
    
    // Strategy 3: Search by room number or label
    const byRoom = Campus.rooms.filter(r => r.room.toLowerCase().includes(s) || r.label.toLowerCase().includes(s));
    
    // Strategy 4: Search by professor name
    const byProf = Campus.professors.filter(p => p.name.toLowerCase().includes(s));

    // Composite Pattern: Merge results, removing duplicates
    const mergedBuildings = [...new Set([...byName, ...byDept])];
    const items: { id: string; displayName: string }[] = [];
    items.push(...mergedBuildings.map(b => ({ id: b.id, displayName: b.name })));
    items.push(...byRoom.map(r => ({ id: r.buildingId, displayName: `${r.label} (${r.room})` })));
    items.push(...byProf.map(p => ({ id: p.officeBuildingId, displayName: `${p.name} (Office ${p.officeRoom})` })));
    return items;
  }, [q]);

  return (
    <div className="search">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search buildings, rooms, departments..." />
      {q.trim() === '' ? (
        <div className="search-results">
          <div className="suggested-label">Suggested Searches</div>
          {suggestedSearches.map(s => (
            <div key={s.id} className="item suggested" onClick={() => { onSelect(s.id); setQ(''); }}>
              {s.label}
            </div>
          ))}
        </div>
      ) : results.length > 0 && (
        <div className="search-results">
          {results.map(r => (
            <div key={r.id} className="item" onClick={() => { onSelect(r.id); setQ(''); }}>
              {r.displayName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
