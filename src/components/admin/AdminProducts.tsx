import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';
import { fileToDataUrl, extractAverageColor } from '../../utils/imageUpload';
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
  Camera,
  Upload,
  Palette,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct, currentStoreId } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [onlyNovidades, setOnlyNovidades] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [activeVariantColorUploadIndex, setActiveVariantColorUploadIndex] = useState<number | null>(null);

  const productPhotosInputRef = useRef<HTMLInputElement>(null);
  const variantColorPhotoInputRef = useRef<HTMLInputElement>(null);

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

  // Upload one or multiple photos directly from mobile/PC gallery for the product
  const handleProductPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    try {
      setIsUploadingImages(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await fileToDataUrl(file, 1000, 1000, 0.85);
        newUrls.push(dataUrl);
      }

      const existingImages = editingProduct.images || [];
      setEditingProduct({
        ...editingProduct,
        images: [...existingImages, ...newUrls],
      });
    } catch (err) {
      alert('Erro ao carregar fotos da galeria. Tente fotos menores.');
    } finally {
      setIsUploadingImages(false);
      if (productPhotosInputRef.current) productPhotosInputRef.current.value = '';
    }
  };

  const handleRemoveProductImage = (idxToRemove: number) => {
    if (!editingProduct) return;
    const current = editingProduct.images || [];
    setEditingProduct({
      ...editingProduct,
      images: current.filter((_, i) => i !== idxToRemove),
    });
  };

  // Upload color/fabric swatch photo from gallery for a specific variant
  const handleVariantColorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct || activeVariantColorUploadIndex === null) return;

    try {
      const dataUrl = await fileToDataUrl(file, 300, 300, 0.9);
      const avgHex = await extractAverageColor(dataUrl);

      const updated = [...(editingProduct.variants || [])];
      if (updated[activeVariantColorUploadIndex]) {
        updated[activeVariantColorUploadIndex].colorImage = dataUrl;
        // Also auto-update hex color from the fabric photo!
        updated[activeVariantColorUploadIndex].colorHex = avgHex;
      }

      setEditingProduct({
        ...editingProduct,
        variants: updated,
      });
    } catch (err) {
      alert('Não foi possível processar a foto da cor. Tente outra imagem.');
    } finally {
      setActiveVariantColorUploadIndex(null);
      if (variantColorPhotoInputRef.current) variantColorPhotoInputRef.current.value = '';
    }
  };

  const handleRemoveVariantColorPhoto = (idx: number) => {
    if (!editingProduct) return;
    const updated = [...(editingProduct.variants || [])];
    if (updated[idx]) {
      updated[idx].colorImage = undefined;
    }
    setEditingProduct({ ...editingProduct, variants: updated });
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

              {/* FOTOS DO PRODUTO (Galeria do Celular / PC + URLs) */}
              <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-sm text-[#2D2926] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#9B4B5A]" />
                      <span>Fotos do Produto (Galeria da Boutique)</span>
                    </label>
                    <p className="text-[11px] text-[#7D756D]">
                      A lojista pode selecionar fotos diretamente da galeria do celular ou do computador
                    </p>
                  </div>

                  {/* Hidden file input for product images */}
                  <input
                    ref={productPhotosInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleProductPhotosUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isUploadingImages}
                    onClick={() => productPhotosInputRef.current?.click()}
                    className="px-4 py-2 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isUploadingImages ? 'Processando Fotos...' : 'Pegar Fotos na Galeria'}</span>
                  </button>
                </div>

                {/* Gallery Previews Grid */}
                {(editingProduct.images || []).length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                    {(editingProduct.images || []).map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className="relative aspect-3/4 rounded-xl overflow-hidden border-2 border-[#E8DFD5] bg-[#FAF8F5] group shadow-xs"
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto ${imgIdx + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        {imgIdx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#9B4B5A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                            Principal
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(imgIdx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => productPhotosInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-[#E8DFD5] hover:border-[#9B4B5A] rounded-xl text-center bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <Camera className="w-8 h-8 text-[#9B4B5A]/50 mx-auto mb-1" />
                    <p className="text-xs font-bold text-[#4A423D]">
                      Nenhuma foto adicionada ainda
                    </p>
                    <p className="text-[11px] text-[#7D756D]">
                      Clique aqui para abrir a galeria e escolher as fotos desta peça
                    </p>
                  </div>
                )}

                {/* Secondary / Optional direct URL input */}
                <div className="pt-2 border-t border-[#F0EAE1]">
                  <details className="text-[11px] text-[#7D756D] cursor-pointer">
                    <summary className="font-semibold text-[#9B4B5A] hover:underline">
                      + Adicionar ou colar links de imagens web (opcional)
                    </summary>
                    <div className="mt-2 space-y-1">
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
                      <p className="text-[10px] text-[#8A7E76]">
                        Separe múltiplos links por vírgula se preferir colar URLs de fotos.
                      </p>
                    </div>
                  </details>
                </div>
              </div>

              {/* VARIANT & STOCK MATRIX (Tamanho x Cor x Foto/Hex x Estoque) */}
              <div className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5]">
                {/* Hidden input for variant swatch color photos */}
                <input
                  ref={variantColorPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVariantColorPhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#2D2926] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#9B4B5A]" />
                      <span>Grade de Variações & Cores</span>
                    </h4>
                    <p className="text-[11px] text-[#7D756D]">
                      A lojista pode definir Tamanho, Nome da Cor e <strong>tirar/escolher foto da cor na galeria</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddStandardGrid}
                      className="px-2.5 py-1 bg-[#FAF3F5] text-[#9B4B5A] border border-[#F0D5DC] rounded-lg text-[11px] font-bold hover:bg-[#9B4B5A] hover:text-white transition-colors cursor-pointer"
                    >
                      + Grade Padrão (P, M, G, GG)
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
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {(editingProduct.variants || []).map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE4DD] flex flex-col sm:flex-row sm:items-center gap-2.5"
                    >
                      {/* Size */}
                      <div className="w-full sm:w-20">
                        <label className="text-[10px] text-[#8A7E76] font-bold block mb-0.5">Tamanho</label>
                        <input
                          type="text"
                          value={v.size}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].size = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          placeholder="P / 42"
                          className="w-full bg-white border border-[#E8DFD5] rounded-xl px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>

                      {/* Color Name */}
                      <div className="flex-1">
                        <label className="text-[10px] text-[#8A7E76] font-bold block mb-0.5">Nome da Cor</label>
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].color = e.target.value;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          placeholder="Ex: Romance Rose, Vinho Bordô"
                          className="w-full bg-white border border-[#E8DFD5] rounded-xl px-2.5 py-1.5 text-xs"
                        />
                      </div>

                      {/* Color Swatch / Photo from Gallery (Requested by user) */}
                      <div className="w-full sm:w-56">
                        <label className="text-[10px] text-[#8A7E76] font-bold block mb-0.5">
                          Amostra da Cor (Foto na Galeria ou Cor Hex)
                        </label>
                        <div className="flex items-center gap-2">
                          {/* Visual Thumbnail of Swatch */}
                          {v.colorImage ? (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-[#D8A47F] shrink-0 group">
                              <img
                                src={v.colorImage}
                                alt={v.color}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantColorPhoto(idx)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                title="Remover foto da cor"
                              >
                                <X className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className="w-8 h-8 rounded-lg border border-black/20 shrink-0 shadow-2xs"
                              style={{ backgroundColor: v.colorHex || '#1A1A1A' }}
                            />
                          )}

                          {/* Button to pick color photo from gallery */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVariantColorUploadIndex(idx);
                              variantColorPhotoInputRef.current?.click();
                            }}
                            className="px-2 py-1.5 bg-white border border-[#E8DFD5] hover:border-[#9B4B5A] text-[#4A423D] rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                            title="Tirar foto ou pegar foto da cor na galeria"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#9B4B5A]" />
                            <span>{v.colorImage ? 'Trocar Foto' : 'Foto na Galeria'}</span>
                          </button>

                          {/* Native Hex color input as fallback or fine-tune */}
                          <input
                            type="color"
                            value={v.colorHex || '#1A1A1A'}
                            onChange={(e) => {
                              const updated = [...(editingProduct.variants || [])];
                              updated[idx].colorHex = e.target.value;
                              setEditingProduct({ ...editingProduct, variants: updated });
                            }}
                            title="Ajustar código Hex da cor"
                            className="w-7 h-7 bg-white rounded-lg cursor-pointer border border-[#E8DFD5] p-0.5 shrink-0"
                          />
                        </div>
                      </div>

                      {/* Stock Quantity */}
                      <div className="w-full sm:w-24">
                        <label className="text-[10px] text-[#8A7E76] font-bold block mb-0.5 text-center">Estoque</label>
                        <input
                          type="number"
                          min="0"
                          value={v.stockQuantity}
                          onChange={(e) => {
                            const updated = [...(editingProduct.variants || [])];
                            updated[idx].stockQuantity = parseInt(e.target.value) || 0;
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="w-full bg-white border border-[#E8DFD5] rounded-xl px-2 py-1.5 text-xs font-bold text-center"
                        />
                      </div>

                      {/* Remove Variant Button */}
                      <div className="flex sm:justify-center pt-2 sm:pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editingProduct.variants || []).filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, variants: updated });
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remover esta variação"
                        >
                          <Trash2 className="w-4 h-4" />
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
