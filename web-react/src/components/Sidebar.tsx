/**
 * Sidebar Component - Composite Pattern for Grouped Information Display
 * 
 * Design Patterns:
 * 1. Composite Pattern: Combines multiple sections (instructions, favorites, events) into unified UI
 * 2. Presentational Component Pattern: Pure UI component, receives all data and callbacks via props
 * 3. Command Pattern: Each button encapsulates a command (navigate, remove favorite)
 * 
 * SOLID Principles:
 * - Single Responsibility: Displays navigation instructions, favorites, and events only
 * - Open/Closed: Extensible via props (can add new sections without modification)
 * - Interface Segregation: Receives only data needed for display
 * - Dependency Inversion: Depends on abstract Path type, not concrete implementation
 * 
 * Sections:
 * 1. Instructions: Turn-by-turn directions with distance/ETA
 * 2. Favorites: Saved locations with quick navigation
 * 3. Events: Campus events with navigation shortcuts
 */

import { useMemo, useState } from 'react';
import { Announcement, Comment, Path } from '../lib/graph';
import { Campus } from '../lib/campus';
import FloorMapViewer from './FloorMapViewer';
import AnimatedNavigation from './AnimatedNavigation';

/**
 * Props Interface - Interface Segregation Principle
 * Clear separation of concerns: route data, favorites management, event navigation
 */
interface Props {
  route: Path | null;
  favorites: { id: string; displayName: string }[];
  onGoFavorite: (id: string) => void;
  onRemoveFavorite: (id: string) => void;
  events: { id: string; title: string; buildingId: string; time: string }[];
  onSelectEvent: (id: string) => void;
  selectedBuildingId: string | null;
  announcements: Announcement[];
}

