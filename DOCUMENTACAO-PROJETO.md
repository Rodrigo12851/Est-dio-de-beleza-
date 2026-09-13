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

---

## 4. Estrutura do Código-Fonte

- `src/`
  - `App.tsx`: Gerencia as 3 rotas centrais (`store`, `merchant`, `superadmin`) de acordo com os parâmetros da URL, com formulários de login direto e isolamento estrito por papel.
  - `types.ts`: Interfaces de dados TypeScript (`Product`, `ProductVariant`, `StoreConfig`, `Store`, `Order`, `AppRoute`, etc.).
  - `context/StoreContext.tsx`: Provedor de estado global (carrinho, loja ativa, permissões, autenticação, modo de cores).
  - `components/store/`:
    - `StoreNavbar.tsx`: Barra de navegação pública (exclusiva para clientes, sem links administrativos).
    - `StoreView.tsx`: Exibição do catálogo de produtos, banner e novidades.
    - `ProductDetailModal.tsx`: Detalhes da peça com seleção de tamanho, cor e fotos.
    - `CartDrawer.tsx`: Sacola de compras com cálculo de frete/retirada e botão de pedido para WhatsApp.
    - `MobileNavDrawer.tsx`: Menu lateral responsivo para celular (sem links administrativos).
    - `AdminLoginModal.tsx`: Modal auxiliar de login com bloqueio de alternância de abas e sem dropdown de lojas.
    - `PwaInstallBanner.tsx`: Banner de instalação PWA dinâmico com o nome da loja ativa.
  - `components/admin/`:
    - `AdminLayout.tsx`: Interface completa do lojista (produtos, pedidos, configurações, alteração de senha).
  - `components/superadmin/`:
    - `SuperAdminDashboard.tsx`: Interface master do dono do aplicativo (todas as lojas, senhas, desbloqueios).
  - `services/firestoreService.ts`: Integração e sincronização em tempo real com o banco de dados Firebase Firestore.
  - `utils/storeRouting.ts`: Utilitários para parsing de rotas na URL (`?store=`, `?admin=`, `?superadmin=`).

---

## 5. Funcionamento PWA e Multi-Lojas (Aplicativo Instalado no Celular)

1. **Cliente acessando dois links de lojas diferentes (`/?store=loja-a` e `/?store=loja-b`)**:
   - Cada link carrega no navegador a loja exata correspondente (catálogo próprio, cores, logo e WhatsApp daquela loja).
   - Se a cliente instalar o aplicativo pelo link da Loja A, o ícone no celular abre o catálogo da Loja A.
   - Caso a cliente receba no WhatsApp um link direto de outra loja (Loja B), ao tocar no link, o sistema abre imediatamente a Loja B, preservando o carrinho e a identidade de cada loja de forma isolada.

2. **Lojista instalando o App com o link de admin (`/?admin=sua-loja`)**:
   - Ao acessar seu link exclusivo e tocar em "Instalar Aplicativo", o app é adicionado à tela inicial do celular da lojista.
   - Como ela realiza o login com a sua senha/PIN, a sessão segura fica salva no aparelho (`localStorage`).
   - Ao tocar no ícone do aplicativo no celular, a lojista cai **direto dentro do seu painel administrativo**, com navegação em tela cheia idêntica a um app nativo, pronta para adicionar fotos, gerenciar estoque e ver pedidos.

3. **Dono do App instalando o App com o link master (`/?superadmin=intimalab`)**:
   - O Dono do App instala a partir do link master.
   - Uma vez autenticado com a chave master, o ícone no celular abre direto a **Central Master Intima Lab**, permitindo monitorar todas as lojas, liberar lojistas bloqueados e alterar senhas de qualquer lugar.

---

## 6. Histórico de Alterações Recentes

### [13/09/2026 - v5] - Reorganização Visual do Header Mobile (Linha Verde, Linha Azul e Remoção de 3 Pontinhos)
- **Atendimento estrito ao layout indicado pelo usuário**:
  - **Remoção do Botão 3 Pontinhos (`⋮`) no Mobile (Destaque em Vermelho)**: O botão de menu `MoreVertical` com dropdown flutuante foi completamente removido da visualização em smartphones, despoluindo o cabeçalho e liberando espaço horizontal.
  - **Lupa de Pesquisa na Linha Azul**: A barra de busca com o ícone da lupa (`Search`) foi posicionada como uma linha dedicada e integrada imediatamente abaixo dos botões do cabeçalho no mobile, exatamente onde o usuário desenhou a linha azul. O campo fica sempre visível e acessível para busca direta sem precisar de toques adicionais.
  - **Nome da Loja na Linha Verde**: O nome da boutique ativa (`config.name`) foi posicionado com destaque e elegância na barra superior do topo (área da linha verde desenhada pelo usuário), com tipografia Playfair Display e brilho sutil, garantindo 100% de visibilidade sem qualquer truncamento ou corte (`A...`), e com o link de Atendimento WhatsApp ao lado.
  - **Harmonia do Cabeçalho Mobile**: O cabeçalho agora possui três faixas perfeitas (Topo com Nome da Loja, Centro com Menu/Logo e Ações [Paleta, Rastreamento, Sacola], e Base com a Barra de Busca), garantindo que absolutamente nada fique escondido em qualquer tamanho de celular.

