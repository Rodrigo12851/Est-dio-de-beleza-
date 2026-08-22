import React, { useState, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import { GalleryWork, Procedure } from '../../types';
import { formatDateBR } from '../../utils/dateUtils';
import { getSafeImageUrl, DEFAULT_GALLERY_PHOTO } from '../../utils/imageUtils';
import {
  X,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Layers,
  ExternalLink
} from 'lucide-react';

interface GalleryLightboxModalProps {
  work: GalleryWork | null;
  onClose: () => void;
  onBookProcedureById: (procedureId?: string) => void;
}

export const GalleryLightboxModal: React.FC<GalleryLightboxModalProps> = ({
  work,
  onClose,
  onBookProcedureById,
}) => {
  const { procedures, config } = useSalon();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photos = work ? (work.photos && work.photos.length > 0 ? work.photos : [work.photo]) : [];

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [work]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length, onClose]);

  if (!work) return null;

  const linkedProcedure = work.procedureId
    ? procedures.find((p) => p.id === work.procedureId)
    : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const instagramUrl = config.instagram
    ? config.instagram.startsWith('http')
      ? config.instagram
      : `https://instagram.com/${config.instagram.replace('@', '').trim()}`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-[#231F1C] text-[#FDFBF9] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#3D3631] flex flex-col max-h-[95vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo view with Carousel navigation */}
        <div className="relative bg-black flex items-center justify-center min-h-[260px] sm:min-h-[340px] max-h-[55vh] overflow-hidden group">
          <img
            key={currentPhotoIndex}
            src={getSafeImageUrl(photos[currentPhotoIndex] || work.photo, DEFAULT_GALLERY_PHOTO)}
            alt={`${work.title} - Foto ${currentPhotoIndex + 1}`}
            referrerPolicy="no-referrer"
            className="w-full h-full max-h-[55vh] object-contain transition-opacity duration-300 select-none"
          />

          {/* Prev / Next navigation buttons if multiple photos */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-lg active:scale-95 z-10"
                title="Foto anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-lg active:scale-95 z-10"
                title="Próxima foto"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide Counter Badge */}
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D48D80]" />
                <span>
                  {currentPhotoIndex + 1} de {photos.length}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip (if multiple photos) */}
        {photos.length > 1 && (
          <div className="px-6 py-2.5 bg-[#1C1816] border-t border-b border-[#332D29] flex items-center gap-2 overflow-x-auto">
            {photos.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPhotoIndex(idx)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentPhotoIndex === idx
                    ? 'border-[#8E5D52] scale-105 shadow-xs'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={getSafeImageUrl(p, DEFAULT_GALLERY_PHOTO)}
                  alt={`Miniatura ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Content Info */}
        <div className="p-6 space-y-4 bg-[#231F1C] overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#D48D80] uppercase tracking-wider bg-[#8E5D52]/30 px-2.5 py-0.5 rounded-full border border-[#8E5D52]/40">
              {work.category}
            </span>
            <span className="text-xs text-[#A8A099]">
              {formatDateBR(work.date)}
            </span>
          </div>

          <h3 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-white">
            {work.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#D8D2CB] leading-relaxed">
            {work.description}
          </p>

          {/* Action to book this procedure & Instagram */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-[#3D3631] gap-3">
            <div className="flex items-center gap-3">
              {linkedProcedure ? (
                <div className="text-xs text-[#D8D2CB]">
                  <span>Serviço: </span>
                  <strong className="text-white">{linkedProcedure.name}</strong>
                </div>
              ) : (
                <div className="text-xs text-[#A8A099]">
                  Gostou deste resultado?
                </div>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#D48D80] hover:text-[#E8A599] font-medium transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Ver no Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onBookProcedureById(work.procedureId);
              }}
              className="px-5 py-3 bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Horário</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
