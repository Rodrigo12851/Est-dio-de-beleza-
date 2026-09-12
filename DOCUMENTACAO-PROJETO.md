# 📚 Documentação Oficial do Projeto - Intima Lab

> **Aviso Obrigatório para a IA**:  
> Este arquivo é a fonte oficial da verdade sobre a arquitetura, regras de negócio e estado real do projeto.  
> **Você DEVE ler este arquivo antes de realizar qualquer alteração** solicitada pelo usuário e **DEVE atualizá-lo ao final de cada alteração** antes de encerrar o turno.

---

## 1. Visão Geral do Produto
O **Intima Lab** é uma plataforma e ecossistema multi-lojas voltado para o comércio de moda íntima e lingerie fina.  
Ele atende três públicos com isolamento completo de acessos:
1. **Cliente Final (Consumidora)**: Navega pelo catálogo, filtra por novidades/tamanhos/cores, adiciona itens à sacola e finaliza o pedido diretamente no WhatsApp da loja.
2. **Lojista (Boutique de Lingerie)**: Acessa o seu painel privativo para cadastrar produtos, fotos da galeria, estoque por variações, trocar senha com confirmação, verificar pedidos e gerenciar configurações.
3. **Dono do Aplicativo (Super Admin / Master)**: Tem o controle central da plataforma, gerencia todas as lojas, cadastra novos lojistas, altera senhas, desbloqueia contas bloqueadas por tentativas incorretas e gerencia o suporte WhatsApp oficial.

---

## 2. Arquitetura de Links e Acessos Exclusivos (3 Camadas)

O sistema opera com **isolamento estrito de rotas** por parâmetros de URL:

| Papel | Rota / Link de Acesso | O que vê / Permissões |
|---|---|---|
| **Cliente** | `/?store=nome-da-loja` ou `/` (raiz) | **Catálogo 100% limpo.** Não há botões, cadeados, seletores de loja ou links visíveis para áreas administrativas. Apenas produtos, sacola e contato da loja. |
| **Lojista** | `/?admin=nome-da-loja` | **Painel Administrativo da Loja.** Acesso protegido por senha/PIN exclusivo da loja. Gerencia estoque, variações, cores, fotos e pedidos da sua própria boutique. |
| **Dono do App** | `/?superadmin=intimalab` | **Painel Master / Super Admin.** Acesso protegido por chave mestra. Pode visualizar todas as lojas, redefinir senhas, desbloquear lojistas e criar novas lojas. |

---

## 3. Segurança e Política de Senhas

- **Visualização de Senha**: Campos de senha contam com botão de olho (Eye / EyeOff) para alternar visibilidade durante a digitação.
- **Validação de Troca de Senha**: Exige validação da senha atual antes de permitir a alteração e exige confirmação idêntica da nova senha.
- **Proteção contra Força Bruta**: Após 4 tentativas consecutivas incorretas, a conta da loja é **bloqueada automaticamente**.
- **Desbloqueio Oficial**: Quando bloqueada, é exibido aviso de bloqueio e um botão de ação rápida para entrar em contato via WhatsApp com o Dono do App (Super Admin) para solicitação de desbloqueio.
- **Governança do Dono do App**: O Super Admin consegue desbloquear contas e redefinir as senhas de qualquer loja em tempo real.

---

## 4. Estrutura do Código-Fonte

- `src/`
  - `App.tsx`: Gerencia as 3 rotas centrais (`store`, `merchant`, `superadmin`) de acordo com os parâmetros da URL.
  - `types.ts`: Interfaces de dados TypeScript (`Product`, `ProductVariant`, `StoreConfig`, `Store`, `Order`, `AppRoute`, etc.).
  - `context/StoreContext.tsx`: Provedor de estado global (carrinho, loja ativa, permissões, autenticação, modo de cores).
  - `components/store/`:
    - `StoreNavbar.tsx`: Barra de navegação pública (exclusiva para clientes, sem links administrativos).
    - `StoreView.tsx`: Exibição do catálogo de produtos, banner e novidades.
    - `ProductDetailModal.tsx`: Detalhes da peça com seleção de tamanho, cor e fotos.
    - `CartDrawer.tsx`: Sacola de compras com cálculo de frete/retirada e botão de pedido para WhatsApp.
    - `MobileNavDrawer.tsx`: Menu lateral responsivo para celular (sem links administrativos).
  - `components/admin/`:
    - `AdminLayout.tsx`: Interface completa do lojista (produtos, pedidos, configurações, alteração de senha).
  - `components/superadmin/`:
    - `SuperAdminDashboard.tsx`: Interface master do dono do aplicativo (todas as lojas, senhas, desbloqueios).
  - `services/firestoreService.ts`: Integração e sincronização em tempo real com o banco de dados Firebase Firestore.
  - `utils/storeRouting.ts`: Utilitários para parsing de rotas na URL (`?store=`, `?admin=`, `?superadmin=`).

---

## 5. Histórico de Alterações Recentes

### [12/09/2026] - Rebranding para Intima Lab e Ocultação de Acessos no Catálogo
- **Rebranding completo**: Atualizados `package.json`, `public/manifest.json`, `index.html`, `metadata.json`, `README.md` e `sw.js` para o nome oficial **Intima Lab**.
- **Segurança da interface do cliente**: Removidos todos os elementos que davam acesso à Área do Lojista ou Super Admin da visão pública (seletor de lojas na barra superior, botões de cadeado na navbar e atalhos na gaveta mobile).
- **Criação da documentação viva**: Criados `DOCUMENTACAO-PROJETO.md` e `AGENTS.md` para garantir que toda alteração futura parta do estado real e atualizado da aplicação.
