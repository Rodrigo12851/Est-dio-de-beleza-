import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Procedure, GalleryWork, ProcedureCategory } from '../../types';
import { formatCurrency, formatTimeFriendly, getDayOfWeekName } from '../../utils/dateUtils';
import { buildWhatsAppDirectContactUrl } from '../../utils/whatsappUtils';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Instagram,
  Heart,
  ChevronRight,
  ChevronLeft,
  Eye,
  CheckCircle2,
  Scissors,
  Brush,
  Smile,
  Star,
  Info,
  Filter,
  Image as ImageIcon,
  ExternalLink,
  Layers
} from 'lucide-react';

interface ClientHomeProps {
  onOpenBookingWithProcedure: (procedure?: Procedure) => void;
  onOpenProcedureDetails: (procedure: Procedure) => void;
  onOpenGalleryZoom: (work: GalleryWork) => void;
}

interface CategoryFilterItem {
  label: string;
  value: ProcedureCategory | 'Todos';
  icon: string;
}

const CATEGORIES: CategoryFilterItem[] = [
  { label: 'Todos', value: 'Todos', icon: '✨' },
  { label: 'Cabelo', value: 'Cabelo', icon: '💇‍♀️' },
  { label: 'Maquiagem', value: 'Maquiagem', icon: '💄' },
  { label: 'Unhas', value: 'Unhas', icon: '💅' },
  { label: 'Sobrancelhas', value: 'Sobrancelhas', icon: '👁️' },
];

