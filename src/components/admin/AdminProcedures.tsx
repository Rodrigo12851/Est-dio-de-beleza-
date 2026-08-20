import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Procedure, ProcedureCategory } from '../../types';
import { formatCurrency, formatTimeFriendly } from '../../utils/dateUtils';
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Image,
  CheckCircle2,
  XCircle,
  X,
  Sparkles
} from 'lucide-react';

const CATEGORIES: ProcedureCategory[] = ['Cabelo', 'Maquiagem', 'Unhas', 'Sobrancelhas', 'Outros'];

export const AdminProcedures: React.FC = () => {
  const { procedures, saveProcedure, deleteProcedure } = useSalon();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProcedureCategory>('Cabelo');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [photo, setPhoto] = useState('');
  const [active, setActive] = useState(true);

  const handleOpenNew = () => {
    setEditingProcedure(null);
    setName('');
    setCategory('Cabelo');
    setDescription('');
    setPrice('');
    setDurationMinutes('60');
    setPhoto('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proc: Procedure) => {
    setEditingProcedure(proc);
    setName(proc.name);
    setCategory(proc.category);
    setDescription(proc.description);
    setPrice(String(proc.price));
    setDurationMinutes(String(proc.durationMinutes));
    setPhoto(proc.photo);
    setActive(proc.active);
    setIsModalOpen(true);
  };

  const handleToggleActive = (proc: Procedure) => {
    saveProcedure({ ...proc, active: !proc.active });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o procedimento "${name}"?`)) {
      deleteProcedure(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !durationMinutes) return;

    const procedureData: Procedure = {
      id: editingProcedure ? editingProcedure.id : `proc-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      price: parseFloat(price) || 0,
      durationMinutes: parseInt(durationMinutes, 10) || 60,
      photo: photo.trim() || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
      active,
    };

    saveProcedure(procedureData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#8E5D52]" />
            <span>Cadastro de Procedimentos & Serviços</span>
          </h2>
          <p className="text-xs text-[#7D756D] mt-1">
            Gerencie o catálogo de procedimentos oferecidos no salão
          </p>
        </div>

        <button
          id="admin-add-procedure-btn"
          onClick={handleOpenNew}
          className="px-5 py-3 bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Procedimento</span>
        </button>
      </div>

      {/* Procedures Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {procedures.map((proc) => (
          <div
            key={proc.id}
            className={`bg-white rounded-3xl border transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 ${
              proc.active ? 'border-[#EAE4DD] hover:border-[#8E5D52]/50' : 'border-[#EAE4DD] opacity-60 bg-[#FDFBF9]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <img
                  src={proc.photo}
                  alt={proc.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-[#EAE4DD]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E5D52]">
                      {proc.category}
                    </span>
                    {!proc.active && (
                      <span className="text-[10px] font-bold text-[#7D756D] bg-[#EAE4DD] px-1.5 py-0.5 rounded-full">
                        Inativo
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#2D2926] text-sm truncate leading-tight mt-0.5">
                    {proc.name}
                  </h3>
                  <p className="text-xs text-[#7D756D] line-clamp-2 mt-1 leading-relaxed">
                    {proc.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#FDFBF9] rounded-2xl p-2.5 border border-[#F5F2ED] text-xs">
                <div className="flex items-center gap-1.5 text-[#7D756D]">
                  <Clock className="w-3.5 h-3.5 text-[#8E5D52]" />
                  <span>{formatTimeFriendly(proc.durationMinutes)}</span>
                </div>
                <div className="text-right font-extrabold text-[#2D2926]">
                  {formatCurrency(proc.price)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2.5 border-t border-[#F5F2ED] flex items-center justify-between">
              <button
                onClick={() => handleToggleActive(proc)}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  proc.active
                    ? 'text-[#2F7D48] bg-[#EAF5EC] hover:bg-[#D8EEDD]'
                    : 'text-[#7D756D] bg-[#EAE4DD] hover:bg-[#DDD6CE]'
                }`}
              >
                {proc.active ? '🟢 Ativo' : '⚪ Inativo'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(proc)}
                  className="p-2 text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer"
                  title="Editar procedimento"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(proc.id, proc.name)}
                  className="p-2 text-[#C93B2B] hover:text-[#A32617] hover:bg-[#FDEDED] rounded-xl transition-colors cursor-pointer"
                  title="Excluir procedimento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Procedure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
              <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
                {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
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
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maquiagem Social para Festa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="120.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Duração Necessária *
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                >
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora (60 min)</option>
                  <option value="90">1h30 (90 min)</option>
                  <option value="120">2 horas (120 min)</option>
                  <option value="150">2h30 (150 min)</option>
                  <option value="180">3 horas (180 min)</option>
                  <option value="240">4 horas (240 min)</option>
                </select>
                <p className="text-[11px] text-[#7D756D] mt-1">
                  O sistema bloqueará exatamente este intervalo na sua agenda ao receber o agendamento.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Foto de Capa (URL da Imagem)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Descrição do Serviço
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva detalhes, benefícios e o que está incluso no procedimento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="proc-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-[#8E5D52] rounded border-[#EAE4DD] focus:ring-[#8E5D52] cursor-pointer"
                />
                <label htmlFor="proc-active" className="text-xs font-bold text-[#2D2926] cursor-pointer">
                  Disponível para agendamento online no site
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#8E5D52] hover:bg-[#784D43] active:scale-98 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {editingProcedure ? 'Salvar Alterações' : 'Cadastrar Procedimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