export default function Sidebar({ route, favorites, onGoFavorite, onRemoveFavorite, events, onSelectEvent, selectedBuildingId, announcements }: Props) {
  const [activeTab, setActiveTab] = useState<'instructions' | 'favorites' | 'events' | 'announcements' | 'alternate' | 'help' | 'comments' | 'schedule' | 'details'>('instructions');
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showFloorMap, setShowFloorMap] = useState(false);

  // Comments: localStorage persistence with initial seed
  const [allComments, setAllComments] = useState<Comment[]>(() => {
    try {
      const raw = localStorage.getItem('comments');
      if (raw) return JSON.parse(raw);
      localStorage.setItem('comments', JSON.stringify(Campus.initialComments));
      return Campus.initialComments;
    } catch {
      return Campus.initialComments;
    }
  });

  function saveComments(next: Comment[]) {
    localStorage.setItem('comments', JSON.stringify(next));
    setAllComments(next);
  }

  function addComment() {
    if (!selectedBuildingId || !commentText.trim()) return;
    const next: Comment[] = [
      ...allComments,
      { id: `C-${Date.now()}`, buildingId: selectedBuildingId, author: 'Guest', text: commentText.trim(), parentId: replyTo || undefined, time: new Date().toISOString() }
    ];
    saveComments(next);
    setCommentText('');
    setReplyTo(null);
    // state already updated via saveComments
  }

  const buildingComments = (selectedBuildingId ? allComments.filter(c => c.buildingId === selectedBuildingId) : []) as Comment[];
  const rootComments = buildingComments.filter(c => !c.parentId);
  const childrenOf = (id: string) => buildingComments.filter(c => c.parentId === id);

  const schedule = [
    { code: 'CSC 4996', title: 'Senior Project', time: 'Mon/Wed 2:30–3:45 PM', location: 'ENG 210' },
    { code: 'CSC 5750', title: 'Operating Systems', time: 'Tue/Thu 11:30–12:45 PM', location: 'SCI 115' },
    { code: 'CSC 5870', title: 'Computer Networks', time: 'Fri 10:00–12:00 PM', location: 'LIB 305' },
  ];

  return (
    <>
      <div className="tabs">
        {[
          ['instructions','Instructions'],
          ['favorites','Favorites'],
          ['events','Events'],
          ['announcements','Announcements'],
          ['alternate','Alternate Routes'],
          ['help','Help'],
          ['comments','Comments'],
          ['schedule','Schedule'],
          ['details','Details'],
        ].map(([key,label]) => (
          <button key={key} className={activeTab === key ? 'pill' : 'pill muted'} onClick={() => setActiveTab(key as any)}>{label}</button>
        ))}
      </div>
      {activeTab === 'details' && (
        <section>
          <h2>Building Details</h2>
          {!selectedBuildingId && <div className="muted">Select a destination to view details.</div>}
          {selectedBuildingId && (() => {
            const b = Campus.buildings.find(x => x.id === selectedBuildingId);
            if (!b) return <div className="muted">Not found.</div>;
            return (
              <>
                <div className="mb-3">
                  <div><strong>{b.name}</strong>{typeof b.rating === 'number' ? ` • ⭐ ${b.rating.toFixed(1)}` : ''}</div>
                  <div className="muted mt-2">Departments: {b.departments.join(', ')}</div>
                  {b.floorMapPath && (
                    <button className="primary mt-3" onClick={() => setShowFloorMap(true)}>
                      🗺️ View Floor Maps
                    </button>
                  )}
                </div>
                <h3 className="mt-4 mb-2 text-md">Reviews</h3>
                <ul className="list-plain">
                  {(b.reviews || []).map((r, i) => (
                    <li key={i}>
                      <div><strong>{r.author}</strong> — ⭐ {r.rating}</div>
                      <div>{r.text}</div>
                    </li>
                  ))}
                </ul>
                {showFloorMap && b.floorMapPath && (
                  <FloorMapViewer
                    buildingName={b.name}
                    pdfPath={b.floorMapPath}
                    onClose={() => setShowFloorMap(false)}
                  />
                )}
              </>
            );
          })()}
        </section>
      )}

      {activeTab === 'instructions' && (
        <section>
          <h2>🗺️ Turn-by-Turn Navigation</h2>
          {route ? (
            <>
              <AnimatedNavigation route={route} />
            </>
          ) : (
            <div className="muted">Select a destination to see navigation instructions.</div>
          )}
        </section>
      )}

      {activeTab === 'favorites' && (
        <section>
          <h2>Favorites</h2>
          <ul id="favorites">
            {favorites.map((f) => (
              <li key={f.id}>
                <span>{f.displayName}</span>
                <div>
                  <button onClick={() => onGoFavorite(f.id)}>Go</button>
                  <button onClick={() => onRemoveFavorite(f.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'events' && (
        <section>
          <h2>Today’s Events</h2>
          <ul className="list-plain">
            {events.map((e) => (
              <li key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <div className="muted">{e.time}</div>
                </div>
                <button onClick={() => onSelectEvent(e.buildingId)}>Navigate</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'announcements' && (
        <section>
          <h2>Announcements</h2>
          <ul className="list-plain">
            {announcements.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>{a.title}</strong>
                  <div className="muted">{a.time} · {a.severity.toUpperCase()}</div>
                </div>
                <div className="announcement-body">{a.body}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'alternate' && (
        <section>
          <h2>Alternate Routes</h2>
          <p className="muted">If a closure is active, the route automatically avoids it. Use the button in the header to simulate closures.</p>
          <ul>
            <li>Closure: BUS–GYM maintenance detour</li>
            <li>Tip: Consider LIB → SCI if ENG → GYM is closed</li>
          </ul>
        </section>
      )}

      {activeTab === 'help' && (
        <section>
          <h2>Help</h2>
          <ul>
            <li>Use the From selector to set your origin (or current location).</li>
            <li>Use the search box to select your destination.</li>
            <li>Click “Simulate Navigation” to auto-follow the route.</li>
          </ul>
        </section>
      )}

      {activeTab === 'comments' && (
        <section>
          <h2>Comments {selectedBuildingId ? `(for ${selectedBuildingId})` : ''}</h2>
          {!selectedBuildingId && <div className="muted">Select a destination to comment.</div>}
          {selectedBuildingId && (
            <>
              <div className="my-8">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…" />
                <button className="small" onClick={addComment}>Post</button>
              </div>
              <ul className="list-plain">
                {rootComments.map((c) => (
                  <li key={c.id}>
                    <div><strong>{c.author}</strong> <span className="muted">{new Date(c.time).toLocaleString()}</span></div>
                    <div>{c.text}</div>
                    <button className="small" onClick={() => setReplyTo(c.id)}>Reply</button>
                    {replyTo === c.id && (
                      <div className="mt-6">
                        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a reply…" />
                        <button className="small" onClick={addComment}>Post Reply</button>
                      </div>
                    )}
                    {childrenOf(c.id).map((r) => (
                      <div key={r.id} className="comment-reply">
                        <div><strong>{r.author}</strong> <span className="muted">{new Date(r.time).toLocaleString()}</span></div>
                        <div>{r.text}</div>
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {activeTab === 'schedule' && (
        <section>
          <h2>CS Senior Semester</h2>
          <ul className="list-plain">
            {schedule.map((s, i) => (
              <li key={i}>
                <div>
                  <strong>{s.code}</strong> — {s.title}
                  <div className="muted">{s.time} · {s.location}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
