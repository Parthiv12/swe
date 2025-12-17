import React from 'react';

/**
 * Demo Floor Map - Placeholder when PDF file is not available
 * 
 * This component shows during development while waiting for the actual PDF
 * to be placed in /public/assets/floormaps/science-hall.pdf
 */

interface Props {
  floorNumber: number;
  totalFloors: number;
  buildingName: string;
  onClose?: () => void;
}

export default function DemoFloorMap({ floorNumber, totalFloors, buildingName }: Props) {
  const floorInfo: { [key: number]: { name: string; features: string[] } } = {
    1: {
      name: 'Ground Floor',
      features: ['Main Entrance', 'Reception', 'Restrooms', 'Cafe'],
    },
    2: {
      name: 'First Floor',
      features: ['Lecture Hall A', 'Physics Lab', 'Study Area'],
    },
    3: {
      name: 'Second Floor',
      features: ['Chemistry Lab', 'Lecture Hall B', 'Office Space'],
    },
    4: {
      name: 'Third Floor',
      features: ['Research Lab', 'Meeting Rooms', 'Library'],
    },
  };

  const currentFloor = floorInfo[floorNumber] || { name: `Floor ${floorNumber}`, features: ['Coming soon...'] };

  return (
    <div className="demo-floor-map">
      <div className="demo-floor-header">
        <h3>{buildingName}</h3>
        <p className="demo-floor-title">{currentFloor.name}</p>
      </div>

      <div className="demo-floor-layout">
        {/* Simple grid representation */}
        <div className="demo-floor-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="demo-floor-room">
              {i % 2 === 0 ? '📚' : '🔬'}
            </div>
          ))}
        </div>
      </div>

      <div className="demo-floor-features">
        <h4>This Floor Contains:</h4>
        <ul>
          {currentFloor.features.map((feature, i) => (
            <li key={i}>✓ {feature}</li>
          ))}
        </ul>
      </div>

      <div className="demo-floor-notice">
        <p>
          📄 <strong>Full floor map PDF not loaded yet.</strong>
        </p>
        <p>Place your Science Hall PDF at:</p>
        <code>/public/assets/floormaps/science-hall.pdf</code>
      </div>
    </div>
  );
}