// Interactive individual Gallery Card Slide component
const GalleryCardSlide: React.FC<{
  work: GalleryWork;
  onOpenZoom: (work: GalleryWork) => void;
}> = ({ work, onOpenZoom }) => {
  const photos = work.photos && work.photos.length > 0 ? work.photos : [work.photo];
  const [slideIndex, setSlideIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      id={`gallery-item-${work.id}`}
      className="group relative bg-[#F5F2ED] rounded-2xl sm:rounded-3xl overflow-hidden aspect-square border border-[#EAE4DD] shadow-xs hover:border-[#D48D80] flex flex-col justify-end select-none"
    >
      {/* Background Image of current slide */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => onOpenZoom(work)}>
        <img
          key={slideIndex}
          src={photos[slideIndex] || work.photo}
          alt={`${work.title} - foto ${slideIndex + 1}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Carousel Navigation Arrows if multiple photos */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors opacity-85 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
            title="Foto anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors opacity-85 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-md"
            title="Próxima foto"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots pagination */}
          <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center gap-1">
            {photos.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full ${
                  slideIndex === idx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Slide count tag */}
          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
            <Layers className="w-2.5 h-2.5 text-[#D48D80]" />
            <span>{slideIndex + 1}/{photos.length}</span>
          </div>
        </>
      )}

      {/* Top Badge: Featured */}
      {work.featured && (
        <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 bg-[#8E5D52] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-white shrink-0" />
          <span>Destaque</span>
        </div>
      )}

      {/* Gradient Overlay & Details (Click opens lightbox zoom) */}
      <div
        className="relative z-10 bg-gradient-to-t from-[#2D2926]/95 via-[#2D2926]/50 to-transparent p-2.5 sm:p-3.5 flex flex-col justify-end text-white pt-8 sm:pt-10 cursor-pointer"
        onClick={() => onOpenZoom(work)}
      >
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[9px] sm:text-[10px] font-bold text-[#D48D80] uppercase tracking-wider truncate max-w-[120px]">
            {work.category}
          </span>
        </div>

        <h4 className="text-[11px] sm:text-xs font-semibold line-clamp-2 leading-tight break-words">
          {work.title}
        </h4>

        <div className="flex items-center gap-1 mt-1 text-[9px] sm:text-[10px] text-[#D8D2CB]">
          <Eye className="w-3 h-3 shrink-0" />
          <span className="truncate">Toque para ampliar</span>
        </div>
      </div>
    </div>
  );
};

export const ClientHome: React.FC<ClientHomeProps> = ({
  onOpenBookingWithProcedure,
  onOpenProcedureDetails,
  onOpenGalleryZoom,
}) => {
  const { config, procedures, gallery } = useSalon();
  const [selectedCategory, setSelectedCategory] = useState<ProcedureCategory | 'Todos'>('Todos');
  const [galleryCategory, setGalleryCategory] = useState<ProcedureCategory | 'Todos'>('Todos');

  const activeProcedures = useMemo(() => procedures.filter((p) => p.active), [procedures]);

  // Procedure category counts
  const procCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: activeProcedures.length };
    CATEGORIES.forEach((cat) => {
      if (cat.value !== 'Todos') {
        counts[cat.value] = activeProcedures.filter((p) => p.category === cat.value).length;
      }
    });
    return counts;
  }, [activeProcedures]);

  // Gallery category counts
  const galleryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: gallery.length };
    CATEGORIES.forEach((cat) => {
      if (cat.value !== 'Todos') {
        counts[cat.value] = gallery.filter((g) => g.category === cat.value).length;
      }
    });
    return counts;
  }, [gallery]);

  const filteredProcedures = useMemo(() => {
    return selectedCategory === 'Todos'
      ? activeProcedures
      : activeProcedures.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, activeProcedures]);

  const filteredGallery = useMemo(() => {
    return galleryCategory === 'Todos'
      ? gallery
      : gallery.filter((g) => g.category === galleryCategory);
  }, [galleryCategory, gallery]);

  const whatsappUrl = buildWhatsAppDirectContactUrl(
    config.whatsapp,
    `Olá, ${config.ownerName}! 💕 Conheci seu salão pelo site e gostaria de saber mais.`
  );

  const instagramUrl = config.instagram
    ? config.instagram.startsWith('http')
      ? config.instagram
      : `https://instagram.com/${config.instagram.replace('@', '').trim()}`
    : 'https://instagram.com';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`;

  return (
    <div className="min-h-screen pb-24 sm:pb-16 bg-[#FDFBF9] overflow-x-hidden">
      {/* Bento Hero Section */}
      <section className="pt-4 sm:pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Main Hero Card (2 cols) */}
          <div className="lg:col-span-2 bg-[#2D2926] text-[#FDFBF9] rounded-3xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between border border-[#443E3A] shadow-xs relative overflow-hidden">
            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#8E5D52]/30 border border-[#8E5D52]/50 text-[#D48D80] text-[11px] sm:text-xs font-semibold max-w-full">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Salão de Beleza & Estética Especializada</span>
              </div>

              <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight break-words">
                {config.name}
              </h1>

              <p className="text-[#D8D2CB] text-xs sm:text-sm md:text-base leading-relaxed max-w-xl break-words">
                {config.tagline || 'Conheça nossos procedimentos exclusivos, veja os trabalhos realizados e agende seu horário com praticidade.'}
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 relative z-10">
              <button
                id="hero-book-cta-btn"
                onClick={() => onOpenBookingWithProcedure()}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white bg-[#8E5D52] hover:bg-[#784D43] rounded-2xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>AGENDAR HORÁRIO ONLINE</span>
              </button>

              <a
                id="hero-whatsapp-cta-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-[#EAE4DD] bg-[#3B342F] hover:bg-[#483F3A] border border-[#524741] rounded-2xl transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Side Bento Card: Professional Profile & Direct Instagram / Map Link */}
          <div className="bg-white rounded-3xl border border-[#EAE4DD] p-5 sm:p-7 flex flex-col justify-between shadow-xs space-y-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <img
                  src={config.avatar}
                  alt={config.ownerName}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#EAE4DD] shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8E5D52] uppercase tracking-wider block truncate">
                    Profissional
                  </span>
                  <h3 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-[#2D2926] truncate">
                    {config.ownerName}
                  </h3>
                  
                  {/* Clickable Instagram Link */}
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#8E5D52] hover:text-[#784D43] font-semibold transition-colors mt-0.5 truncate max-w-full group"
                    title="Abrir perfil no Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#E1306C] shrink-0" />
                    <span className="truncate">{config.instagram || '@studiobella'}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-[#59524C] leading-relaxed line-clamp-3 break-words">
                {config.bio}
              </p>
            </div>

            {/* Location & Open status */}
            <div className="pt-3.5 border-t border-[#F0EAE4] flex items-center justify-between text-xs text-[#7D756D] gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 min-w-0 flex-1 hover:text-[#8E5D52] transition-colors group"
                title="Ver endereço no Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8E5D52] shrink-0" />
                <span className="truncate font-medium">{config.address.split(',')[0]}</span>
              </a>
              <span className="text-emerald-700 text-[11px] font-bold bg-[#EAF5EC] px-2.5 py-1 rounded-full border border-[#C2E4C9] shrink-0 whitespace-nowrap">
                Aberto hoje
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">
        {/* Procedimentos Section */}
        <section id="procedimentos-section" className="space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 border-b border-[#EAE4DD] pb-3.5">
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl md:text-3xl font-bold text-[#2D2926] flex items-center gap-2">
                <span>Procedimentos & Serviços</span>
                <span className="text-[#8E5D52] text-lg sm:text-xl">✨</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#7D756D] mt-0.5">
                Escolha o serviço desejado para conferir detalhes e agendar seu horário
              </p>
            </div>
          </div>

          {/* Category Filter Chips for Procedures */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const count = procCounts[cat.value] || 0;

              return (
                <button
                  key={`proc-cat-${cat.value}`}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`relative px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#8E5D52] text-white shadow-xs'
                      : 'text-[#59524C] hover:text-[#2D2926] bg-white border border-[#EAE4DD] hover:bg-[#F5F2ED]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F2ED] text-[#7D756D]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Procedures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProcedures.map((proc) => (
              <div
                key={proc.id}
                id={`proc-card-${proc.id}`}
                className="bg-white rounded-3xl border border-[#EAE4DD] overflow-hidden shadow-xs hover:border-[#D48D80] transition-colors flex flex-col group"
              >
                {/* Photo container */}
                <div
                  className="relative h-44 sm:h-48 w-full bg-[#F5F2ED] overflow-hidden cursor-pointer"
                  onClick={() => onOpenProcedureDetails(proc)}
                >
                  <img
                    src={proc.photo}
                    alt={proc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#8E5D52] text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-[#EAE4DD] truncate max-w-[150px]">
                    {proc.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#2D2926]/85 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D48D80] shrink-0" />
                    <span>{formatTimeFriendly(proc.durationMinutes)}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="min-w-0">
                    <h3
                      className="font-bold text-[#2D2926] text-sm sm:text-base leading-snug cursor-pointer hover:text-[#8E5D52] transition-colors break-words line-clamp-2"
                      onClick={() => onOpenProcedureDetails(proc)}
                    >
                      {proc.name}
                    </h3>
                    <p className="text-xs text-[#7D756D] line-clamp-2 mt-1.5 leading-relaxed break-words">
                      {proc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0EAE4] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-[#7D756D] block">Valor</span>
                      <span className="text-base sm:text-lg font-extrabold text-[#2D2926] truncate block">
                        {formatCurrency(proc.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={() => onOpenProcedureDetails(proc)}
                        className="p-2 text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        title="Ver detalhes"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onOpenBookingWithProcedure(proc)}
                        className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#8E5D52] hover:bg-[#784D43] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <span>Agendar</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProcedures.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#EAE4DD]">
              <p className="text-[#7D756D] text-sm">Nenhum procedimento encontrado nesta categoria.</p>
            </div>
          )}
        </section>

        {/* Galeria de Trabalhos / Portfólio Section */}
        <section id="galeria-section" className="space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 border-b border-[#EAE4DD] pb-3.5">
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl md:text-3xl font-bold text-[#2D2926] flex items-center gap-2">
                <span>Galeria de Trabalhos</span>
                <span className="text-[#8E5D52] text-lg sm:text-xl">📸</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#7D756D] mt-0.5">
                Fotos reais dos resultados realizados no nosso salão • Passe o slide nos cards para conferir todos os ângulos
              </p>
            </div>
          </div>

          {/* Category Filter Chips for Gallery */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = galleryCategory === cat.value;
              const count = galleryCounts[cat.value] || 0;

              return (
                <button
                  key={`gal-filter-chip-${cat.value}`}
                  id={`gallery-filter-${cat.value.toLowerCase()}`}
                  onClick={() => setGalleryCategory(cat.value)}
                  className={`relative px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#2D2926] text-white shadow-xs'
                      : 'text-[#59524C] hover:text-[#2D2926] bg-white border border-[#EAE4DD] hover:bg-[#F5F2ED]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#F5F2ED] text-[#7D756D]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5">
            {filteredGallery.map((work) => (
              <GalleryCardSlide
                key={work.id}
                work={work}
                onOpenZoom={onOpenGalleryZoom}
              />
            ))}
          </div>

          {filteredGallery.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#EAE4DD] space-y-2">
              <ImageIcon className="w-8 h-8 text-[#A8A099] mx-auto" />
              <p className="text-[#2D2926] font-bold text-sm">Nenhuma foto encontrada</p>
              <p className="text-[#7D756D] text-xs">Não há fotos cadastradas nesta categoria no momento.</p>
            </div>
          )}
        </section>

        {/* Sobre & Localização Section */}
        <section id="sobre-section" className="bg-white rounded-3xl border border-[#EAE4DD] p-5 sm:p-8 lg:p-9 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Bio & Owner */}
            <div className="md:col-span-1 space-y-3.5 text-center md:text-left min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto md:mx-0 rounded-2xl overflow-hidden border-2 border-[#EAE4DD] shadow-xs">
                <img
                  src={config.avatar}
                  alt={config.ownerName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#2D2926] break-words">
                  {config.ownerName}
                </h3>
                <p className="text-xs text-[#8E5D52] font-bold mt-0.5">Proprietária & Profissional</p>
                <p className="text-xs text-[#59524C] mt-2.5 leading-relaxed break-words">
                  {config.bio}
                </p>

                {/* Direct Instagram Profile Link */}
                <div className="pt-3">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FDEDED]/70 hover:bg-[#FCE3DF] border border-[#F5C2BA] text-[#8E5D52] rounded-xl text-xs font-bold transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#E1306C]" />
                    <span>Ver Trabalhos no Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                  </a>
                </div>
              </div>
            </div>

            {/* Address & Hours */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 border-t md:border-t-0 md:border-l border-[#F0EAE4] pt-5 md:pt-0 md:pl-8 min-w-0">
              {/* Address info */}
              <div className="space-y-3.5 min-w-0">
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E5D52] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">Localização & Endereço</h4>
                    <p className="text-xs text-[#59524C] mt-1 leading-relaxed break-words">{config.address}</p>
                    
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#8E5D52] hover:text-[#784D43] underline transition-colors"
                    >
                      <span>Abrir no Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E5D52] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">Contato & WhatsApp</h4>
                    <p className="text-xs text-[#59524C] mt-1 truncate">{config.phone}</p>
                    {config.instagram && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#8E5D52] font-semibold hover:underline mt-0.5 truncate"
                      >
                        <Instagram className="w-3 h-3 text-[#E1306C]" />
                        <span>{config.instagram}</span>
                      </a>
                    )}
                  </div>
                </div>

                {config.cancellationPolicy && (
                  <div className="p-3 sm:p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] min-w-0">
                    <p className="text-[11px] font-bold text-[#8E5D52] flex items-center gap-1 mb-1">
                      <Info className="w-3.5 h-3.5 text-[#8E5D52] shrink-0" />
                      <span>Política de Cancelamento</span>
                    </p>
                    <p className="text-[11px] text-[#59524C] leading-relaxed break-words">
                      {config.cancellationPolicy}
                    </p>
                  </div>
                )}
              </div>

              {/* Working hours table */}
              <div className="space-y-2 min-w-0">
                <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8E5D52] shrink-0" />
                  <span>Horários de Atendimento</span>
                </h4>
                <div className="text-xs divide-y divide-[#F0EAE4] bg-[#FDFBF9] rounded-2xl p-3 sm:p-4 border border-[#EAE4DD]">
                  {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                    const sched = config.workingHours?.[dayIdx];
                    return (
                      <div key={dayIdx} className="py-2 flex items-center justify-between gap-2 min-w-0">
                        <span className="font-medium text-[#59524C] truncate">{getDayOfWeekName(dayIdx)}</span>
                        <span className={`shrink-0 ${sched?.enabled ? 'text-[#2D2926] font-bold' : 'text-[#A8A099]'}`}>
                          {sched?.enabled ? `${sched.start} às ${sched.end}` : 'Fechado'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Public Footer */}
      <footer className="mt-12 pt-8 pb-16 sm:pb-8 border-t border-[#EAE4DD] bg-[#F9F6F2] text-[#7D756D] text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-[#2D2926] text-sm font-['Playfair_Display',serif]">
              {config.name}
            </p>
            <p className="text-[11px] text-[#A8A099] mt-0.5">
              Todos os direitos reservados • Atendimento com horário marcado
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-2.5 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#EAE4DD] shadow-lg">
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-2.5 bg-[#EAF5EC] text-[#2F7D48] border border-[#C2E4C9] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 truncate"
          >
            <MessageCircle className="w-4 h-4 text-[#2F7D48] shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenBookingWithProcedure()}
            className="flex-2 py-3 px-3 bg-[#8E5D52] hover:bg-[#784D43] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer truncate"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">AGENDAR HORÁRIO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
