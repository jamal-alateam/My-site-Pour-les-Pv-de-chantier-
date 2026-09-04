import React from 'react';
import { PVPhoto, PhotoArrowAnnotation } from '../types';

interface PhotoWithAnnotationsProps {
  photo: PVPhoto;
  className?: string;
  imageClassName?: string;
  showCommentBadges?: boolean;
  selectedAnnotationId?: string | null;
  onSelectAnnotation?: (annotation: PhotoArrowAnnotation) => void;
  interactive?: boolean;
}

export const PhotoWithAnnotations: React.FC<PhotoWithAnnotationsProps> = ({
  photo,
  className = '',
  imageClassName = 'w-full h-full object-cover',
  showCommentBadges = true,
  selectedAnnotationId = null,
  onSelectAnnotation,
  interactive = false,
}) => {
  const annotations = photo.annotations || [];

  return (
    <div className={`relative overflow-hidden select-none ${className}`}>
      {/* Background Image */}
      <img
        src={photo.url}
        alt={photo.caption || 'Photo de chantier'}
        className={imageClassName}
        loading="lazy"
      />

      {/* SVG Arrows Layer */}
      {annotations.length > 0 && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <filter id={`arrow-shadow-${photo.id || 'p'}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0.4" dy="0.4" stdDeviation="0.4" floodColor="#000000" floodOpacity="0.9" />
            </filter>

            {/* Arrowhead Markers for various colors */}
            {annotations.map((ann, idx) => {
              const color = ann.color || '#DC2626';
              const markerId = `arrowhead-${photo.id || 'p'}-${idx}`;
              return (
                <marker
                  key={markerId}
                  id={markerId}
                  markerWidth="5"
                  markerHeight="5"
                  refX="4"
                  refY="2.5"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <polygon
                    points="0 0.5, 4.5 2.5, 0 4.5, 1 2.5"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="0.3"
                  />
                </marker>
              );
            })}
          </defs>

          {annotations.map((ann, idx) => {
            const color = ann.color || '#DC2626';
            const markerId = `arrowhead-${photo.id || 'p'}-${idx}`;
            const isSelected = selectedAnnotationId === ann.id;

            return (
              <g key={ann.id || idx} filter={`url(#arrow-shadow-${photo.id || 'p'})`}>
                {/* Halo for selected arrow */}
                {isSelected && (
                  <line
                    x1={ann.startX}
                    y1={ann.startY}
                    x2={ann.targetX}
                    y2={ann.targetY}
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                )}

                {/* Main Arrow Line */}
                <line
                  x1={ann.startX}
                  y1={ann.startY}
                  x2={ann.targetX}
                  y2={ann.targetY}
                  stroke={color}
                  strokeWidth={isSelected ? '1.4' : '1.0'}
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                />

                {/* Target Point Dot at the arrow tip */}
                <circle
                  cx={ann.targetX}
                  cy={ann.targetY}
                  r="0.8"
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="0.4"
                />

                {/* Start origin point dot */}
                <circle
                  cx={ann.startX}
                  cy={ann.startY}
                  r="1.0"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Comment Badges Overlay */}
      {showCommentBadges && annotations.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {annotations.map((ann, idx) => {
            const color = ann.color || '#DC2626';
            const isSelected = selectedAnnotationId === ann.id;

            // Compute alignment to avoid overflowing image bounds
            const isNearRight = ann.startX > 70;
            const isNearBottom = ann.startY > 80;

            let transformClass = 'translate(-50%, -50%)';
            if (isNearRight && isNearBottom) transformClass = 'translate(-100%, -100%)';
            else if (isNearRight) transformClass = 'translate(-100%, -50%)';
            else if (isNearBottom) transformClass = 'translate(-50%, -100%)';

            return (
              <div
                key={ann.id || idx}
                style={{
                  left: `${Math.max(2, Math.min(98, ann.startX))}%`,
                  top: `${Math.max(2, Math.min(98, ann.startY))}%`,
                  transform: transformClass,
                }}
                className={`absolute transition-all duration-150 ${
                  interactive ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
                }`}
                onClick={(e) => {
                  if (interactive && onSelectAnnotation) {
                    e.stopPropagation();
                    onSelectAnnotation(ann);
                  }
                }}
              >
                <div
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-md text-white border transition ${
                    isSelected
                      ? 'ring-2 ring-white scale-105 shadow-xl font-bold'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: color,
                    borderColor: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white/25 flex items-center justify-center text-[9px] font-black shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-[9.5px] font-semibold whitespace-nowrap drop-shadow-xs max-w-[160px] sm:max-w-[220px] truncate">
                    {ann.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
