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

## 4. Como Executar e Atualizar

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