### [12/09/2026 - v4] - Otimização da Barra Superior no Mobile (Apenas Ícones Compactos)
- **Barra de Ações no Mobile**:
  - Removidos os textos explicativos ("Allure Dark / Paleta Rosé", "Meus Pedidos" e "Sacola") na visualização mobile em telas de smartphone.
  - A barra agora exibe os ícones limpos e compactos (Paleta, Rastreamento/Meus Pedidos e Sacola com badge de quantidade), deixando a área que estava em destaque no desktop totalmente visível e acessível no celular sem cortes ou quebras de linha.
  - No desktop (`sm:` e `lg:`), os rótulos de texto continuam presentes para maior clareza visual.
  - Ajustado o espaçamento da marca e logotipo para prevenir que o nome da boutique empurre os botões para fora da viewport em telas estreitas.

### [12/09/2026 - v3] - Link da Loja no Admin, Isolamento de Alertas e Histórico de Pedidos com Rastreamento em Tempo Real
- **Isolamento de Notificações (`OrderNotificationBanner`)**:
  - O banner suspenso de novo pedido ("Novo Pedido Recebido! • Ver no Painel") agora só aparece **exclusivamente nas rotas de Lojista (`/?admin=...`) e Super Admin (`/?superadmin=...`)**. A cliente final no catálogo público nunca mais vê alertas ou sons de novos pedidos destinados à área lojística.
- **Compartilhamento Rápido do Link da Loja no Painel Lojista**:
  - Criado o componente `ShareStoreModal.tsx` e adicionado o botão de destaque **"Link da Loja / Compartilhar"** na barra superior do painel administrativo.
  - A lojista pode copiar com um clique o link exato do catálogo (`/?store=sua-loja`) ou tocar em **"Compartilhar Catálogo no WhatsApp"**, que já abre uma mensagem amigável convidando a cliente com o link direto pronto.
- **Histórico e Rastreamento de Pedidos do Cliente (`ClientOrderTrackingModal`)**:
  - Criado modal completo e responsivo de acompanhamento de pedidos na visão do cliente, acessível via botão **"Meus Pedidos"** no topo e menu mobile.
  - O cliente visualiza a linha do tempo com 4 etapas em tempo real: **Enviado** ➔ **Confirmado** (quando a lojista aprova) ➔ **A Caminho / Pronto p/ Retirada** ➔ **Entregue**.
  - Qualquer alteração de status feita pela lojista em seu painel reflete instantaneamente na tela da cliente.
  - Os pedidos gerados no aparelho ficam salvos no `localStorage` por loja, e há também busca rápida por número de WhatsApp caso a cliente tenha feito o pedido em outro dispositivo.
- **Auditoria e Ajustes de Responsividade Mobile**:
  - Corrigidos elementos que ficavam ocultos em telas de celular: no HeroBanner, a foto da coleção e o card de consultoria do WhatsApp agora possuem proporção otimizada para mobile; a listagem de categorias no rodapé agora é exibida em todas as larguras de tela; o botão de "Meus Pedidos" foi integrado tanto na barra quanto no menu suspenso e gaveta lateral móvel.

### [12/09/2026 - v2] - Correção Crítica de Isolamento no Link do Lojista
- **Remoção da aba Super Admin no link do Lojista**: A lojista nunca mais tem acesso visual ou botão para alternar para a chave master do Dono do App.
- **Remoção do Seletor de Lojas**: Ao acessar `/?admin=nome-da-loja`, a loja já vem pré-fixada e identificada. Não há mais dropdown listando as outras lojas da plataforma, garantindo sigilo comercial total entre lojistas.
- **Login Direto sem Modal Intermediário**: A tela `/?admin=nome-da-loja` já apresenta diretamente o campo de senha daquela loja com o botão de olho para visibilidade e feedback de tentativas.
- **Banner PWA Dinâmico**: Atualizado `PwaInstallBanner` para exibir dinamicamente o nome da boutique ativa em vez de texto estático.

### [12/09/2026 - v1] - Rebranding para Intima Lab e Ocultação de Acessos no Catálogo
- **Rebranding completo**: Atualizados `package.json`, `public/manifest.json`, `index.html`, `metadata.json`, `README.md` e `sw.js` para o nome oficial **Intima Lab**.
- **Segurança da interface do cliente**: Removidos todos os elementos que davam acesso à Área do Lojista ou Super Admin da visão pública.
- **Criação da documentação viva**: Criados `DOCUMENTACAO-PROJETO.md` e `AGENTS.md`.
