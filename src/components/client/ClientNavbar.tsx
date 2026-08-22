import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { Sparkles, MessageCircle, Shield } from 'lucide-react';
import { buildWhatsAppDirectContactUrl } from '../../utils/whatsappUtils';
import { getSafeImageUrl, DEFAULT_AVATAR } from '../../utils/imageUtils';

interface ClientNavbarProps {
  onOpenBooking: () => void;
  onOpenAdminLogin: () => void;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({ onOpenBooking, onOpenAdminLogin }) => {
  const { config, isAdminAuthenticated, setViewMode } = useSalon();

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setViewMode('admin');
    } else {
      onOpenAdminLogin();
    }
  };

  const whatsappUrl = buildWhatsAppDirectContactUrl(config.whatsapp, `Olá, ${config.ownerName}! Vim pelo site e gostaria de tirar uma dúvida.`);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF9]/95 backdrop-blur-md border-b border-[#EAE4DD] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Salon Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border border-[#EAE4DD] shadow-xs bg-[#F5F2ED] flex items-center justify-center shrink-0">
            {config.avatar && config.avatar.trim() ? (
              <img
                src={getSafeImageUrl(config.avatar, DEFAULT_AVATAR)}
                alt={config.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-5 h-5 text-[#8E5D52]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-['Playfair_Display',serif] font-bold text-sm sm:text-base md:text-lg text-[#2D2926] leading-tight truncate">
              {config.name}
            </h1>
            <p className="text-[11px] text-[#8E5D52] font-semibold truncate hidden xs:block sm:block">
              Por {config.ownerName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* WhatsApp Direct */}
          <a
            id="nav-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-[#2F7D48] bg-[#EAF5EC] hover:bg-[#DDF0E0] border border-[#C2E4C9] rounded-2xl transition-colors"
            title="Tirar dúvidas no WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#2F7D48] shrink-0" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>

          {/* Book Now Primary Button */}
          <button
            id="nav-book-btn"
            onClick={onOpenBooking}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 rounded-2xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Agendar</span>
          </button>

          {/* Admin Switch */}
          <button
            id="nav-admin-btn"
            onClick={handleAdminClick}
            className="p-2 text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer shrink-0"
            title="Área da Profissional (Admin)"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
