/**
 * BuildingDetailView Component - Full Screen Building Information
 * 
 * Displays comprehensive building information:
 * - Large hero image with fullscreen capability
 * - Detailed reviews and ratings
 * - Floor maps with PDF viewer
 * - Comments and discussions
 * - Navigation options
 */

import { useState } from 'react';
import { Building } from '../lib/graph';
import FloorMapViewer from './FloorMapViewer';

interface Props {
  building: Building;
  onClose: () => void;
}

export default function BuildingDetailView({ building, onClose }: Props) {
  const [showFloorMap, setShowFloorMap] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  return (
    <>
      <div className="detail-overlay" onClick={onClose}>
        <button className="detail-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="detail-panel">
        {/* Header with back button */}
        <div className="detail-header">
          <button className="detail-back-btn" onClick={onClose}>
            ← Back to Map
          </button>
          <h1>{building.name}</h1>
          <div className="detail-meta">
            {typeof building.rating === 'number' && (
              <>
                <span className="detail-rating">⭐ {building.rating.toFixed(1)}</span>
                <span className="detail-reviews-count">({building.reviews?.length || 0} reviews)</span>
              </>
            )}
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="detail-hero">
          {building.imageUrl && (
            <>
              <img
                src={building.imageUrl}
                alt={building.name}
                className="detail-hero-img"
                onClick={() => setFullscreenImage(true)}
              />
              <button
                className="detail-fullscreen-btn"
                onClick={() => setFullscreenImage(true)}
                title="Fullscreen"
              >
                ⛶
              </button>
            </>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="detail-content">
          {/* Departments */}
          <section className="detail-section">
            <h2>Departments</h2>
            <div className="detail-departments">
              {building.departments.map((dept, i) => (
                <span key={i} className="detail-dept-badge">
                  {dept}
                </span>
              ))}
            </div>
          </section>

          {/* Floor Maps */}
          {building.floorMapPath && (
            <section className="detail-section">
              <h2>Floor Maps</h2>
              <p className="detail-description">
                Navigate through multi-floor layout with detailed room information.
              </p>
              <button
                className="detail-action-btn"
                onClick={() => setShowFloorMap(true)}
              >
                🗺️ View Floor Maps
              </button>
            </section>
          )}

          {/* Reviews Section */}
          <section className="detail-section">
            <h2>Reviews & Ratings</h2>
            {building.reviews && building.reviews.length > 0 ? (
              <div className="detail-reviews-list">
                {building.reviews.map((review, i) => (
                  <div key={i} className="detail-review-item">
                    <div className="detail-review-header">
                      <div className="detail-review-author">{review.author}</div>
                      <div className="detail-review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className="detail-review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No reviews yet. Be the first to review!</p>
            )}
          </section>

          {/* Quick Info */}
          <section className="detail-section">
            <h2>Quick Info</h2>
            <div className="detail-quick-info">
              <div className="detail-info-item">
                <span className="detail-info-label">Building ID</span>
                <span className="detail-info-value">{building.id}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Latitude</span>
                <span className="detail-info-value">{building.lat.toFixed(6)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">Longitude</span>
                <span className="detail-info-value">{building.lng.toFixed(6)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="detail-footer">
          <button className="detail-action-btn" onClick={onClose}>
            ← Back to Map
          </button>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && building.imageUrl && (
        <div
          className="detail-fullscreen-modal"
          onClick={() => setFullscreenImage(false)}
        >
          <img
            src={building.imageUrl}
            alt={building.name}
            className="detail-fullscreen-img"
          />
          <button
            className="detail-fullscreen-close"
            onClick={() => setFullscreenImage(false)}
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Floor Map Viewer */}
      {showFloorMap && building.floorMapPath && (
        <FloorMapViewer
          buildingName={building.name}
          pdfPath={building.floorMapPath}
          onClose={() => setShowFloorMap(false)}
        />
      )}
    </>
  );
}
