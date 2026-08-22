import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { Procedure, GalleryWork } from '../../types';
import { formatCurrency, formatPriceOrConsult, formatTimeFriendly } from '../../utils/dateUtils';
import { getSafeImageUrl, DEFAULT_PROCEDURE_PHOTO, DEFAULT_GALLERY_PHOTO } from '../../utils/imageUtils';
import { X, Clock, Sparkles, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';

interface ProcedureDetailModalProps {
  procedure: Procedure | null;
  onClose: () => void;
  onBookProcedure: (proc: Procedure) => void;
  onOpenGalleryZoom: (work: GalleryWork) => void;
}

export const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
  procedure,
  onClose,
  onBookProcedure,
  onOpenGalleryZoom,
}) => {
  const { gallery } = useSalon();

  if (!procedure) return null;

  // Related gallery works
  const relatedWorks = gallery.filter(
    (g) => g.procedureId === procedure.id || g.category === procedure.category
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header photo banner */}
        <div className="relative h-56 w-full bg-[#2D2926]">
          <img
            src={getSafeImageUrl(procedure.photo, DEFAULT_PROCEDURE_PHOTO)}
            alt={procedure.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D2926]/90 via-transparent to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Pill */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#8E5D52] text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-[#EAE4DD]">
            {procedure.category}
          </div>

          {/* Bottom Title on photo */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="font-['Playfair_Display',serif] text-lg sm:text-2xl font-bold leading-tight drop-shadow-xs break-words line-clamp-2">
              {procedure.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Key metrics: Duration & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F2ED] text-[#8E5D52] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#7D756D] block">Duração</span>
                <span className="text-sm font-bold text-[#2D2926]">
                  {formatTimeFriendly(procedure.durationMinutes)}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F2ED] text-[#8E5D52] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#7D756D] block">Investimento</span>
                <span className={`block ${procedure.price && procedure.price > 0 ? 'text-base font-extrabold text-[#8E5D52]' : 'text-sm font-bold text-[#8E5D52]'}`}>
                  {formatPriceOrConsult(procedure.price, 'Sob consulta')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
              Sobre o Procedimento
            </h4>
            <p className="text-xs sm:text-sm text-[#59524C] leading-relaxed">
              {procedure.description}
            </p>
          </div>

          {/* Related Gallery Photos */}
          {relatedWorks.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-[#F0EAE4]">
              <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider flex items-center justify-between">
                <span>Fotos de Trabalhos Reais</span>
                <span className="text-[11px] font-normal text-[#8E5D52]">{relatedWorks.length} fotos</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {relatedWorks.slice(0, 3).map((work) => (
                  <div
                    key={work.id}
                    onClick={() => onOpenGalleryZoom(work)}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-[#EAE4DD]"
                  >
                    <img
                      src={getSafeImageUrl(work.photo, DEFAULT_GALLERY_PHOTO)}
                      alt={work.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-[#EAE4DD] bg-[#FDFBF9] flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#7D756D] block">Total</span>
            <span className={`block ${procedure.price && procedure.price > 0 ? 'text-lg font-extrabold text-[#2D2926]' : 'text-sm font-bold text-[#8E5D52]'}`}>
              {formatPriceOrConsult(procedure.price, 'Sob consulta')}
            </span>
          </div>

          <button
            id="procedure-detail-book-btn"
            onClick={() => {
              onClose();
              onBookProcedure(procedure);
            }}
            className="flex-1 py-3.5 px-5 bg-[#8E5D52] hover:bg-[#784D43] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>AGENDAR PROCEDIMENTO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
