import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { GalleryWork, ProcedureCategory } from '../../types';
import { formatDateBR, getTodayDateStr } from '../../utils/dateUtils';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Star,
  Calendar,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const CATEGORIES: ProcedureCategory[] = ['Cabelo', 'Maquiagem', 'Unhas', 'Sobrancelhas', 'Outros'];

export const AdminGallery: React.FC = () => {
  const { gallery, procedures, saveGalleryWork, deleteGalleryWork } = useSalon();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<GalleryWork | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProcedureCategory>('Maquiagem');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDateStr());
  const [photo, setPhoto] = useState('');
  const [featured, setFeatured] = useState(false);
  const [procedureId, setProcedureId] = useState('');

  const handleOpenNew = () => {
    setEditingWork(null);
    setTitle('');
    setCategory('Maquiagem');
    setDescription('');
    setDate(getTodayDateStr());
    setPhoto('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800');
    setFeatured(false);
    setProcedureId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (work: GalleryWork) => {
    setEditingWork(work);
    setTitle(work.title);
    setCategory(work.category);
    setDescription(work.description);
    setDate(work.date);
    setPhoto(work.photo);
    setFeatured(work.featured);
    setProcedureId(work.procedureId || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja remover "${title}" da galeria?`)) {
      deleteGalleryWork(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !photo.trim()) return;

    const workData: GalleryWork = {
      id: editingWork ? editingWork.id : `gal-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      date,
      photo: photo.trim(),
      featured,
      procedureId: procedureId || undefined,
    };

    saveGalleryWork(workData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#8E5D52]" />
            <span>Gerenciar Galeria de Trabalhos & Portfólio</span>
          </h2>
          <p className="text-xs text-[#7D756D] mt-1">
            Cadastre fotos dos procedimentos reais para atrair e encantar novas clientes
          </p>
        </div>

        <button
          id="admin-add-gallery-btn"
          onClick={handleOpenNew}
          className="px-5 py-3 bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Trabalho</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gallery.map((work) => (
          <div
            key={work.id}
            className="bg-white rounded-3xl border border-[#EAE4DD] overflow-hidden shadow-xs hover:border-[#8E5D52]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 bg-[#F5F2ED] overflow-hidden">
                <img
                  src={work.photo}
                  alt={work.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#8E5D52] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                  {work.category}
                </div>

                {work.featured && (
                  <div className="absolute top-3 right-3 bg-[#8E5D52] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Destaque</span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#7D756D]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateBR(work.date)}
                  </span>
                </div>

                <h3 className="font-bold text-[#2D2926] text-sm leading-snug">
                  {work.title}
                </h3>

                <p className="text-xs text-[#7D756D] line-clamp-2 leading-relaxed">
                  {work.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-2 border-t border-[#F5F2ED] flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(work)}
                className="p-2 text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer"
                title="Editar publicação"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(work.id, work.title)}
                className="p-2 text-[#C93B2B] hover:text-[#A32617] hover:bg-[#FDEDED] rounded-xl transition-colors cursor-pointer"
                title="Excluir da galeria"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
              <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
                {editingWork ? 'Editar Publicação' : 'Nova Foto na Galeria'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#7D756D] hover:text-[#2D2926] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Título / Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maquiagem Glow com Esfumado Clássico"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProcedureCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                    Data da Realização
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  URL da Foto *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Vincular a um Procedimento do Catálogo (Opcional)
                </label>
                <select
                  value={procedureId}
                  onChange={(e) => setProcedureId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                >
                  <option value="">Nenhum procedimento vinculado</option>
                  {procedures.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Descrição do Trabalho
                </label>
                <textarea
                  rows={2}
                  placeholder="Conte um pouco sobre a técnica utilizada, produtos ou ocasião..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="work-featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#8E5D52] rounded border-[#EAE4DD] focus:ring-[#8E5D52] cursor-pointer"
                />
                <label htmlFor="work-featured" className="text-xs font-bold text-[#2D2926] cursor-pointer">
                  Destacar na página inicial do site
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#8E5D52] hover:bg-[#784D43] active:scale-98 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {editingWork ? 'Salvar Alterações' : 'Publicar Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
