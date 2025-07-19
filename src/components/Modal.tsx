import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 bg-[rgba(0,20,40,0.95)] p-6 rounded-xl border-2 border-[#00ffe1] shadow-[0_0_20px_#00ffe1] animate-fade-in"
        style={{ maxWidth: 'calc(80vw - 2rem)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-[#00ffe1]/50 bg-gradient-to-br from-[#00ffe1]/10 to-[#00ffe1]/5">
              <Sparkles className="w-6 h-6 text-[#00ffe1]" />
            </div>
            <h2 className="text-2xl font-bold text-[#00ffe1] drop-shadow-[0_0_10px_#00ffe1]">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="group p-2 rounded-full border border-[#00ffe1]/30 bg-[#1a1a1a] hover:bg-[#2a2a2a] hover:border-[#00ffe1] transition-all"
          >
            <X className="w-6 h-6 text-[#00ffe1] group-hover:text-[#00ff88] transition-colors" />
          </button>
        </div>
        
        <div className="relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};