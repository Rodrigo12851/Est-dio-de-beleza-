# Intima Lab 🛍️

Plataforma multi-lojas e catálogo inteligente para marcas de moda íntima e lingerie, com governança administrativa, links exclusivos por lojista e checkout integrado via WhatsApp.

---

## 🌟 Funcionalidades Principais

- **Links Exclusivos por Loja**:
  - **Catálogo da Cliente**: `/?store=nome-da-loja`
  - **Painel Administrativo da Lojista**: `/?admin=nome-da-loja`
  - **Link Master do Dono do Aplicativo**: `/?superadmin=intimalab`
- **Gestão de Segurança e Senhas**:
  - Alternância para visualizar/ocultar senha durante a digitação.
  - Troca de senha com validação da senha anterior e confirmação dupla.
  - Bloqueio automático de segurança após 4 tentativas consecutivas.
  - Botão direto para contato via WhatsApp com o Suporte Oficial (Dono do App) para desbloqueio.
  - Sincronização em tempo real das senhas com o Super Admin do Dono do App.
- **Catálogo & Cadastro de Peças**:
  - Upload de fotos direto da galeria do celular ou computador.
  - Captura inteligente de cor (Hex) a partir de fotos da galeria.
  - Gestão de tamanhos, variações e estoque.

---

## 🚀 Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 📦 Build para Produção

```bash
npm run build
```
