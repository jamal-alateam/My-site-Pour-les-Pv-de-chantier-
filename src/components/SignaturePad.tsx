import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface SignaturePadProps {
  initialValue?: string;
  onSave: (dataUrl: string) => void;
  title?: string;
  signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  initialValue,
  onSave,
  title = "Signature",
  signerName = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(!!initialValue);

  // Initialize and resize canvas with High-DPI / Retina scale support for iOS
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 360;
    const height = rect.height || 160;

    const dpr = Math.max(window.devicePixelRatio || 1, 2); // Ensure Retina sharpness
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#0B1F3A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  // Handle touch and mouse events natively with passive: false for smooth iOS drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCoordinates = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      isDrawingRef.current = true;
      setHasSignature(true);

      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      if (e.cancelable) e.preventDefault();

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleEnd = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const url = canvas.toDataURL('image/png');
      onSave(url);
    };

    // Attach native non-passive listeners for iOS Safari touch compatibility
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleEnd, { passive: false });

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
      canvas.removeEventListener('touchcancel', handleEnd);

      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseleave', handleEnd);
    };
  }, [onSave]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
  };

  return (
    <div className="border border-[#e2ded2] bg-[#f6f4ef] rounded-md p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#0B1F3A]" />
          <span className="font-semibold text-xs uppercase tracking-wider text-[#565048]">
            {title} {signerName ? `— ${signerName}` : ''}
          </span>
        </div>
        {hasSignature && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-[#a8481f] hover:underline flex items-center gap-1 font-medium"
          >
            <Eraser className="w-3.5 h-3.5" /> Effacer
          </button>
        )}
      </div>

      <div className="border border-[#c9c3b1] bg-white rounded relative overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          style={{ touchAction: 'none' }}
          className="w-full h-36 cursor-crosshair block touch-none"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs italic px-2 text-center">
            Signer au doigt ou au stylet ici
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between items-center text-[11px] text-[#565048]">
        <span>{hasSignature ? '✓ Signature enregistrée' : 'Non signé'}</span>
        <span className="font-mono text-[10px] text-gray-400">ARCHITEXPERT SIG</span>
      </div>
    </div>
  );
};
