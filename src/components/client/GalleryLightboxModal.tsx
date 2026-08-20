import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { GalleryWork, Procedure } from '../../types';
import { formatDateBR } from '../../utils/dateUtils';
import { X, Calendar, Sparkles } from 'lucide-react';

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
  const { procedures } = useSalon();

  if (!work) return null;

  const linkedProcedure = work.procedureId
    ? procedures.find((p) => p.id === work.procedureId)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-[#231F1C] text-[#FDFBF9] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-[#3D3631] flex flex-col max-h-[95vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo view */}
        <div className="relative bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img
            src={work.photo}
            alt={work.title}
            referrerPolicy="no-referrer"
            className="w-full h-full max-h-[60vh] object-contain"
          />
        </div>

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

          {/* Action to book this procedure */}
          <div className="pt-3 flex items-center justify-between border-t border-[#3D3631]">
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

            <button
              onClick={() => {
                onClose();
                onBookProcedureById(work.procedureId);
              }}
              className="px-5 py-3 bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
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
