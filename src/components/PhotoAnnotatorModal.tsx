import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Check,
  MousePointer,
  Download,
  Tag,
  ArrowUpRight,
  Palette,
  Eye,
  Info
} from 'lucide-react';
import { PVPhoto, PhotoArrowAnnotation } from '../types';

interface PhotoAnnotatorModalProps {
  photos: PVPhoto[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePhotoAnnotations: (photoIndex: number, annotations: PhotoArrowAnnotation[]) => void;
  readOnly?: boolean;
}

const COLOR_PALETTE = [
  { name: 'Rouge (Urgent / Défaut)', value: '#DC2626' },
  { name: 'Ambre (Réserve / Attention)', value: '#D97706' },
  { name: 'Bleu (Technique / Mesure)', value: '#2563EB' },
  { name: 'Vert (Validé / Conforme)', value: '#059669' },
  { name: 'Violet (Finition / Archi)', value: '#7C3AED' },
  { name: 'Noir (Neutre)', value: '#1E293B' },
];

const PRESET_COMMENTS = [
  'Fissure à reprendre',
  'Reprise étanchéité requise',
  'Réservation à protéger',
  'Ferraillage apparent non conforme',
  'Joint d\'étanchéité défectueux',
  'Manque calage de niveau',
  'Épaufrure béton à ragréer',
  'Attente électrique à vérifier',
  'Gravois à évacuer immédiatement',
  'Conforme aux règles de l\'art'
];

type ArrowDirection = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';

export const PhotoAnnotatorModal: React.FC<PhotoAnnotatorModalProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onUpdatePhotoAnnotations,
  readOnly = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isAddingArrow, setIsAddingArrow] = useState<boolean>(false);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  // New or editing annotation state
  const [commentText, setCommentText] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#DC2626');
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation with Left and Right arrows
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const annotations = currentPhoto?.annotations || [];

  const goToPrev = () => {
    setIsAddingArrow(false);
    setActiveAnnotationId(null);
    setEditingAnnotationId(null);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setIsAddingArrow(false);
    setActiveAnnotationId(null);
    setEditingAnnotationId(null);
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Click on the image to place or point an arrow
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedTargetX = Math.max(5, Math.min(95, Math.round(x * 10) / 10));
    const clampedTargetY = Math.max(5, Math.min(95, Math.round(y * 10) / 10));

    if (isAddingArrow || !editingAnnotationId) {
      // Create new arrow pointing at this location
      // Calculate sensible start offset for comment bubble
      let startX = clampedTargetX < 50 ? clampedTargetX + 22 : clampedTargetX - 22;
      let startY = clampedTargetY < 50 ? clampedTargetY + 18 : clampedTargetY - 18;

      startX = Math.max(8, Math.min(92, startX));
      startY = Math.max(8, Math.min(92, startY));

      const newId = `arrow_${Date.now()}`;
      const newAnn: PhotoArrowAnnotation = {
        id: newId,
        targetX: clampedTargetX,
        targetY: clampedTargetY,
        startX,
        startY,
        text: commentText.trim() || 'Constat à traiter',
        color: selectedColor,
        date: new Date().toLocaleDateString('fr-FR'),
      };

      const updated = [...annotations, newAnn];
      onUpdatePhotoAnnotations(currentIndex, updated);
      setActiveAnnotationId(newId);
      setEditingAnnotationId(newId);
      setCommentText(newAnn.text);
      setIsAddingArrow(false);
    }
  };

  // Adjust arrow direction helper
  const setArrowDirection = (annId: string, dir: ArrowDirection) => {
    const ann = annotations.find((a) => a.id === annId);
    if (!ann) return;

    const offsetDist = 20;
    let newStartX = ann.targetX;
    let newStartY = ann.targetY;

    switch (dir) {
      case 'top-left':
        newStartX = ann.targetX - offsetDist;
        newStartY = ann.targetY - offsetDist;
        break;
      case 'top-right':
        newStartX = ann.targetX + offsetDist;
        newStartY = ann.targetY - offsetDist;
        break;
      case 'bottom-left':
        newStartX = ann.targetX - offsetDist;
        newStartY = ann.targetY + offsetDist;
        break;
      case 'bottom-right':
        newStartX = ann.targetX + offsetDist;
        newStartY = ann.targetY + offsetDist;
        break;
      case 'top':
        newStartX = ann.targetX;
        newStartY = ann.targetY - offsetDist;
        break;
      case 'bottom':
        newStartX = ann.targetX;
        newStartY = ann.targetY + offsetDist;
        break;
      case 'left':
        newStartX = ann.targetX - offsetDist;
        newStartY = ann.targetY;
        break;
      case 'right':
        newStartX = ann.targetX + offsetDist;
        newStartY = ann.targetY;
        break;
    }

    newStartX = Math.max(6, Math.min(94, newStartX));
    newStartY = Math.max(6, Math.min(94, newStartY));

    const updated = annotations.map((a) =>
      a.id === annId ? { ...a, startX: newStartX, startY: newStartY } : a
    );
    onUpdatePhotoAnnotations(currentIndex, updated);
  };

  const handleUpdateActiveComment = (newText: string, newColor?: string) => {
    if (!editingAnnotationId) return;
    const updated = annotations.map((a) =>
      a.id === editingAnnotationId
        ? { ...a, text: newText, color: newColor || a.color || selectedColor }
        : a
    );
    onUpdatePhotoAnnotations(currentIndex, updated);
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter((a) => a.id !== id);
    onUpdatePhotoAnnotations(currentIndex, updated);
    if (activeAnnotationId === id) setActiveAnnotationId(null);
    if (editingAnnotationId === id) setEditingAnnotationId(null);
  };

  // Download annotated image baked onto canvas
  const handleExportAnnotatedImage = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1920;
      canvas.height = img.naturalHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw each arrow and comment
      annotations.forEach((ann, idx) => {
        const color = ann.color || '#DC2626';
        const startX = (ann.startX / 100) * canvas.width;
        const startY = (ann.startY / 100) * canvas.height;
        const targetX = (ann.targetX / 100) * canvas.width;
        const targetY = (ann.targetY / 100) * canvas.height;

        // Draw shadow line
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(4, canvas.width * 0.0035);
        ctx.lineCap = 'round';

        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(targetY - startY, targetX - startX);
        const headLength = Math.max(18, canvas.width * 0.015);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(
          targetX - headLength * Math.cos(angle - Math.PI / 7),
          targetY - headLength * Math.sin(angle - Math.PI / 7)
        );
        ctx.lineTo(
          targetX - headLength * Math.cos(angle + Math.PI / 7),
          targetY - headLength * Math.sin(angle + Math.PI / 7)
        );
        ctx.closePath();
        ctx.fill();

        // Target dot
        ctx.beginPath();
        ctx.arc(targetX, targetY, Math.max(5, canvas.width * 0.004), 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // Comment pill badge
        const text = `[${idx + 1}] ${ann.text}`;
        ctx.font = `bold ${Math.max(16, Math.round(canvas.width * 0.014))}px sans-serif`;
        const textMetrics = ctx.measureText(text);
        const padX = 14;
        const padY = 8;
        const boxWidth = textMetrics.width + padX * 2;
        const boxHeight = Math.max(28, Math.round(canvas.width * 0.024));

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;

        // Rounded box for comment
        const boxX = startX - boxWidth / 2;
        const boxY = startY - boxHeight / 2;
        const radius = 6;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text inside box
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, startX, startY);
        ctx.restore();
      });

      // Save canvas as JPEG download
      const link = document.createElement('a');
      link.download = `photo_chantier_${currentPhoto.lot || 'pv'}_${currentIndex + 1}_annotee.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    };
    img.src = currentPhoto.url;
  };

  const activeAnnotation = annotations.find((a) => a.id === editingAnnotationId);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col text-white select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0B1F3A] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold bg-[#C9A24B] text-[#0B1F3A] px-2 py-0.5 rounded">
            Photo {currentIndex + 1} / {photos.length}
          </span>
          <div>
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <span>{currentPhoto.caption || `Vue Chantier N°${currentIndex + 1}`}</span>
              {currentPhoto.lot && (
                <span className="text-[10px] bg-white/10 px-2 py-0.2 rounded font-sans font-normal text-gray-300">
                  {currentPhoto.lot}
                </span>
              )}
            </h3>
            <div className="text-[10px] text-gray-400 font-mono">
              {currentPhoto.date || 'Date de visite'} • {annotations.length} flèche{annotations.length > 1 ? 's' : ''} de commentaire
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportAnnotatedImage}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold transition"
            title="Télécharger l'image avec les flèches et commentaires gravés en HD"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A24B]" />
            Exporter Photo Annotée
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Fermer la visionneuse (Échap)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Left/Center Photo Canvas View */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden bg-black/40">
          {/* Previous Photo Navigation Arrow */}
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-2 sm:left-4 z-40 p-2.5 sm:p-3.5 rounded-full bg-[#0B1F3A]/80 hover:bg-[#0B1F3A] text-white hover:text-[#C9A24B] border border-white/20 shadow-xl transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Photo Précédente (Touche Flèche Gauche ←)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Next Photo Navigation Arrow */}
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 sm:right-4 z-40 p-2.5 sm:p-3.5 rounded-full bg-[#0B1F3A]/80 hover:bg-[#0B1F3A] text-white hover:text-[#C9A24B] border border-white/20 shadow-xl transition transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Photo Suivante (Touche Flèche Droite →)"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Interactive Photo Canvas Container */}
          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className={`relative max-w-full max-h-[78vh] aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/20 bg-black/60 select-none ${
              isAddingArrow ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <img
              src={currentPhoto.url}
              alt="Photo de chantier"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Hint overlay when in add arrow mode */}
            {isAddingArrow && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#0B1F3A]/90 border border-[#C9A24B] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
                <MousePointer className="w-4 h-4 text-[#C9A24B]" />
                <span>Cliquez sur l'anomalie ou la zone à pointer pour placer la flèche</span>
              </div>
            )}

            {/* SVG Arrows Layer */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            >
              <defs>
                <filter id="modal-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.9" />
                </filter>

                {annotations.map((ann, idx) => {
                  const color = ann.color || '#DC2626';
                  const markerId = `m-arrow-${idx}`;
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
                        strokeWidth="0.4"
                      />
                    </marker>
                  );
                })}
              </defs>

              {annotations.map((ann, idx) => {
                const color = ann.color || '#DC2626';
                const markerId = `m-arrow-${idx}`;
                const isSelected = activeAnnotationId === ann.id || editingAnnotationId === ann.id;

                return (
                  <g key={ann.id || idx} filter="url(#modal-shadow)">
                    {isSelected && (
                      <line
                        x1={ann.startX}
                        y1={ann.startY}
                        x2={ann.targetX}
                        y2={ann.targetY}
                        stroke="#ffffff"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    )}

                    {/* Arrow Line */}
                    <line
                      x1={ann.startX}
                      y1={ann.startY}
                      x2={ann.targetX}
                      y2={ann.targetY}
                      stroke={color}
                      strokeWidth={isSelected ? '1.8' : '1.2'}
                      strokeLinecap="round"
                      markerEnd={`url(#${markerId})`}
                    />

                    {/* Arrow Tip Target Point */}
                    <circle
                      cx={ann.targetX}
                      cy={ann.targetY}
                      r="1.2"
                      fill="#ffffff"
                      stroke={color}
                      strokeWidth="0.5"
                    />

                    {/* Start Origin Point */}
                    <circle
                      cx={ann.startX}
                      cy={ann.startY}
                      r="1.5"
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Comment Labels Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {annotations.map((ann, idx) => {
                const color = ann.color || '#DC2626';
                const isSelected = activeAnnotationId === ann.id || editingAnnotationId === ann.id;

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
                      left: `${ann.startX}%`,
                      top: `${ann.startY}%`,
                      transform: transformClass,
                    }}
                    className="absolute pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAnnotationId(ann.id);
                      setEditingAnnotationId(ann.id);
                      setCommentText(ann.text);
                      setSelectedColor(ann.color || '#DC2626');
                    }}
                  >
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg text-white border transition duration-150 ${
                        isSelected
                          ? 'ring-2 ring-white scale-110 shadow-2xl font-bold z-30'
                          : 'hover:scale-105 opacity-95 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: color,
                        borderColor: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-black font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold whitespace-nowrap drop-shadow-sm max-w-[200px] truncate">
                        {ann.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side Sidebar: Tools & Comments Management */}
        <div className="w-full lg:w-84 bg-[#0B1F3A]/95 border-t lg:border-t-0 lg:border-l border-white/10 p-4 flex flex-col justify-between overflow-y-auto shrink-0 max-h-[45vh] lg:max-h-none">
          <div className="space-y-4">
            {/* Header & Add Button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="font-bold text-xs uppercase tracking-wider text-[#C9A24B] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Flèches & Commentaires ({annotations.length})
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingArrow(!isAddingArrow);
                    if (!isAddingArrow) {
                      setEditingAnnotationId(null);
                      setCommentText('');
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition shadow-sm ${
                    isAddingArrow
                      ? 'bg-amber-400 text-[#0B1F3A] animate-pulse'
                      : 'bg-[#C9A24B] hover:bg-[#b58f3d] text-[#0B1F3A]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingArrow ? 'Cliquez sur l\'image...' : '+ Nouvelle Flèche'}
                </button>
              )}
            </div>

            {/* Instruction banner */}
            <div className="bg-white/5 border border-white/10 rounded p-2 text-[11px] text-gray-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
              <div>
                <strong>Comment annoter :</strong> Cliquez sur "+ Nouvelle Flèche", puis cliquez directement sur l'image pour pointer le défaut.
              </div>
            </div>

            {/* Active / Editing Annotation Form */}
            {activeAnnotation && !readOnly && (
              <div className="bg-white/10 p-3 rounded-lg border border-[#C9A24B] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-[#C9A24B]" />
                    Éditer le commentaire
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteAnnotation(activeAnnotation.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
                    title="Supprimer cette flèche"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>

                {/* Comment Text Input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Texte du commentaire :
                  </label>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      handleUpdateActiveComment(e.target.value);
                    }}
                    placeholder="ex: Fissure à calfeutrer..."
                    className="w-full px-2.5 py-1.5 bg-black/40 border border-white/20 rounded text-xs text-white focus:outline-none focus:border-[#C9A24B]"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Suggestions rapides de chantier :
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {PRESET_COMMENTS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setCommentText(preset);
                          handleUpdateActiveComment(preset);
                        }}
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-gray-200 transition text-left"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Couleur de la flèche :
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PALETTE.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => {
                          setSelectedColor(col.value);
                          handleUpdateActiveComment(commentText, col.value);
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition transform hover:scale-110 ${
                          (activeAnnotation.color || '#DC2626') === col.value
                            ? 'border-white scale-110 ring-2 ring-[#C9A24B]'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.value }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Direction of Arrow */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Orientation du commentaire :
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => setArrowDirection(activeAnnotation.id, 'top')}
                      className="py-1 bg-white/10 hover:bg-white/20 text-[10px] rounded"
                      title="Haut"
                    >
                      ⬆️ Haut
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrowDirection(activeAnnotation.id, 'bottom')}
                      className="py-1 bg-white/10 hover:bg-white/20 text-[10px] rounded"
                      title="Bas"
                    >
                      ⬇️ Bas
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrowDirection(activeAnnotation.id, 'left')}
                      className="py-1 bg-white/10 hover:bg-white/20 text-[10px] rounded"
                      title="Gauche"
                    >
                      ⬅️ Gauche
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrowDirection(activeAnnotation.id, 'right')}
                      className="py-1 bg-white/10 hover:bg-white/20 text-[10px] rounded"
                      title="Droite"
                    >
                      ➡️ Droite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Annotations on this Photo */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Liste des flèches ({annotations.length}) :
              </div>

              {annotations.length === 0 ? (
                <div className="text-xs text-gray-400 italic py-2">
                  Aucune flèche sur cette photo. Cliquez sur "+ Nouvelle Flèche" pour en créer une.
                </div>
              ) : (
                annotations.map((ann, idx) => {
                  const isSelected = activeAnnotationId === ann.id;
                  return (
                    <div
                      key={ann.id || idx}
                      onClick={() => {
                        setActiveAnnotationId(ann.id);
                        setEditingAnnotationId(ann.id);
                        setCommentText(ann.text);
                        setSelectedColor(ann.color || '#DC2626');
                      }}
                      className={`flex items-center justify-between p-2 rounded text-xs transition cursor-pointer border ${
                        isSelected
                          ? 'bg-white/20 border-[#C9A24B]'
                          : 'bg-white/5 hover:bg-white/10 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: ann.color || '#DC2626' }}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate font-medium">{ann.text}</span>
                      </div>

                      {!readOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(ann.id);
                          }}
                          className="text-gray-400 hover:text-red-400 p-1 shrink-0"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Navigation thumbnail strip at bottom */}
          <div className="pt-3 border-t border-white/10 mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex justify-between">
              <span>Galerie du PV ({photos.length} photos)</span>
              <span className="text-[#C9A24B]">Navigation clavier ← →</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsAddingArrow(false);
                    setActiveAnnotationId(null);
                    setEditingAnnotationId(null);
                  }}
                  className={`w-14 h-9 rounded overflow-hidden shrink-0 border-2 transition relative ${
                    currentIndex === idx
                      ? 'border-[#C9A24B] scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  {p.annotations && p.annotations.length > 0 && (
                    <span className="absolute bottom-0.5 right-0.5 bg-red-600 text-[8px] font-bold px-1 rounded-xs">
                      {p.annotations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
