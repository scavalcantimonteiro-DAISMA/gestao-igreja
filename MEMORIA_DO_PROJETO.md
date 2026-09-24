# MEMÓRIA & CONTEXTO COMPLETO DO PROJETO - GESTÃO IGREJA (SAAS MULTI-TENANT)

> **Atenção Antigravity / IA:** Este arquivo contém todo o histórico de decisões, regras de negócio e arquitetura técnica da plataforma **Gestão Igreja**. Ao abrir este projeto em qualquer máquina nova, utilize este documento como guia definitivo.

---

## 1. Visão Geral do Sistema
O **Gestão Igreja** é uma plataforma eclesiástica moderna, responsiva e **Multi-Tenant SaaS** desenvolvida em **React + TypeScript + Vite + Tailwind CSS + Cloud Firestore / Firebase**.
* **Marca Oficial:** Desenvolvido sob a marca **Saulo Monteiro - Sistemas & Desenvolvimento**.
* **Igreja Piloto:** Comunidade Batista Acolher (Maceió - AL) | Instagram: `@cbacolher`.
* **Repositório GitHub:** `https://github.com/scavalcantimonteiro-DAISMA/gestao-igreja`
* **Deploy Produção (Vercel / Netlify):** `https://gestaodeigrejas-beta.vercel.app`

---

## 2. Arquitetura & Segurança Multi-Tenancy

* **Isolamento de Dados (`churchId`):**
  - Cada congregação possui seu identificador único (`churchId`).
  - Todas as consultas, membros, finanças, PGs e relatórios filtram estritamente pelo `churchId` da igreja ativa.
  - Regras no Firebase: configuradas em `firestore.rules`.
* **Acesso Master Admin (SaaS):**
  - O desenvolvedor Saulo Monteiro possui credenciais de acesso com a senha master `160605`.
  - Permite criar novas congregações clientes no painel Master (`MasterAdminPanel.tsx`) e alternar entre congregações com 1 clique.
* **Perfis de Usuário:**
  - `SUPERADMIN` (Saulo Monteiro)
  - `PASTOR`
  - `SECRETARIA`
  - `TESOURARIA`
  - `LIDER_PG`

---

## 3. Módulos & Recursos Principais

1. **Dashboard Inteligente:**
   - Aniversariantes do dia e próximos 7 dias com botão de mensagem direta no WhatsApp.
   - Aniversários de casamento com cálculo automático de tempo de matrimônio.
   - **Relatório Diário do Pastor:** Resumo matinal formatado com botão "Copiar Texto" e envio via WhatsApp para o pastor titular.
2. **Secretaria & Membresia:**
   - Cadastro completo de membros, endereço, CPF, vida cristã e dons.
   - **Acolher Kids:** Ficha infantil com dados dos responsáveis e turma da EBD.
   - **Famílias:** Gestão familiar com visualização de Árvore Genealógica.
3. **Pequenos Grupos (PGs):**
   - Gestão de líderes, lista de participantes e registro de reuniões semanais.
4. **Cuidado Pastoral & Gabinete:**
   - Aconselhamentos, agendamento de visitas pastorais e mural de oração.
5. **Visitantes & Acolhimento:**
   - Funil de acolhimento (1º, 2º e 3º contato) e chamada bíblica.
6. **Módulo Financeiro Protegido por PIN:**
   - Acesso restrito com PIN inicial (`0000`) e alerta de troca de segurança.
   - Entradas, saídas categorizadas, dízimos, ofertas e balanço geral em R$.
7. **Modelos de Mensagens WhatsApp:**
   - Editor de textos dinâmicos para WhatsApp (sem textos fixos no código).

---

## 4. Autenticação, Sincronização em Nuvem & Multi-Dispositivo

* **Sincronização em Nuvem em Tempo Real (Cloud Firestore):**
  - Todas as igrejas e seus perfis são salvos e sincronizados automaticamente no Firestore (`churches` collection via `cloudSync.ts`).
  - **Sincronia Bidirecional Instantânea (Site <-> App):** Implementado listener contínuo com `onSnapshot` (`subscribeToChurches`). Qualquer alteração realizada no aplicativo (celular) reflete no site (desktop/navegador) em tempo real, e vice-versa.
  - **Sanitização de Payloads Firestore:** Função `sanitizeForFirestore` remove recursivamente chaves com valor `undefined`, garantindo que nenhuma gravação falhe silenciosamente no Firestore.
  - **Preservação de Dados Atualizados:** A inicialização do armazenamento local preserva as alterações do perfil do usuário e da nuvem sem sobrescrever com dados estáticos de seed.
* **Canais Oficiais de WhatsApp para Disparos:**
  - Sem números fixos no código: cada congregação define seus próprios números oficiais com DDD de qualquer estado do Brasil.
  - **Pastor Titular:** Telefone/WhatsApp do pastor para felicitações pastorais e envio do Relatório Diário.
  - **Gabinete Pastoral:** Telefone/WhatsApp do gabinete para mensagens e atendimentos.
  - **Secretaria da Igreja:** Telefone/WhatsApp da secretaria para acolhimento de visitantes e avisos gerais.
  - **Decisão de Remetente nos Disparos:** Nos aniversários de nova idade e casamento, a congregação decide na hora se dispara em nome do Pastor Titular ou do Gabinete Pastoral. Se os números não estiverem cadastrados, o sistema solicita e permite cadastrá-los na hora com 1 clique.
  - Para as demais mensagens, o sistema solicita o cadastro obrigatório do WhatsApp da Secretaria da congregação.
* **Isolamento de Sessão & Segurança:**
  - Login de igreja isolado: congregações clientes só enxergam seus próprios dados e **não têm acesso** ao painel master nem ao menu "Trocar Igreja".
  - Troca obrigatória de senha no 1º login: quando uma nova igreja é cadastrada com senha provisória ou quando a senha é resetada pelo Master, ela é obrigada a definir sua nova senha no primeiro acesso antes de entrar no sistema.
  - Normalização inteligente de login: remove stopwords (`no`, `de`, `da`, `do`), acentos e pontuações, permitindo que os pastores acessem digitando tanto `ibcapungaparnamirim` quanto `ibcapunganoparnamirim` ou o nome por extenso.
* **Ferramenta "Copiar Acesso":**
  - No painel Master Admin, o botão "Copiar Acesso" copia instantaneamente para a área de transferência a mensagem formatada para envio no WhatsApp do pastor com usuário, link e orientações de 1º acesso.

---

## 5. Como Executar e Atualizar

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Compilar para produção
npm run build

# Enviar atualizações para GitHub e Vercel
git add .
git commit -m "suas alterações"
git push origin main
```
*(Ou dar 2 cliques no script `ENVIAR_IGREJA_PARA_GITHUB.bat` na Área de Trabalho)*.

