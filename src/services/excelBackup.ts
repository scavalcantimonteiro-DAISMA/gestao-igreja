import * as XLSX from 'xlsx';
import { 
  Church, 
  Member, 
  Child, 
  Family, 
  SmallGroup, 
  Ministry, 
  MinistryScale,
  Leadership, 
  Schedule, 
  ChurchEvent, 
  PastoralAppointment, 
  PastoralVisit, 
  PrayerRequest, 
  Visitor, 
  BibleClass, 
  BaptismRecord,
  FinancialEntry, 
  FinancialExpense, 
  FixedExpense 
} from '../types';
import { 
  getMembers, 
  getChildren, 
  getSchedules, 
  getMinistries, 
  getFinancialEntries, 
  getFinancialExpenses,
  getWeddingAnniversaries,
  getBaptismRecords 
} from './storage';

function sanitize(name: string): string {
  return (name || 'Igreja').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const parts = iso.split('T')[0].split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return iso;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// =========================================================================
// 1. EXPORTAÇÃO DE MEMBROS
// =========================================================================
export function exportMembersToExcel(church: Church, members: Member[]): void {
  const wb = XLSX.utils.book_new();
  const rows = members.map((m, index) => ({
    'Nº': index + 1,
    'Nome Completo': m.name,
    'Status': m.status || 'Ativo',
    'Cargo': m.churchRole || 'Membro',
    'Gênero': m.gender === 'F' ? 'Feminino' : 'Masculino',
    'WhatsApp / Telefone': m.whatsapp || m.phone || '',
    'E-mail': m.email || '',
    'Data de Nascimento': formatDate(m.birthDate),
    'Estado Civil': m.maritalStatus || 'Solteiro(a)',
    'Cônjuge': m.spouseName || '',
    'Data de Casamento': formatDate(m.weddingDate),
    'Profissão': m.profession || '',
    'Rua': m.street || '',
    'Número': m.number || '',
    'Bairro': m.neighborhood || '',
    'Cidade': m.city || '',
    'Estado': m.state || '',
    'CEP': m.cep || '',
    'Ministério': m.ministry || '',
    'Pequeno Grupo': m.smallGroupId || '',
    'Dons / Habilidades': m.talents || '',
    'Data de Batismo': formatDate(m.baptismDate),
    'Igreja do Batismo': m.baptismChurch || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhum membro cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Membros');
  XLSX.writeFile(wb, `Membros_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 2. EXPORTAÇÃO DO DEPARTAMENTO INFANTIL (CRIANÇAS)
// =========================================================================
export function exportChildrenToExcel(church: Church, children: Child[]): void {
  const wb = XLSX.utils.book_new();
  const rows = children.map((c, index) => ({
    'Nº': index + 1,
    'Nome da Criança': c.name,
    'Gênero': c.gender === 'F' ? 'Feminino' : 'Masculino',
    'Data de Nascimento': formatDate(c.birthDate),
    'Nome do Responsável': c.guardianName || '',
    'Pai': c.fatherName || '',
    'Mãe': c.motherName || '',
    'WhatsApp do Responsável': c.guardianWhatsapp || c.guardianPhone || '',
    'Classe EBD': c.ebdClass || 'Departamento Infantil',
    'Escola': c.school || '',
    'Série Escolar': c.schoolGrade || '',
    'Observações': c.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhuma criança cadastrada.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Departamento Infantil');
  XLSX.writeFile(wb, `Departamento_Infantil_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 3. EXPORTAÇÃO DE FAMÍLIAS & CASAMENTOS
// =========================================================================
export function exportFamiliesToExcel(church: Church, families: Family[], weddingsList?: any[]): void {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Famílias
  const famRows = families.map((f, index) => ({
    'Nº': index + 1,
    'Nome da Família': f.familyName,
    'Esposo / Pai': f.fatherName || '',
    'Esposa / Mãe': f.motherName || '',
    'Endereço': f.address || '',
    'Telefone / WhatsApp': f.whatsapp || f.phone || '',
    'Data de Casamento': formatDate(f.weddingDate),
    'Local do Casamento': f.weddingPlace || '',
    'Possui Filhos?': (f.children && f.children.length > 0) || f.hasChildren ? 'Sim' : 'Não',
    'Qtd. Filhos': f.children?.length || 0,
    'Relação de Filhos': f.children && f.children.length > 0 
      ? f.children.map(c => `${c.name}${c.age ? ` (${c.age})` : (c.birthDate ? ` (${formatDate(c.birthDate)})` : '')}`).join(', ')
      : 'Nenhum',
    'Observações': f.notes || ''
  }));
  const wsFam = XLSX.utils.json_to_sheet(famRows.length > 0 ? famRows : [{ Aviso: 'Nenhuma família cadastrada.' }]);
  XLSX.utils.book_append_sheet(wb, wsFam, 'Famílias');

  // Sheet 2: Aniversários de Casamento
  if (weddingsList && weddingsList.length > 0) {
    const wedRows = weddingsList.map(w => ({
      'Casal': w.coupleName || `${w.husbandName || ''} & ${w.wifeName || ''}`,
      'Data do Casamento': formatDate(w.weddingDate),
      'Anos de Casados': w.yearsMarried ? `${w.yearsMarried} anos` : '',
      'Telefone / WhatsApp': w.whatsapp || w.phone || ''
    }));
    const wsWed = XLSX.utils.json_to_sheet(wedRows);
    XLSX.utils.book_append_sheet(wb, wsWed, 'Bodas e Casamentos');
  }

  // Sheet 3: Filhos Cadastrados das Famílias
  const allKids: any[] = [];
  families.forEach(f => {
    if (f.children && f.children.length > 0) {
      f.children.forEach(c => {
        allKids.push({
          'Família': f.familyName,
          'Nome do Filho(a)': c.name,
          'Gênero': c.gender === 'F' ? 'Feminino' : 'Masculino',
          'Data Nasc.': formatDate(c.birthDate),
          'Idade': c.age || '',
          'Telefone / Contato': c.phone || '',
          'Pai': f.fatherName || '',
          'Mãe': f.motherName || ''
        });
      });
    }
  });
  if (allKids.length > 0) {
    const wsKids = XLSX.utils.json_to_sheet(allKids);
    XLSX.utils.book_append_sheet(wb, wsKids, 'Filhos das Famílias');
  }

  XLSX.writeFile(wb, `Familias_e_Casamentos_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 4. EXPORTAÇÃO DA PROGRAMAÇÃO & CULTOS
// =========================================================================
export function exportSchedulesToExcel(church: Church, schedules: Schedule[]): void {
  const wb = XLSX.utils.book_new();
  const rows = schedules.map(s => ({
    'Título / Culto': s.title,
    'Dia da Semana': s.dayOfWeek,
    'Horário': s.time,
    'Local': s.location || 'Templo',
    'Responsável': s.responsible || '',
    'Recorrência': s.recurrence || 'Semanal',
    'Descrição': s.description || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhuma programação cadastrada.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Programação');
  XLSX.writeFile(wb, `Programacao_Cultos_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 5. EXPORTAÇÃO DE EVENTOS ESPECIAIS
// =========================================================================
export function exportEventsToExcel(church: Church, events: ChurchEvent[]): void {
  const wb = XLSX.utils.book_new();
  const rows = events.map(e => ({
    'Nome do Evento': e.name,
    'Data de Início': formatDate(e.startDate),
    'Horário': e.time || '',
    'Data de Término': formatDate(e.endDate),
    'Local': e.location || 'Templo',
    'Responsável': e.responsible || '',
    'Inscrições': e.registrationOpen ? 'Abertas' : 'Encerradas',
    'Vagas': e.maxSpots ? `${e.spotsTaken}/${e.maxSpots}` : `${e.spotsTaken} inscritos`,
    'Descrição': e.description || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhum evento especial cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Eventos Especiais');
  XLSX.writeFile(wb, `Eventos_Especiais_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 6. EXPORTAÇÃO DE PEQUENOS GRUPOS (PG)
// =========================================================================
export function exportSmallGroupsToExcel(church: Church, groups: SmallGroup[]): void {
  const wb = XLSX.utils.book_new();
  const rows = groups.map(g => ({
    'Nome do Pequeno Grupo': g.name,
    'Líder Principal': g.leaderName,
    'Telefone do Líder': g.leaderPhone || '',
    'Vice-Líder / Co-Líder': g.coLeaderName || '',
    'Dia de Reunião': g.dayOfWeek || '',
    'Horário': g.time || '',
    'Endereço': g.address || '',
    'Frequência': g.frequency || 'semanal',
    'Status': g.status || 'Ativo',
    'Total de Participantes': g.participantsCount || (g.participants?.length || 0)
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhum pequeno grupo cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Pequenos Grupos');
  XLSX.writeFile(wb, `Pequenos_Grupos_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 7. EXPORTAÇÃO DE LIDERANÇA
// =========================================================================
export function exportLeadershipToExcel(church: Church, leadership: Leadership[]): void {
  const wb = XLSX.utils.book_new();
  const rows = leadership.map(l => ({
    'Nome do Líder': l.name,
    'Cargo Eclesiástico': l.role,
    'Ministério / Área': l.ministry || '',
    'Telefone / WhatsApp': l.whatsapp || l.phone || '',
    'E-mail': l.email || '',
    'Início do Exercício': formatDate(l.startDate),
    'Término': formatDate(l.endDate),
    'Observações': l.observations || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhum líder cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Liderança');
  XLSX.writeFile(wb, `Lideranca_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 8. EXPORTAÇÃO DE MINISTÉRIOS
// =========================================================================
export function exportMinistriesToExcel(church: Church, ministries: Ministry[]): void {
  const wb = XLSX.utils.book_new();
  const rows = ministries.map(m => ({
    'Nome do Ministério': m.name,
    'Líder': m.leaderName || '',
    'Vice-Líder': m.viceLeaderName || '',
    'Dia de Encontro': m.meetingDay || '',
    'Horário': m.meetingTime || '',
    'Local': m.location || '',
    'Total de Integrantes': m.membersCount || (m.members?.length || 0),
    'Descrição': m.description || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhum ministério cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Ministérios');
  XLSX.writeFile(wb, `Ministerios_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 8.1. EXPORTAÇÃO DE ESCALAS DE MINISTÉRIOS
// =========================================================================
export function exportMinistryScalesToExcel(church: Church, scales: MinistryScale[]): void {
  const wb = XLSX.utils.book_new();
  const rows = scales.map(s => ({
    'Ministério': s.ministryName,
    'Data da Escala': formatDate(s.date),
    'Horário / Culto': s.time || '',
    'Ocasião / Culto': s.title || '',
    'Líder Responsável': s.leaderName,
    'WhatsApp do Líder': s.leaderPhone || '',
    'Total de Escalados': s.members?.length || 0,
    'Equipe Escalada': (s.members || []).map(m => typeof m === 'string' ? m : `${m.name}${m.role ? ` (${m.role})` : ''}`).join(' | '),
    'Instruções / Observações': s.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhuma escala ministerial cadastrada.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Escalas');
  XLSX.writeFile(wb, `Escalas_Ministeriais_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 9. EXPORTAÇÃO DO GABINETE PASTORAL, VISITAS E ORAÇÃO
// =========================================================================
export function exportPastoralToExcel(church: Church, type: 'gabinete' | 'visitas' | 'oracao', data: any[]): void {
  const wb = XLSX.utils.book_new();
  let rows: any[] = [];
  let sheetName = 'Gabinete';

  if (type === 'gabinete') {
    sheetName = 'Agendamentos Gabinete';
    rows = data.map(item => ({
      'Membro / Solicitante': item.memberName,
      'Data': formatDate(item.date),
      'Horário': item.time || '',
      'Pastor / Conselheiro': item.pastorName || '',
      'Status': item.status || 'Agendado',
      'Motivo': item.reason || '',
      'Anotações Confidenciais': item.notes || ''
    }));
  } else if (type === 'visitas') {
    sheetName = 'Visitas Pastorais';
    rows = data.map(item => ({
      'Membro / Família Visitada': item.memberName,
      'Data da Visita': formatDate(item.date),
      'Endereço': item.address || '',
      'Responsável pela Visita': item.pastorName || '',
      'Status': item.status || 'Realizada',
      'Motivo': item.reason || '',
      'Relato da Visita': item.notes || ''
    }));
  } else {
    sheetName = 'Pedidos de Oração';
    rows = data.map(item => ({
      'Solicitante': item.requesterName,
      'Telefone / WhatsApp': item.whatsapp || item.phone || '',
      'Data do Pedido': formatDate(item.createdAt || item.date),
      'Motivo / Descrição': item.description || item.request || '',
      'Status': item.status || 'Em Intercessão',
      'Testemunho / Atualização': item.testimony || ''
    }));
  }

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: `Sem registros em ${sheetName}.` }]);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `Pastoral_${type}_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 10. EXPORTAÇÃO DE VISITANTES
// =========================================================================
export function exportVisitorsToExcel(church: Church, visitors: Visitor[]): void {
  const wb = XLSX.utils.book_new();
  const rows = visitors.map(v => ({
    'Nome do Visitante': v.name,
    'WhatsApp / Telefone': v.whatsapp || v.phone || '',
    'Data da 1ª Visita': formatDate(v.firstVisitDate),
    'Como conheceu a igreja': v.howMetChurch || '',
    'Status de Acompanhamento': v.status || 'novo',
    'Observações': v.notes || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Aviso: 'Nenhum visitante cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Visitantes');
  XLSX.writeFile(wb, `Visitantes_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 11. EXPORTAÇÃO DA ESCOLA BÍBLICA (EBD)
// =========================================================================
export function exportEbdToExcel(church: Church, classes: BibleClass[]): void {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Salas de EBD
  const classRows = classes.map(c => ({
    'Nome da Classe / Sala': c.name,
    'Faixa Etária / Público': c.ageGroup || '',
    'Professor Titular': c.teacher,
    'Telefone do Professor': c.teacherPhone || '',
    'Professor Auxiliar': c.assistantTeacher || '',
    'Horário da Aula': c.scheduleTime || '09:00 - 10:15',
    'Local / Sala': c.room || '',
    'Total de Alunos Matriculados': c.enrolledStudentsCount || (c.students?.length || 0),
    'Observações / Tema': c.notes || ''
  }));
  const wsClasses = XLSX.utils.json_to_sheet(classRows.length > 0 ? classRows : [{ Aviso: 'Nenhuma classe cadastrada.' }]);
  XLSX.utils.book_append_sheet(wb, wsClasses, 'Classes EBD');

  // Sheet 2: Alunos Matriculados (se houver detalhes)
  const studentRows: any[] = [];
  classes.forEach(cls => {
    if (cls.students && Array.isArray(cls.students)) {
      cls.students.forEach((s: any) => {
        studentRows.push({
          'Classe': cls.name,
          'Nome do Aluno': typeof s === 'string' ? s : s.name,
          'Idade': typeof s === 'object' ? s.age || '' : '',
          'Telefone / WhatsApp': typeof s === 'object' ? s.phone || '' : ''
        });
      });
    }
  });

  if (studentRows.length > 0) {
    const wsStudents = XLSX.utils.json_to_sheet(studentRows);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Alunos Matriculados');
  }

  XLSX.writeFile(wb, `EBD_Escola_Biblica_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 12. EXPORTAÇÃO FINANCEIRA COMPLETA (FLUXO, COMPARATIVO E DESPESAS FIXAS)
// =========================================================================
export function exportFinanceToExcel(
  church: Church, 
  entries: FinancialEntry[], 
  expenses: FinancialExpense[], 
  fixedExpenses: FixedExpense[] = [],
  year: string = new Date().getFullYear().toString()
): void {
  const wb = XLSX.utils.book_new();

  // 1. ABA: COMPARATIVO MENSAL DO ANO
  const MONTHS = [
    { num: '01', name: 'Janeiro' },
    { num: '02', name: 'Fevereiro' },
    { num: '03', name: 'Março' },
    { num: '04', name: 'Abril' },
    { num: '05', name: 'Maio' },
    { num: '06', name: 'Junho' },
    { num: '07', name: 'Julho' },
    { num: '08', name: 'Agosto' },
    { num: '09', name: 'Setembro' },
    { num: '10', name: 'Outubro' },
    { num: '11', name: 'Novembro' },
    { num: '12', name: 'Dezembro' }
  ];

  const comparativeRows = MONTHS.map(m => {
    const monthKey = `${year}-${m.num}`;
    const mEntries = entries.filter(e => e.date.startsWith(monthKey));
    const mExpenses = expenses.filter(x => x.date.startsWith(monthKey));
    const totalE = mEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalX = mExpenses.reduce((sum, x) => sum + x.amount, 0);
    const balance = totalE - totalX;

    const endOfMonth = `${year}-${m.num}-31`;
    const accE = entries.filter(e => e.date <= endOfMonth).reduce((sum, e) => sum + e.amount, 0);
    const accX = expenses.filter(x => x.date <= endOfMonth).reduce((sum, x) => sum + x.amount, 0);
    const finalCash = accE - accX;

    return {
      'Mês': `${m.name}/${year}`,
      'Total Entradas (R$)': Number(totalE.toFixed(2)),
      'Total Saídas (R$)': Number(totalX.toFixed(2)),
      'Saldo do Mês (R$)': Number(balance.toFixed(2)),
      'Caixa Final Acumulado (R$)': Number(finalCash.toFixed(2)),
      'Qtd. Entradas': mEntries.length,
      'Qtd. Saídas': mExpenses.length
    };
  });

  const wsComp = XLSX.utils.json_to_sheet(comparativeRows);
  XLSX.utils.book_append_sheet(wb, wsComp, 'Comparativo Mensal');

  // 2. ABA: ENTRADAS (DÍZIMOS E OFERTAS)
  const entryRows = entries.map((e, index) => ({
    'Nº': index + 1,
    'Data': formatDate(e.date),
    'Descrição': e.description,
    'Categoria': e.category,
    'Valor (R$)': Number(e.amount.toFixed(2)),
    'Forma de Pagamento': e.paymentMethod || 'PIX',
    'Observações': e.notes || ''
  }));
  const wsEntries = XLSX.utils.json_to_sheet(entryRows.length > 0 ? entryRows : [{ Aviso: 'Sem entradas registradas.' }]);
  XLSX.utils.book_append_sheet(wb, wsEntries, 'Entradas');

  // 3. ABA: SAÍDAS / DESPESAS
  const expenseRows = expenses.map((x, index) => ({
    'Nº': index + 1,
    'Data': formatDate(x.date),
    'Descrição': x.description,
    'Categoria': x.category,
    'Valor (R$)': Number(x.amount.toFixed(2)),
    'Forma de Pagamento': x.paymentMethod || 'PIX',
    'Responsável': x.responsible || 'Tesouraria',
    'Observações': x.notes || ''
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expenseRows.length > 0 ? expenseRows : [{ Aviso: 'Sem saídas registradas.' }]);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Saídas');

  // 4. ABA: DESPESAS FIXAS PROGRAMADAS
  const fixedRows = fixedExpenses.map((f, index) => ({
    'Nº': index + 1,
    'Descrição da Despesa': f.description,
    'Categoria': f.category,
    'Valor Mensal (R$)': Number(f.amount.toFixed(2)),
    'Dia de Vencimento': f.dueDay,
    'Status': f.isActive ? 'Ativa' : 'Pausada',
    'Forma de Pagamento': f.paymentMethod || 'PIX',
    'Beneficiário': f.beneficiary || '',
    'Observações': f.notes || ''
  }));
  const wsFixed = XLSX.utils.json_to_sheet(fixedRows.length > 0 ? fixedRows : [{ Aviso: 'Sem despesas fixas cadastradas.' }]);
  XLSX.utils.book_append_sheet(wb, wsFixed, 'Despesas Fixas');

  XLSX.writeFile(wb, `Financeiro_Fluxo_de_Caixa_${sanitize(church.name)}_${year}.xlsx`);
}

// =========================================================================
// 13. EXPORTAÇÃO DE RELATÓRIOS ECLESIÁSTICOS (SEM DADOS FINANCEIROS)
// =========================================================================
export function exportEcclesiasticalReportToExcel(church: Church, reportType: string, data: any[]): void {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ Aviso: 'Sem dados para exportação.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  XLSX.writeFile(wb, `Relatorio_${sanitize(reportType)}_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 14. BACKUP GERAL DE TODA A CONGREGAÇÃO EM UM ÚNICO EXCEL MULTI-ABA
// =========================================================================
export function exportChurchToExcel(church: Church): void {
  const wb = XLSX.utils.book_new();

  // 1. DADOS DA IGREJA
  const churchData = [
    { Campo: 'Nome da Igreja', Valor: church.name },
    { Campo: 'Slug / Identificador', Valor: church.slug },
    { Campo: 'Usuário de Login', Valor: church.loginUser || church.slug },
    { Campo: 'Senha de Acesso', Valor: church.loginPassword || '0000' },
    { Campo: 'Endereço', Valor: church.address },
    { Campo: 'Bairro', Valor: church.neighborhood || '' },
    { Campo: 'Cidade', Valor: church.city },
    { Campo: 'Estado (UF)', Valor: church.state },
    { Campo: 'CEP', Valor: church.zipCode || '' },
    { Campo: 'CNPJ', Valor: church.cnpj || '' },
    { Campo: 'Instagram', Valor: church.instagram || '' },
    { Campo: 'Telefone Fixo', Valor: church.phone || '' },
    { Campo: 'WhatsApp da Igreja', Valor: church.whatsapp || '' },
    { Campo: 'Pastor Titular', Valor: church.pastorName || '' },
    { Campo: 'Telefone do Pastor', Valor: church.pastorPhone || '' },
    { Campo: 'WhatsApp do Pastor', Valor: church.pastorWhatsapp || '' },
    { Campo: 'Horário do Relatório Diário', Valor: church.dailyReportHour || '07:30' },
    { Campo: 'Data de Cadastro', Valor: church.createdAt || new Date().toISOString() }
  ];
  const wsChurch = XLSX.utils.json_to_sheet(churchData);
  XLSX.utils.book_append_sheet(wb, wsChurch, 'Dados da Igreja');

  // 2. MEMBROS
  const members = getMembers(church.id);
  const membersData = members.map(m => ({
    Nome: m.name,
    Telefone: m.phone || m.whatsapp || '',
    WhatsApp: m.whatsapp || '',
    Email: m.email || '',
    DataNascimento: formatDate(m.birthDate),
    DataBatismo: formatDate(m.baptismDate),
    Cargo: m.churchRole || 'Membro',
    Status: m.status || 'Ativo',
    Bairro: m.neighborhood || '',
    Cidade: m.city || '',
    Ministerio: m.ministry || '',
    PequenoGrupo: m.smallGroupId || ''
  }));
  const wsMembers = XLSX.utils.json_to_sheet(membersData.length > 0 ? membersData : [{ Mensagem: 'Nenhum membro cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Membros');

  // 3. ANIVERSARIANTES E CASAMENTOS
  const weddings = getWeddingAnniversaries(church.id);
  const weddingsData = [
    ...weddings.today.map(w => ({ Tipo: 'Boda de Casamento (Hoje)', Nomes: w.coupleName, Data: formatDate(w.weddingDate), Anos: w.yearsMarried, WhatsApp: w.whatsapp })),
    ...weddings.upcoming.map(w => ({ Tipo: 'Boda de Casamento (Próximos)', Nomes: w.coupleName, Data: formatDate(w.weddingDate), Anos: w.yearsMarried, WhatsApp: w.whatsapp }))
  ];
  const wsWeddings = XLSX.utils.json_to_sheet(weddingsData.length > 0 ? weddingsData : [{ Mensagem: 'Sem registros de casamentos.' }]);
  XLSX.utils.book_append_sheet(wb, wsWeddings, 'Casamentos e Bodas');

  // 4. CRIANÇAS
  const children = getChildren(church.id);
  const childrenData = children.map(c => ({
    Nome: c.name,
    DataNascimento: formatDate(c.birthDate),
    Responsavel: c.guardianName || '',
    TelefoneResponsavel: c.guardianWhatsapp || c.guardianPhone || '',
    ClasseEBD: c.ebdClass || 'Departamento Infantil',
    Observacoes: c.notes || ''
  }));
  const wsChildren = XLSX.utils.json_to_sheet(childrenData.length > 0 ? childrenData : [{ Mensagem: 'Nenhuma criança cadastrada.' }]);
  XLSX.utils.book_append_sheet(wb, wsChildren, 'Departamento Infantil');

  // 5. PROGRAMAÇÃO
  const schedules = getSchedules(church.id);
  const schedulesData = schedules.map(s => ({
    Titulo: s.title,
    DiaSemana: s.dayOfWeek,
    Horario: s.time,
    Local: s.location || 'Templo',
    Descricao: s.description || ''
  }));
  const wsSchedules = XLSX.utils.json_to_sheet(schedulesData.length > 0 ? schedulesData : [{ Mensagem: 'Sem cultos programados.' }]);
  XLSX.utils.book_append_sheet(wb, wsSchedules, 'Cultos e Programação');

  // 6. MINISTÉRIOS
  const ministries = getMinistries(church.id);
  const ministriesData = ministries.map(min => ({
    Ministerio: min.name,
    Lider: min.leaderName || '',
    Descricao: min.description || '',
    TotalMembros: min.membersCount || 0
  }));
  const wsMinistries = XLSX.utils.json_to_sheet(ministriesData.length > 0 ? ministriesData : [{ Mensagem: 'Sem ministérios cadastrados.' }]);
  XLSX.utils.book_append_sheet(wb, wsMinistries, 'Ministérios');

  // 7. ENTRADAS E SAÍDAS
  const entries = getFinancialEntries(church.id);
  const expenses = getFinancialExpenses(church.id);
  const financeData = [
    ...entries.map(e => ({ Tipo: 'Entrada / Dízimo / Oferta', Data: formatDate(e.date), Categoria: e.category, Descricao: e.description, Valor: Number(e.amount), FormaPagamento: e.paymentMethod })),
    ...expenses.map(ex => ({ Tipo: 'Despesa / Saída', Data: formatDate(ex.date), Categoria: ex.category, Descricao: ex.description, Valor: -Number(ex.amount), FormaPagamento: ex.paymentMethod }))
  ];
  // 8. BATISMOS
  const baptisms = getBaptismRecords(church.id);
  const baptismsData = baptisms.map(b => ({
    Candidato: b.personName,
    Telefone: b.phone || '',
    DataConversao: formatDate(b.conversionDate),
    Discipulado: b.didDiscipleship ? 'Sim' : 'Não',
    DataPrevista: formatDate(b.scheduledDate),
    Status: b.status === 'batizado' ? 'Batizado' : 'Aguardando Batismo',
    DataBatismo: formatDate(b.baptismDate),
    Observacoes: b.notes || ''
  }));
  const wsBaptisms = XLSX.utils.json_to_sheet(baptismsData.length > 0 ? baptismsData : [{ Mensagem: 'Sem registros de batismos.' }]);
  XLSX.utils.book_append_sheet(wb, wsBaptisms, 'Batismos');

  XLSX.writeFile(wb, `Backup_${sanitize(church.name)}_${getTodayString()}.xlsx`);
}

// =========================================================================
// 8. EXPORTAÇÃO INDIVIDUAL DE BATISMOS
// =========================================================================
export function exportBaptismsToExcel(church: Church, baptisms: BaptismRecord[]): void {
  const wb = XLSX.utils.book_new();
  const rows = baptisms.map((b, index) => ({
    'Nº': index + 1,
    'Candidato ao Batismo': b.personName,
    'Telefone / WhatsApp': b.phone || '',
    'Data de Conversão': formatDate(b.conversionDate),
    'Fez Discipulado': b.didDiscipleship ? 'Sim' : 'Não',
    'Data Prevista do Batismo': formatDate(b.scheduledDate),
    'Status': b.status === 'batizado' ? 'Batismo Realizado' : 'Aguardando Batismo',
    'Data da Realização do Batismo': formatDate(b.baptismDate),
    'Observações': b.notes || ''
  }));
  const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ 'Aviso': 'Nenhum candidato a batismo cadastrado.' }]);
  XLSX.utils.book_append_sheet(wb, ws, 'Batismos');
  XLSX.writeFile(wb, `${sanitize(church.name)}_Batismos_${getTodayString()}.xlsx`);
}

