import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

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
      <label className="block text-[#00ffe1] mb-2 drop-shadow-[0_0_5px_#00ffe1]">
        Foto do Personagem:
      </label>
      <div 
        ref={containerRef}
        className="relative w-full max-w-[320px] aspect-square"
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
              className={`w-full h-full rounded-xl border-4 border-[#00ffe1] shadow-[0_0_10px_#00ffe1] object-cover transition-transform ${
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
                className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700 transition-colors z-10"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full rounded-xl border-4 border-[#00ffe1] shadow-[0_0_10px_#00ffe1] flex items-center justify-center bg-[#1a1a1a]">
            <span className="text-[#00ffe1] text-sm">Sem foto</span>
          </div>
        )}
      </div>

      {!readOnly && (
        <>
          <input
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
            id="photo-input"
          />
          <label
            htmlFor="photo-input"
            className="cursor-pointer bg-[#1a1a1a] text-[#00ffe1] border border-[#00ffe1] rounded-lg px-4 py-2 hover:bg-[#2a2a2a] transition-colors"
          >
            Escolher foto
          </label>
        </>
      )}
    </div>
  );
};