import * as XLSX from 'xlsx';
import { Church } from '../types';
import { 
  getMembers, 
  getChildren, 
  getSchedules, 
  getMinistries, 
  getFinancialEntries, 
  getFinancialExpenses,
  getWeddingAnniversaries 
} from './storage';

export function exportChurchToExcel(church: Church): void {
  const wb = XLSX.utils.book_new();

  // 1. ABA: DADOS DA IGREJA
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

  // 2. ABA: MEMBROS
  const members = getMembers(church.id);
  const membersData = members.map(m => ({
    Nome: m.name,
    Telefone: m.phone || m.whatsapp || '',
    WhatsApp: m.whatsapp ? 'https://wa.me/55' + m.whatsapp.replace(/\D/g, '') : '',
    Email: m.email || '',
    DataNascimento: m.birthDate ? m.birthDate.split('-').reverse().join('/') : '',
    DataBatismo: m.baptismDate ? m.baptismDate.split('-').reverse().join('/') : '',
    Cargo: m.churchRole || 'Membro',
    Status: m.status || 'Ativo',
    Bairro: m.neighborhood || '',
    Cidade: m.city || '',
    Ministerio: m.ministry || '',
    PequenoGrupo: m.smallGroupId || ''
  }));
  const wsMembers = XLSX.utils.json_to_sheet(membersData.length > 0 ? membersData : [{ Mensagem: 'Nenhum membro cadastrado nesta congregação.' }]);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Membros');

  // 3. ABA: ANIVERSARIANTES E CASAMENTOS
  const weddings = getWeddingAnniversaries(church.id);
  const weddingsData = [
    ...weddings.today.map(w => ({ Tipo: 'Boda de Casamento (Hoje)', Nomes: w.coupleName, Data: w.weddingDate, Anos: w.yearsMarried, WhatsApp: w.whatsapp })),
    ...weddings.upcoming.map(w => ({ Tipo: 'Boda de Casamento (Próximos)', Nomes: w.coupleName, Data: w.weddingDate, Anos: w.yearsMarried, WhatsApp: w.whatsapp }))
  ];
  const wsWeddings = XLSX.utils.json_to_sheet(weddingsData.length > 0 ? weddingsData : [{ Mensagem: 'Sem registros de bodas de casamento.' }]);
  XLSX.utils.book_append_sheet(wb, wsWeddings, 'Casamentos e Bodas');

  // 4. ABA: CRIANÇAS (DEPARTAMENTO INFANTIL)
  const children = getChildren(church.id);
  const childrenData = children.map(c => ({
    Nome: c.name,
    DataNascimento: c.birthDate || '',
    Responsavel: c.guardianName || '',
    TelefoneResponsavel: c.guardianPhone || c.guardianWhatsapp || '',
    ClasseEBD: c.ebdClass || 'Departamento Infantil',
    Observacoes: c.notes || ''
  }));
  const wsChildren = XLSX.utils.json_to_sheet(childrenData.length > 0 ? childrenData : [{ Mensagem: 'Nenhuma criança cadastrada no Departamento Infantil.' }]);
  XLSX.utils.book_append_sheet(wb, wsChildren, 'Departamento Infantil');

  // 5. ABA: PROGRAMAÇÃO E CULTOS
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

  // 6. ABA: MINISTÉRIOS
  const ministries = getMinistries(church.id);
  const ministriesData = ministries.map(min => ({
    Ministerio: min.name,
    Lider: min.leaderName || '',
    Descricao: min.description || '',
    TotalMembros: min.membersCount || 0
  }));
  const wsMinistries = XLSX.utils.json_to_sheet(ministriesData.length > 0 ? ministriesData : [{ Mensagem: 'Sem ministérios cadastrados.' }]);
  XLSX.utils.book_append_sheet(wb, wsMinistries, 'Ministérios');

  // 7. ABA: ENTRADAS E SAÍDAS FINANCEIRAS
  const entries = getFinancialEntries(church.id);
  const expenses = getFinancialExpenses(church.id);
  const financeData = [
    ...entries.map(e => ({ Tipo: 'Entrada / Dízimo / Oferta', Data: e.date, Categoria: e.category, Descricao: e.description, Valor: Number(e.amount), FormaPagamento: e.paymentMethod })),
    ...expenses.map(ex => ({ Tipo: 'Despesa / Saída', Data: ex.date, Categoria: ex.category, Descricao: ex.description, Valor: -Number(ex.amount), FormaPagamento: ex.paymentMethod }))
  ];
  const wsFinance = XLSX.utils.json_to_sheet(financeData.length > 0 ? financeData : [{ Mensagem: 'Sem movimentações financeiras registradas.' }]);
  XLSX.utils.book_append_sheet(wb, wsFinance, 'Financeiro');

  // Nome do Arquivo Sanitizado
  const cleanName = church.name.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `Backup_${cleanName}_${dateStr}.xlsx`;

  // Download do arquivo XLSX no navegador
  XLSX.writeFile(wb, fileName);
}
