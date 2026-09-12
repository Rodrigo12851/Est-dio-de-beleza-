import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Package,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct, currentStoreId } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [onlyNovidades, setOnlyNovidades] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const filteredProducts = products.filter((p) => {
    if (onlyNovidades && !p.isNewArrival) return false;
    if (selectedCategory !== 'todos' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      storeId: currentStoreId,
      categoryId: categories[0]?.id || 'cat-conjuntos',
      name: '',
      description: '',
      price: 129.9,
      promoPrice: undefined,
      images: [
        'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
      ],
      isActive: true,
      featured: false,
      isNewArrival: true,
      newArrivalDays: 15,
      newArrivalBadge: 'Novidade no Estoque',
      createdAt: new Date().toISOString(),
      variants: [
        { id: `var-${Date.now()}-1`, productId: '', size: 'P', color: 'Preto Clássico', colorHex: '#1A1A1A', stockQuantity: 5 },
        { id: `var-${Date.now()}-2`, productId: '', size: 'M', color: 'Preto Clássico', colorHex: '#1A1A1A', stockQuantity: 5 },
        { id: `var-${Date.now()}-3`, productId: '', size: 'G', color: 'Preto Clássico', colorHex: '#1A1A1A', stockQuantity: 3 },
      ],
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(p))); // deep clone
    setIsEditing(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) {
      alert('Preencha o nome do produto.');
      return;
    }

    const isNovidade = Boolean(editingProduct.isNewArrival);
    const days = editingProduct.newArrivalDays ? Number(editingProduct.newArrivalDays) : 15;
    const untilDate = isNovidade
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const cleaned: Product = {
      id: editingProduct.id || `prod-${Date.now()}`,
      storeId: editingProduct.storeId || currentStoreId,
      categoryId: editingProduct.categoryId || categories[0]?.id || 'cat-conjuntos',
      name: editingProduct.name.trim(),
      description: editingProduct.description || '',
      price: Number(editingProduct.price) || 0,
      promoPrice: editingProduct.promoPrice ? Number(editingProduct.promoPrice) : undefined,
      images: (editingProduct.images && editingProduct.images.length > 0)
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800'],
      isActive: editingProduct.isActive !== false,
      featured: Boolean(editingProduct.featured),
      isNewArrival: isNovidade,
      newArrivalDays: isNovidade ? days : undefined,
      newArrivalUntil: untilDate,
      newArrivalBadge: editingProduct.newArrivalBadge?.trim() || 'Novidade no Estoque',
      createdAt: editingProduct.createdAt || new Date().toISOString(),
      variants: (editingProduct.variants || []).map((v) => ({
        ...v,
        productId: editingProduct.id || '',
        stockQuantity: Number(v.stockQuantity) || 0,
      })),
    };

    await saveProduct(cleaned);
    setIsEditing(false);
    setEditingProduct(null);
  };

  // Helper to add standard variant grid
  const handleAddStandardGrid = () => {
    if (!editingProduct) return;
    const standardSizes = ['P', 'M', 'G', 'GG'];
    const standardColors = [
      { name: 'Preto Clássico', hex: '#1A1A1A' },
      { name: 'Romance Rose', hex: '#D9828B' },
      { name: 'Branco Noiva', hex: '#FDFDFD' },
    ];

    const newVariants: ProductVariant[] = [];
    standardColors.forEach((c) => {
      standardSizes.forEach((s) => {
        newVariants.push({
          id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: editingProduct.id || '',
          size: s,
          color: c.name,
          colorHex: c.hex,
          stockQuantity: 4,
          sku: `${s}-${c.name.slice(0, 3).toUpperCase()}`,
        });
      });
    });

    setEditingProduct({
      ...editingProduct,
      variants: newVariants,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926]">
              Catálogo de Produtos & Variações
            </h2>
            <p className="text-xs text-[#7D756D]">
              Cadastre e gerencie os modelos, preços e estoques por Tamanho x Cor
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#F5F0EA]">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome da peça..."
              className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-full py-2 pl-9 pr-4 text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#9B4B5A]/30"
            />
            <Search className="w-3.5 h-3.5 text-[#8A7E76] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="button"
            onClick={() => setOnlyNovidades(!onlyNovidades)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              onlyNovidades
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-[#FAF8F5] border border-[#E8DFD5] text-[#4A423D] hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ver Apenas Novidades</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-56 bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs text-[#2D2926] focus:outline-none"
          >
            <option value="todos">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table/List */}
      <div className="bg-white rounded-3xl border border-[#EFE9E2] shadow-2xs overflow-hidden divide-y divide-[#F5F0EA]">
        {filteredProducts.map((p) => {
          const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
          const categoryName = categories.find((c) => c.id === p.categoryId)?.name || 'Geral';

          return (
            <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.images[0] || ''}
                  alt=""
                  className="w-14 h-18 object-cover rounded-xl border border-[#EAE4DD] shrink-0"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3F5] text-[#9B4B5A] uppercase">
                      {categoryName}
                    </span>
                    {p.isNewArrival && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{p.newArrivalBadge || 'Novidade no Estoque'}</span>
                        {p.newArrivalDays && (
                          <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-mono">
                            {p.newArrivalDays}d
                          </span>
                        )}
                      </span>
                    )}
                    {p.featured && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Destaque
                      </span>
                    )}
                    {!p.isActive && (
                      <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        Inativo no site
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-[#2D2926] truncate">{p.name}</h3>

                  <p className="text-xs text-[#7D756D]">
                    {p.variants.length} variações cadastradas •{' '}
                    <strong className={totalStock <= 3 ? 'text-rose-600' : 'text-emerald-700'}>
                      {totalStock} em estoque
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F0EA]">
                <div className="text-left sm:text-right">
                  <span className="text-sm sm:text-base font-bold text-[#9B4B5A]">
                    R$ {p.price.toFixed(2).replace('.', ',')}
                  </span>
                  {p.promoPrice && (
                    <span className="block text-[10px] text-emerald-700">
                      Promo: R$ {p.promoPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-xl bg-[#FAF8F5] text-[#4A423D] hover:bg-[#EAE4DD] transition-colors cursor-pointer border border-[#EAE4DD]"
                    title="Editar produto e variações"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Deseja realmente remover o produto "${p.name}"?`)) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Edit / Create Modal */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#FDFBF9] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#F0EAE1] flex items-center justify-between">
              <div>
                <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#2D2926]">
                  {editingProduct.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <p className="text-xs text-[#7D756D]">
                  Configure preços, detalhes e matriz de tamanhos e cores
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-[#8A7E76] hover:text-[#2D2926]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-xs flex-1">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#2D2926] mb-1">Nome do Modelo *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex: Conjunto Rendez-Vous em Renda Chantilly"
                    className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs text-[#2D2926]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2926] mb-1">Categoria *</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs text-[#2D2926]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isActive !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#9B4B5A] rounded-sm"
                    />
                    <span className="font-semibold text-[#2D2926]">Visível na Loja</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.featured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="w-4 h-4 text-[#9B4B5A] rounded-sm"
                    />
                    <span className="font-semibold text-[#2D2926]">Destaque na Home</span>
                  </label>
                </div>

                {/* Bloco de Novidades no Estoque */}
                <div className="sm:col-span-2 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.isNewArrival)}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isNewArrival: e.target.checked,
                            newArrivalDays: editingProduct.newArrivalDays || 15,
                            newArrivalBadge: editingProduct.newArrivalBadge || 'Novidade no Estoque',
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded-sm"
                      />
                      <div>
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Colocar como Novidade (Acabou de ser colocado em estoque)
                        </span>
                        <p className="text-[11px] text-emerald-800">
                          Exibe no carrossel de Novidades da loja com contagem de dias ativos
                        </p>
                      </div>
                    </label>
                  </div>

                  {editingProduct.isNewArrival && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 animate-fadeIn">
                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">
                          Dias que deve manter nas Novidades:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={editingProduct.newArrivalDays ?? 15}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                newArrivalDays: parseInt(e.target.value) || 15,
                              })
                            }
                            className="w-28 bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-emerald-950 font-bold"
                          />
                          <span className="text-xs text-emerald-800">dias corridos</span>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-emerald-900 mb-1">
                          Texto do Selo da Peça:
                        </label>
                        <input
                          type="text"
                          value={editingProduct.newArrivalBadge ?? 'Novidade no Estoque'}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              newArrivalBadge: e.target.value,
                            })
                          }
                          placeholder="Ex: Acabou de Chegar, Lançamento, Novidade"
                          className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-emerald-950"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-[#2D2926] mb-1">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    placeholder="189.90"
                    className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs text-[#2D2926]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2926] mb-1">Preço Promocional (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.promoPrice ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        promoPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="159.90"
                    className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs text-[#2D2926]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#2D2926] mb-1">Descrição & Detalhes da Peça</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Fale sobre tecidos, rendas, aro, sustentação e fechos..."
                    className="w-full bg-white border border-[#E8DFD5] rounded-xl p-2.5 text-xs text-[#2D2926]"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E8DFD5]">
                <label className="block font-bold text-[#2D2926]">
                  URL da Foto Principal (ou fotos separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={(editingProduct.images || []).join(', ')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: e.target.value.split(',').map((url) => url.trim()).filter(Boolean),
                    })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs text-[#2D2926]"
                />
                <p className="text-[11px] text-[#8A7E76]">
                  Dica: cole um ou mais links de imagens web para compor a galeria da peça.
                </p>
              </div>

              {/* VARIANT & STOCK MATRIX (Tamanho x Cor x Estoque) */}
              <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D2926] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#9B4B5A]" />
                      <span>Grade de Variações & Estoque</span>
                    </h4>
                    <p className="text-[11px] text-[#7D756D]">
                      Defina a quantidade de cada combinação de tamanho e cor disponível na boutique
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddStandardGrid}
                      className="px-2.5 py-1 bg-[#FAF3F5] text-[#9B4B5A] border border-[#F0D5DC] rounded-lg text-[11px] font-bold hover:bg-[#9B4B5A] hover:text-white transition-colors cursor-pointer"
                    >
                      + Gerar Grade Padrão (P, M, G, GG)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newVar: ProductVariant = {
                          id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          productId: editingProduct.id || '',
                          size: 'M',
                          color: 'Preto Clássico',
                          colorHex: '#1A1A1A',
                          stockQuantity: 5,
                        };
                        setEditingProduct({
                          ...editingProduct,
                          variants: [...(editingProduct.variants || []), newVar],
                        });
                      }}
                      className="px-2.5 py-1 bg-[#2D2926] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      + Nova Linha
                    </button>
                  </div>
                </div>

                {/* Variants List Table */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {(editingProduct.variants || []).map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="grid grid-cols-12 gap-2 p-2 bg-[#FAF8F5] rounded-xl items-center border border-[#EAE4DD]"
                    >
                      {/* Size */}
                      <div className="col-span-3">
                        <label className="text-[10px] text-[#8A7E76] block">Tamanho</label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].size = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          placeholder="P / 42"
                          className="w-full bg-white border border-[#E8DFD5] rounded-lg px-2 py-1 text-xs font-bold"
                        />
                      </div>

                      {/* Color Name */}
                      <div className="col-span-4">
                        <label className="text-[10px] text-[#8A7E76] block">Cor</label>
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].color = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          placeholder="Preto / Rose"
                          className="w-full bg-white border border-[#E8DFD5] rounded-lg px-2 py-1 text-xs"
                        />
                      </div>

                      {/* Color Hex */}
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#8A7E76] block">Cor Hex</label>
                        <input
                          type="color"
                          value={v.colorHex || '#1A1A1A'}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].colorHex = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="w-full h-7 bg-white rounded cursor-pointer border border-[#E8DFD5]"
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div className="col-span-2">
                        <label className="text-[10px] text-[#8A7E76] block">Estoque</label>
                        <input
                          type="number"
                          min="0"
                          value={v.stockQuantity}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].stockQuantity = parseInt(e.target.value) || 0;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="w-full bg-white border border-[#E8DFD5] rounded-lg px-2 py-1 text-xs font-bold text-center"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingProduct.variants || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Remover variação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8DFD5] text-[#4A423D] hover:bg-[#F5F0EA] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Salvar Produto & Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
