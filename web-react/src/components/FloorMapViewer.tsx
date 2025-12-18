/**
 * FloorMapViewer Component - Image Floor Map Display
 * 
 * Displays building floor maps from PNG images with simple navigation.
 * Place images under the provided directory, e.g. /floormaps/sh/1.png ... 5.png
 */

import { useMemo, useState } from 'react';
// Static imports for Science Hall floor maps (src/assets/floormaps/sh)
// Note: file names are mixed-case per user: Sh1.png, sh2.png ... sh5.png
// Vite will resolve these to URLs at build/dev time.
import Sh1 from '../assets/floormaps/sh/Sh1.png';
import sh2 from '../assets/floormaps/sh/sh2.png';
import sh3 from '../assets/floormaps/sh/sh3.png';
import sh4 from '../assets/floormaps/sh/sh4.png';
import sh5 from '../assets/floormaps/sh/sh5.png';

interface Props {
  buildingName: string;
  pdfPath: string; // Directory containing PNGs, e.g. /floormaps/sh
  onClose: () => void;
}

export default function FloorMapViewer({ buildingName, pdfPath, onClose }: Props) {
  // Load all PNGs from src/assets/floormaps/sh using Vite glob
  const imageMap = useMemo(() => (
    [
      { floor: 1, url: Sh1, name: 'Sh1.png' },
      { floor: 2, url: sh2, name: 'sh2.png' },
      { floor: 3, url: sh3, name: 'sh3.png' },
      { floor: 4, url: sh4, name: 'sh4.png' },
      { floor: 5, url: sh5, name: 'sh5.png' },
    ]
  ), []);

  const TOTAL_FLOORS = imageMap.length || 5; // default to 5 if not found
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loadError, setLoadError] = useState<boolean>(imageMap.length === 0);

  function changePage(offset: number) {
    setPageNumber((prev) => Math.max(1, Math.min(prev + offset, TOTAL_FLOORS)));
    setLoadError(false);
  }

  const currentEntry = imageMap.find(e => e.floor === pageNumber) || imageMap[pageNumber - 1];
  const currentSrc = currentEntry?.url;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{buildingName} - Floor Maps</h3>
          <button onClick={onClose} className="small">✕ Close</button>
        </div>
        <div className="modal-body">
          <div className="pdf-controls">
            <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="small">
              ← Prev
            </button>
            <span className="text-muted text-sm">Floor {pageNumber} of {TOTAL_FLOORS}</span>
            <button onClick={() => changePage(1)} disabled={pageNumber >= TOTAL_FLOORS} className="small">
              Next →
            </button>
          </div>

          <div className="pdf-page">
            {!loadError && currentSrc ? (
              <img 
                src={currentSrc}
                alt={`${buildingName} Floor ${pageNumber}`}
                width={800}
                style={{ borderRadius: 8, border: '1px solid rgba(79,70,229,0.2)' }}
              />
            ) : (
              <div className="error">
                Floor map images not found.
                Place files at src/assets/floormaps/sh/ (e.g., Sh1.png, sh2.png ... sh5.png).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
