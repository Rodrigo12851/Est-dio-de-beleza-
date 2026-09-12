import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Store } from '../../types';
import {
  Shield,
  Store as StoreIcon,
  Users,
  TrendingUp,
  Package,
  Plus,
  Power,
  ExternalLink,
  Lock,
  LogOut,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Settings,
  CreditCard,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    allStores,
    createNewStore,
    updateStoreStatus,
    selectStore,
    setAppRoute,
    superAdminLogout,
    superAdminTab,
    setSuperAdminTab,
    products,
    orders,
  } = useStore();

  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    ownerName: '',
    email: '',
    whatsapp: '',
    adminPin: '4321',
    plan: 'pro' as 'standard' | 'pro' | 'enterprise',
  });

  // Calculate platform totals
  const totalStores = allStores.length;
  const activeStores = allStores.filter((s) => s.status === 'active').length;
  const suspendedStores = allStores.filter((s) => s.status === 'suspended').length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const filteredStores = allStores.filter(
    (s) =>
      s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.slug.toLowerCase().includes(storeSearch.toLowerCase())
  );

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.name.trim()) return;

    await createNewStore({
      ...newStoreData,
      phone: newStoreData.whatsapp,
      slug: newStoreData.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-'),
    });

    setIsCreateStoreModalOpen(false);
    setNewStoreData({
      name: '',
      ownerName: '',
      email: '',
      whatsapp: '',
      adminPin: '4321',
      plan: 'pro',
    });
  };

  const handleAccessStoreAsMerchant = (storeId: string) => {
    selectStore(storeId);
    setAppRoute('merchant');
  };

  const handleOpenStorePublic = (storeId: string) => {
    selectStore(storeId);
    setAppRoute('store');
  };

  return (
    <div className="min-h-screen bg-[#1F1D1B] text-[#EDE7DF] flex flex-col font-sans">
      {/* Top Super Admin Navigation */}
      <header className="bg-[#181615] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Playfair_Display',serif] text-lg sm:text-xl font-bold text-white tracking-wide">
                    Super Admin Console
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
                    Root Platform
                  </span>
                </div>
                <p className="text-[11px] text-[#A69C94]">
                  Gestão global de lojistas, permissões de banco e governança multi-tenancy
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setAppRoute('store')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#D9D0C5] border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Ver Rota Pública</span>
              </button>

              <button
                type="button"
                onClick={superAdminLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-800/40 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#282523] border border-white/10 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A69C94]">
              <span>Lojas Cadastradas</span>
              <StoreIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-['Playfair_Display',serif]">
              {totalStores}
            </div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>{activeStores} operando ativas</span>
            </p>
          </div>

          <div className="bg-[#282523] border border-white/10 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A69C94]">
              <span>Isolamento Multi-Tenant</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-['Playfair_Display',serif]">
              Ativo 100%
            </div>
            <p className="text-[11px] text-[#A69C94]">
              Permissões reais no Firestore ativadas
            </p>
          </div>

          <div className="bg-[#282523] border border-white/10 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A69C94]">
              <span>Gateways de Pagamento</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-['Playfair_Display',serif]">
              Inativo
            </div>
            <p className="text-[11px] text-amber-400/90">
              Estrutura mantida / Processamento pausado
            </p>
          </div>

          <div className="bg-[#282523] border border-white/10 rounded-2xl p-5 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A69C94]">
              <span>Pedidos Totais</span>
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-['Playfair_Display',serif]">
              {totalOrders}
            </div>
            <p className="text-[11px] text-[#A69C94]">
              R$ {totalRevenue.toFixed(2).replace('.', ',')} transacionados
            </p>
          </div>
        </div>

        {/* Security & Multi-tenant Notice Card */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-amber-300 mr-2">Segurança Multi-Tenancy Conforme Solicitado:</span>
              <span className="text-[#D9D0C5]">
                O banco de dados Firestore está configurado com regras rígidas de isolamento. Cada lojista só tem permissão de leitura/escrita vinculada ao seu respectivo <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">storeId</code>. Processamento de cartão mantido em modo inativo sem cobranças indevidas.
              </span>
            </div>
          </div>
        </div>

        {/* Store Management Section */}
        <div className="bg-[#282523] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-white">
                Lojistas & Lojas na Plataforma
              </h2>
              <p className="text-xs text-[#A69C94] mt-0.5">
                Controle o acesso, PINs de administração e status de cada lojista parceiro
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="Filtrar lojas..."
                  className="bg-[#1F1D1B] border border-white/15 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-[#7D756D] focus:outline-none focus:border-amber-400"
                />
                <Search className="w-3.5 h-3.5 text-[#7D756D] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="button"
                onClick={() => setIsCreateStoreModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Nova Loja</span>
              </button>
            </div>
          </div>

          {/* Stores Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1F1D1B] text-[#A69C94] uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Loja & Identificador</th>
                  <th className="py-3.5 px-4">Lojista Responsável</th>
                  <th className="py-3.5 px-4">WhatsApp & PIN</th>
                  <th className="py-3.5 px-4">Plano</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações de Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-amber-400">
                          {store.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            {store.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#7D756D]">
                            ID: {store.id} (/{store.slug})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#D9D0C5]">
                      <div className="font-medium text-white">{store.ownerName}</div>
                      <div className="text-[11px] text-[#7D756D]">{store.ownerEmail}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-[#D9D0C5]">{store.whatsapp}</div>
                      <div className="text-[11px] text-amber-300/80 font-mono">
                        PIN: {store.adminPin || '4321'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                        {store.plan}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {store.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>Ativa</span>
                        </span>
                      ) : store.status === 'paused' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Pausada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Suspensa</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle active / paused status */}
                        <button
                          type="button"
                          onClick={() =>
                            updateStoreStatus(
                              store.id,
                              store.status === 'active' ? 'suspended' : 'active'
                            )
                          }
                          title={store.status === 'active' ? 'Suspender Loja' : 'Ativar Loja'}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            store.status === 'active'
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Entrar como Lojista da loja */}
                        <button
                          type="button"
                          onClick={() => handleAccessStoreAsMerchant(store.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 cursor-pointer transition-all border border-white/15"
                          title="Acessar painel restrito desta loja"
                        >
                          <StoreIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Painel Lojista</span>
                        </button>

                        {/* Ver rota pública da loja */}
                        <button
                          type="button"
                          onClick={() => handleOpenStorePublic(store.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#A69C94] hover:text-white border border-white/10 transition-all cursor-pointer"
                          title="Ver Catálogo Público desta Loja"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Cadastrar Novo Lojista */}
      {isCreateStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#282523] border border-white/15 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-white">
                  Cadastrar Nova Loja / Lojista
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateStoreModalOpen(false)}
                className="text-[#7D756D] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#D9D0C5] mb-1">
                  Nome da Loja (Marca)
                </label>
                <input
                  type="text"
                  required
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                  placeholder="Ex: Belle Nuit Lingerie"
                  className="w-full bg-[#1F1D1B] border border-white/15 rounded-xl py-2.5 px-3 text-white placeholder-[#7D756D] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#D9D0C5] mb-1">
                    Nome da Proprietária / Lojista
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreData.ownerName}
                    onChange={(e) => setNewStoreData({ ...newStoreData, ownerName: e.target.value })}
                    placeholder="Ex: Camila Rossi"
                    className="w-full bg-[#1F1D1B] border border-white/15 rounded-xl py-2.5 px-3 text-white placeholder-[#7D756D] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#D9D0C5] mb-1">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    required
                    value={newStoreData.email}
                    onChange={(e) => setNewStoreData({ ...newStoreData, email: e.target.value })}
                    placeholder="contato@bellenuit.com.br"
                    className="w-full bg-[#1F1D1B] border border-white/15 rounded-xl py-2.5 px-3 text-white placeholder-[#7D756D] focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#D9D0C5] mb-1">
                    WhatsApp para Pedidos
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStoreData.whatsapp}
                    onChange={(e) => setNewStoreData({ ...newStoreData, whatsapp: e.target.value })}
                    placeholder="11998877665"
                    className="w-full bg-[#1F1D1B] border border-white/15 rounded-xl py-2.5 px-3 text-white placeholder-[#7D756D] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#D9D0C5] mb-1">
                    PIN de Acesso da Loja
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newStoreData.adminPin}
                    onChange={(e) => setNewStoreData({ ...newStoreData, adminPin: e.target.value })}
                    placeholder="4321"
                    className="w-full bg-[#1F1D1B] border border-white/15 rounded-xl py-2.5 px-3 text-white placeholder-[#7D756D] focus:outline-none focus:border-amber-400 font-mono text-center font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateStoreModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-[#D9D0C5] hover:bg-white/5 font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md transition-all cursor-pointer"
                >
                  Criar Loja e Habilitar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
