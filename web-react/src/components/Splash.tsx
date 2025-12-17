import { useEffect } from 'react';

/**
 * Splash Component - Landing screen for Campus Quest
 * 
 * Design Pattern: Presentational Component (Smart/Dumb Components Pattern)
 * - Pure presentation logic, no business logic
 * - Receives data and callbacks via props
 * - Manages only local UI state (scroll lock)
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles splash screen UI
 * - Open/Closed: Extensible via props, closed for modification
 * - Interface Segregation: Minimal props interface
 */

interface Props {
  onEnter: () => void;
}

export default function Splash({ onEnter }: Props) {
  useEffect(() => {
    // prevent scroll while splash is active
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, []);

  return (
    <div className="splash">
      <div className="splash-bg"></div>
      <div className="splash-card">
        <h1 className="brand">Campus Quest - Campus Navigation</h1>
        <p className="tag">Find your way. Level up your day.</p>
        <button className="btn-hero" onClick={onEnter}>Start Exploring</button>
        <div className="badges">
          <span className="badge">Explorer Lv.1</span>
          <span className="badge">Daily Streak 1🔥</span>
        </div>
      </div>
      <div className="sparkles" aria-hidden="true"></div>
    </div>
  );
}
