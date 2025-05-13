import React, { useState, useRef } from 'react';
import { X, Camera, Upload } from 'lucide-react';

interface CharacterPhotoProps {
  photo: string;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  readOnly?: boolean;
}

export const CharacterPhoto: React.FC<CharacterPhotoProps> = ({
  photo,
  onPhotoChange,
  onRemovePhoto,
  readOnly = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || readOnly) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const percentX = (deltaX / rect.width) * 100;
    const percentY = (deltaY / rect.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, startPosRef.current.posX - percentX)),
      y: Math.max(0, Math.min(100, startPosRef.current.posY - percentY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (readOnly) return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || readOnly) return;

    const deltaX = e.touches[0].clientX - startPosRef.current.x;
    const deltaY = e.touches[0].clientY - startPosRef.current.y;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const percentX = (deltaX / rect.width) * 100;
    const percentY = (deltaY / rect.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, startPosRef.current.posX - percentX)),
      y: Math.max(0, Math.min(100, startPosRef.current.posY - percentY))
    });

    // Prevent scrolling while dragging
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-[320px] aspect-square">
        {/* Decorative Frame */}
        <div className="absolute inset-0 -m-3 bg-gradient-to-br from-[#00ffe1]/20 to-[#00ffe1]/5 rounded-xl" />
        <div className="absolute inset-0 -m-2 border-2 border-[#00ffe1]/30 rounded-xl" />
        
        {/* Corner Decorations */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#00ffe1] rounded-tl-xl" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#00ffe1] rounded-tr-xl" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#00ffe1] rounded-bl-xl" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#00ffe1] rounded-br-xl" />

        {/* Magical Runes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full text-[#00ffe1]/30">
              <path d="M16 2L2 16l14 14 14-14L16 2zm0 8l6 6-6 6-6-6 6-6z" fill="currentColor"/>
            </svg>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rotate-180">
            <svg viewBox="0 0 32 32" className="w-full h-full text-[#00ffe1]/30">
              <path d="M16 2L2 16l14 14 14-14L16 2zm0 8l6 6-6 6-6-6 6-6z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Photo Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full overflow-hidden rounded-lg shadow-[0_0_15px_rgba(0,255,225,0.3)]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {photo ? (
            <>
              <img
                src={photo}
                alt="Character"
                className={`w-full h-full object-cover transition-transform ${
                  !readOnly ? 'cursor-move' : ''
                }`}
                style={{
                  objectPosition: `${position.x}% ${position.y}%`
                }}
                draggable={false}
              />
              {!readOnly && (
                <button
                  onClick={onRemovePhoto}
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700 transition-colors z-10 shadow-lg"
                >
                  <X size={16} className="text-white" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-[#00ffe1]/30">
              <Camera size={48} className="text-[#00ffe1]/50" />
              <span className="text-[#00ffe1]/50 text-sm">Sem foto</span>
            </div>
          )}

          {/* Magical Glow Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-[#00ffe1]/10 to-transparent opacity-50" />
            <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#00ffe1]/5 to-transparent opacity-30" />
          </div>
        </div>
      </div>

      {!readOnly && (
        <>
          <label
              className="group relative px-8 py-3 bg-[#001830] border border-[#00ffe1] rounded-lg overflow-hidden transition-all hover:bg-[#002040] hover:shadow-[0_0_20px_#00ffe1] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffe1]/0 via-[#00ffe1]/20 to-[#00ffe1]/0 animate-[shine_1.5s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex items-center gap-3 text-[#00ffe1] font-bold tracking-wider">
              <Upload className="w-5 h-5" />
              <span>Importar</span>
              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                className="hidden"
                id="photo-input"
              />
            </div>
          </label>
        </>
      )}
    </div>
  );
};