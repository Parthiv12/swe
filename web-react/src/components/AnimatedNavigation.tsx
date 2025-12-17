/**
 * AnimatedNavigation Component - Insane Navigation Visualization
 * 
 * Features:
 * - Walking figure animation
 * - Progress tracking
 * - Distance and ETA display
 * - Smooth animated transitions
 * - Fun interactive design
 */

import { useEffect, useState } from 'react';
import { Path } from '../lib/graph';

interface Props {
  route: Path | null;
  isNavigating: boolean;
}

export default function AnimatedNavigation({ route, isNavigating }: Props) {
  const [progress, setProgress] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Animate progress through route
  useEffect(() => {
    if (!isNavigating || !route) {
      setProgress(0);
      setCurrentStepIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2; // 2% per interval
        if (newProgress >= 100) {
          return 100;
        }
        // Update step based on progress
        const stepIdx = Math.floor((newProgress / 100) * (route.instructions.length - 1));
        setCurrentStepIdx(Math.min(stepIdx, route.instructions.length - 1));
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isNavigating, route]);

  if (!route) return null;

  const totalDistance = route.distance;
  const distanceCovered = (progress / 100) * totalDistance;
  const remainingDistance = Math.max(0, totalDistance - distanceCovered);
  const remainingMinutes = Math.ceil((remainingDistance / totalDistance) * (route.duration / 60));

  const instruction = route.instructions[currentStepIdx] || route.instructions[route.instructions.length - 1];

  return (
    <div className="nav-animated-container">
      {/* Top Stats Bar */}
      <div className="nav-animated-header">
        <div className="nav-stat-item">
          <span className="nav-stat-icon">📍</span>
          <div>
            <div className="nav-stat-label">Distance Covered</div>
            <div className="nav-stat-value">{Math.round(distanceCovered)}m / {totalDistance}m</div>
          </div>
        </div>
        <div className="nav-stat-divider" />
        <div className="nav-stat-item">
          <span className="nav-stat-icon">⏱️</span>
          <div>
            <div className="nav-stat-label">Time Remaining</div>
            <div className="nav-stat-value">~{remainingMinutes} min</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="nav-progress-wrapper">
        <div className="nav-progress-bar">
          <div
            className="nav-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="nav-progress-percent">{progress}%</span>
      </div>

      {/* Walking Figure Animation */}
      <div className="nav-walker-container">
        <svg
          viewBox="0 0 300 100"
          className="nav-walker-canvas"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Path line */}
          <path
            d="M 20 50 Q 100 40 150 50 Q 200 60 280 50"
            stroke="rgba(79, 70, 229, 0.15)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress dot on path */}
          <circle
            cx={20 + (260 * progress) / 100}
            cy="50"
            r="4"
            fill="#4f46e5"
            style={{ opacity: 0.6 }}
          />

          {/* Walking Figure - animated */}
          <g
            transform={`translate(${20 + (260 * progress) / 100}, 25)`}
            className="nav-figure"
            style={{
              '--walk-offset': `${(progress * 3.6) % 360}deg`,
            } as React.CSSProperties}
          >
            {/* Head */}
            <circle cx="0" cy="-6" r="4" fill="#8b5cf6" />
            {/* Eyes */}
            <circle cx="-1" cy="-7" r="0.5" fill="#ffffff" />
            <circle cx="1" cy="-7" r="0.5" fill="#ffffff" />

            {/* Body */}
            <rect x="-2" y="0" width="4" height="8" fill="#4f46e5" rx="1" />

            {/* Left Leg */}
            <g style={{ animation: `walk-leg 0.6s ease-in-out infinite` }}>
              <line x1="-1" y1="8" x2="-2" y2="14" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Right Leg */}
            <g style={{ animation: `walk-leg-opposite 0.6s ease-in-out infinite` }}>
              <line x1="1" y1="8" x2="2" y2="14" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Left Arm */}
            <g style={{ animation: `swing-arm 0.6s ease-in-out infinite` }}>
              <line x1="-2" y1="2" x2="-5" y2="-2" stroke="#a3a3ff" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Right Arm */}
            <g style={{ animation: `swing-arm-opposite 0.6s ease-in-out infinite` }}>
              <line x1="2" y1="2" x2="5" y2="-2" stroke="#a3a3ff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>

          {/* Destination */}
          <g transform="translate(280, 50)">
            <circle cx="0" cy="0" r="8" fill="#22c55e" opacity="0.2" />
            <text x="0" y="2" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="bold">
              🎯
            </text>
          </g>

          {/* Start point */}
          <g transform="translate(20, 50)">
            <circle cx="0" cy="0" r="4" fill="#4f46e5" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Current Instruction */}
      <div className="nav-instruction-active">
        <div className="nav-instruction-step">
          Step {currentStepIdx + 1} of {route.instructions.length}
        </div>
        <div className="nav-instruction-text">
          <span className="nav-instruction-icon">
            {instruction.maneuverType === 'turn' ? '🔄' : instruction.maneuverType === 'arrive' ? '🎉' : '➡️'}
          </span>
          {instruction.text}
        </div>
      </div>

      {/* Upcoming Steps Preview */}
      <div className="nav-steps-preview">
        <h4>Next Steps</h4>
        {route.instructions
          .slice(currentStepIdx + 1, currentStepIdx + 3)
          .map((step, idx) => (
            <div key={step.index} className="nav-step-preview-item">
              <span className="nav-step-num">{currentStepIdx + idx + 2}</span>
              <span className="nav-step-text">{step.text.substring(0, 50)}</span>
            </div>
          ))}
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes walk-leg {
          0%, 100% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(-25deg); }
        }
        @keyframes walk-leg-opposite {
          0%, 100% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(25deg); }
        }
        @keyframes swing-arm {
          0%, 100% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(-35deg); }
        }
        @keyframes swing-arm-opposite {
          0%, 100% { transform: rotateZ(0deg); }
          50% { transform: rotateZ(35deg); }
        }
      `}</style>
    </div>
  );
}
