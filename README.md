# GESTÃO IGREJA — Plataforma Eclesiástica Multi-Tenant SaaS

Sistema web moderno, ágil e responsivo de gestão eclesiástica, desenvolvido para a **Comunidade Batista Acolher** (Maceió - AL) e preparado para expansão como plataforma SaaS para múltiplas igrejas sob a marca **Saulo Monteiro - Sistemas & Desenvolvimento**.

---

## 🌟 Principais Recursos Implementados

1. **Identidade Visual & Marca do Desenvolvedor**:
   - Destaque oficial de **Saulo Monteiro - Sistemas & Desenvolvimento** no login e no cabeçalho.
   - Identidade visual completa da **Comunidade Batista Acolher**:
     - Slogan oficial: *"A chama que nos move é o amor"*
     - Endereço: Avenida Júlio Marquez Luz, 1408 - Jatiúca, Maceió - AL
     - Instagram oficial: `@cbacolher`
     - Logotipo em vetor com a chama e coração entrelaçados nas cores azul marinho e ciano.

2. **Acesso Master Admin Exclusivo (SaaS)**:
   - Login administrativo com a senha `160605` para acesso de Saulo Monteiro.
   - Painel Master para cadastrar novas congregações no sistema e alternar entre congregações com 1 clique.

3. **Multi-Tenancy & Segurança**:
   - Isolamento absoluto de dados entre igrejas através do identificador `churchId`.
   - Regras de segurança Cloud Firestore configuradas em `firestore.rules`.
   - Controle de perfis: Master Admin (SUPERADMIN), Pastor, Secretaria, Tesouraria e Líder de PG.

4. **Dashboard Principal com Destaques**:
   - **Aniversariantes de Hoje e Próximos 7 Dias** com botão de envio direto pelo WhatsApp com texto personalizado.
   - **Aniversários de Casamento** com contagem automática de anos de união e botão de bênção matrimonial.
   - **Relatório Diário do Pastor**: Gera o resumo matinal formatado com botão "Copiar Texto" e envio via WhatsApp para o número do pastor titular cadastrado.
   - Próximos atendimentos do gabinete pastoral e agenda de cultos.

5. **Módulos Integrados**:
   - **Cadastro de Membros**: Ficha completa com dados pessoais, endereço, CPF, vida cristã e dons, filtros e busca global.
   - **Crianças (Acolher Kids)**: Ficha infantil adaptada com contato dos responsáveis, turma da EBD e escola.
   - **Famílias & Casamentos**: Cadastro familiar com visualização de **Árvore Genealógica**.
   - **Pequenos Grupos (PGs)**: Gestão de líderes, lista de participantes e registro de reuniões semanais.
   - **Gabinete & Cuidado Pastoral**: Agendamento de aconselhamentos, visitas e mural de oração.
   - **Visitantes & EBD**: Funil de acolhimento (1º, 2º e 3º contato) e chamada bíblica.
   - **Financeiro Protegido por PIN**: Acesso restrito com PIN inicial `0000`, alerta para troca de senha, lançamentos categorizados e balanço em Real (R$).
   - **Relatórios**: Impressão formatada e exportação direta para CSV / Excel.
   - **Configurações & Modelos de Mensagens**: Editor de mensagens dinâmicas de WhatsApp (sem textos fixos no código).

---

## 🚀 Como Executar Localmente

No terminal, dentro da pasta do projeto:

```bash
# Rodar em modo de desenvolvimento
npm run dev
```

Abra no navegador em: `http://localhost:5173`

---

## 🌐 Como Publicar Gratuitamente no Netlify

O projeto já está 100% configurado para o Netlify com o arquivo `netlify.toml`!

### Opção 1: Via Git (Recomendada)
1. Suba este projeto para o seu GitHub/GitLab.
2. Acesse [netlify.com](https://www.netlify.com/) e clique em **"Add new site" > "Import an existing project"**.
3. Selecione o repositório. O Netlify detectará automaticamente:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Clique em **Deploy**! O site estará no ar em segundos com certificado SSL/HTTPS gratuito.

### Opção 2: Drag & Drop (Arrastar e Soltar)
1. Execute `npm run build` (a pasta `dist` já foi gerada com sucesso).
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
3. Arraste a pasta `dist` para a área de upload. O site estará online imediatamente!

---

## 🔑 Credenciais Iniciais de Demonstração

- **Master Admin (Saulo Monteiro)**:
  - Senha: `160605` (ou `S@ulo160605`)
- **Acesso ao Financeiro**:
  - PIN inicial: `0000` (pode ser alterado a qualquer momento no modal financeiro).
- **Perfis de Teste**:
  - No menu do usuário (canto superior direito), você pode alternar em 1 clique entre **Master Admin**, **Pastor**, **Secretaria** e **Tesouraria**.
