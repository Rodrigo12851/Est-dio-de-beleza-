import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, products, saveCategory, deleteCategory, currentStoreId } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      storeId: currentStoreId,
      name: '',
      slug: '',
      imageUrl: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=600',
      order: categories.length + 1,
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory({ ...c });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    const slug = editingCategory.slug?.trim() || editingCategory.name.toLowerCase().replace(/\s+/g, '-');

    const catToSave: Category = {
      id: editingCategory.id || `cat-${Date.now()}`,
      storeId: editingCategory.storeId || currentStoreId,
      name: editingCategory.name.trim(),
      slug,
      imageUrl: editingCategory.imageUrl || '',
      order: Number(editingCategory.order) || 1,
      isActive: editingCategory.isActive !== false,
    };

    await saveCategory(catToSave);
    setIsEditing(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFE9E2] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926]">
            Categorias da Loja
          </h2>
          <p className="text-xs text-[#7D756D]">
            Organize suas coleções (Conjuntos, Bodys, Sutiãs, Noivas, Sleepwear)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-[#EFE9E2] shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={cat.imageUrl || ''}
                  alt=""
                  className="w-12 h-12 object-cover rounded-xl border border-[#EAE4DD] shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[#2D2926] truncate">{cat.name}</h4>
                  <p className="text-[11px] text-[#7D756D]">
                    Slug: <code className="font-mono text-[10px]">{cat.slug}</code> • {count} peças
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg text-[#7D756D] hover:bg-[#F5F0EA] cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deseja remover a categoria "${cat.name}"?`)) {
                      deleteCategory(cat.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isEditing && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#FDFBF9] w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E8DFD5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
              <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#2D2926]">
                {editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 text-[#8A7E76]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2D2926] mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  placeholder="Ex: Bodys & Corselets"
                  className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2926] mb-1">Slug (Identificador URL)</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="bodys-corselets"
                  className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2926] mb-1">URL da Imagem de Capa</label>
                <input
                  type="text"
                  value={editingCategory.imageUrl || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9B4B5A] text-white rounded-xl font-bold"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
