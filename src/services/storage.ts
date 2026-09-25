import { 
  Church, 
  Member, 
  Child, 
  Family, 
  SmallGroup, 
  Ministry, 
  Leadership, 
  Schedule, 
  ChurchEvent, 
  PastoralAppointment, 
  PastoralVisit, 
  PrayerRequest, 
  Visitor, 
  BibleClass, 
  FinancialEntry, 
  FinancialExpense, 
  MessageTemplate, 
  AuditLog 
} from '../types';
import { 
  INITIAL_CHURCHES, 
  INITIAL_MEMBERS, 
  INITIAL_CHILDREN, 
  INITIAL_FAMILIES, 
  INITIAL_SMALL_GROUPS, 
  INITIAL_MINISTRIES, 
  INITIAL_LEADERSHIP, 
  INITIAL_SCHEDULES, 
  INITIAL_EVENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_VISITS, 
  INITIAL_PRAYER_REQUESTS, 
  INITIAL_VISITORS, 
  INITIAL_BIBLE_CLASSES, 
  INITIAL_FINANCIAL_ENTRIES, 
  INITIAL_FINANCIAL_EXPENSES, 
  INITIAL_MESSAGE_TEMPLATES, 
  INITIAL_AUDIT_LOGS 
} from './seedData';

// Prefixo para chaves de armazenamento local
const PREFIX = 'gi_';

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) {
      localStorage.setItem(PREFIX + key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Erro ao carregar chave ${key}:`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro ao salvar chave ${key}:`, e);
  }
}

// Backup automático de segurança executado a cada carregamento
export function createAutoSafetyBackup(): void {
  try {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX) && !key.includes('safety_backup')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    if (Object.keys(backup).length > 0) {
      localStorage.setItem(PREFIX + 'safety_backup_vault', JSON.stringify({
        timestamp: new Date().toISOString(),
        data: backup
      }));
    }
  } catch (err) {
    console.warn('Auto safety backup note:', err);
  }
}

export interface SystemBackupPayload {
  version: string;
  systemName: string;
  developer: string;
  exportedAt: string;
  data: Record<string, any>;
}

// Exporta todo o banco de dados multi-igreja em JSON seguro
export function exportFullSystemBackup(): SystemBackupPayload {
  const data: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return {
    version: '2.0',
    systemName: 'Portal Igrejas Multi-Tenant',
    developer: 'Saulo Monteiro',
    exportedAt: new Date().toISOString(),
    data
  };
}

// Restaura todo o banco de dados multi-igreja a partir de JSON
export function importFullSystemBackup(payload: SystemBackupPayload): boolean {
  if (!payload || !payload.data || typeof payload.data !== 'object') {
    return false;
  }
  try {
    for (const [key, value] of Object.entries(payload.data)) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
    return true;
  } catch (err) {
    console.error('Erro ao importar backup completo:', err);
    return false;
  }
}

// Inicializa dados de forma 100% não-destrutiva (NUNCA apaga dados cadastrados pelo usuário)
export function initializeStorage(): void {
  // 1. Cria backup instantâneo de segurança do estado atual
  createAutoSafetyBackup();

  // 2. Congregações: Preserva TODAS as congregações cadastradas pelo usuário e adiciona igrejas iniciais (CBA e Capunga)
  const storedChurches = getLocal<Church[]>('churches', INITIAL_CHURCHES);
  INITIAL_CHURCHES.forEach(initChurch => {
    const existingIndex = storedChurches.findIndex(c => 
      c.id === initChurch.id || 
      (c.loginUser && c.loginUser.toLowerCase() === initChurch.loginUser.toLowerCase()) ||
      (c.slug && c.slug.toLowerCase() === initChurch.slug.toLowerCase())
    );
    if (existingIndex >= 0) {
      // Preserva alterações locais e vindas da nuvem (não sobrescreve)
      const existing = storedChurches[existingIndex];
      // Garante que campos essenciais existam se novos
      if (!existing.pastorName && initChurch.pastorName) existing.pastorName = initChurch.pastorName;
    } else {
      storedChurches.push(initChurch);
    }
  });
  setLocal('churches', storedChurches);

  // 3. Membros: Garante os 140 membros da CBA sem apagar membros de nenhuma congregação cadastrada
  const storedMembers = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const hasCbaMembers = storedMembers.some(m => m.churchId === 'church_cba_maceio');
  if (!hasCbaMembers) {
    const merged = [...storedMembers, ...INITIAL_MEMBERS];
    setLocal('members', merged);
  }

  // 4. Ministérios
  const storedMinistries = getLocal<Ministry[]>('ministries', INITIAL_MINISTRIES);
  if (storedMinistries.length === 0 && INITIAL_MINISTRIES.length > 0) {
    setLocal('ministries', INITIAL_MINISTRIES);
  }

  // 5. Liderança
  const storedLeadership = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  if (storedLeadership.length === 0 && INITIAL_LEADERSHIP.length > 0) {
    setLocal('leadership', INITIAL_LEADERSHIP);
  }

  // 6. Programação / Escalas (Garante EBD aos domingos às 17h para a CBA)
  const storedSchedules = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
  let schedulesModified = false;
  const updatedSchedules = storedSchedules.map(s => {
    if (s.id === 'sched_cba_dom_ebd' && s.time !== '17:00') {
      schedulesModified = true;
      return { ...s, time: '17:00', description: 'Estudos bíblicos temáticos aos domingos às 17h para todas as faixas etárias, preparando para a celebração das 18h30.' };
    }
    return s;
  });
  if (schedulesModified) {
    setLocal('schedules', updatedSchedules);
  }

  // 7. Eventos
  const storedEvents = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  if (storedEvents.length === 0 && INITIAL_EVENTS.length > 0) {
    setLocal('events', INITIAL_EVENTS);
  }

  // 8. Garante integridade de coleções secundárias sem sobrescrever registros existentes
  getLocal<Child[]>('children', INITIAL_CHILDREN);
  getLocal<Family[]>('families', INITIAL_FAMILIES);
  getLocal<SmallGroup[]>('small_groups', INITIAL_SMALL_GROUPS);
  getLocal<PastoralAppointment[]>('appointments', INITIAL_APPOINTMENTS);
  getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  getLocal<Visitor[]>('visitors', INITIAL_VISITORS);
  getLocal<FinancialEntry[]>('financial_entries', INITIAL_FINANCIAL_ENTRIES);
  getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  getLocal<MessageTemplate[]>('message_templates', INITIAL_MESSAGE_TEMPLATES);
  getLocal<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
}

// ==========================================
// SERVIÇOS DE IGREJA E MULTI-TENANCY
// ==========================================

export function getChurches(): Church[] {
  return getLocal<Church[]>('churches', INITIAL_CHURCHES);
}

export function getChurchById(id: string): Church | undefined {
  const churches = getChurches();
  return churches.find(c => c.id === id);
}

export function findChurchByLogin(churches: Church[], input: string): Church | undefined {
  if (!input || !input.trim()) return undefined;
  const raw = input.trim().toLowerCase();
  const clean = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  if (!clean) return undefined;

  // 1. Prioridade 1: Correspondência EXATA com loginUser ou slug
  let match = churches.find(c => {
    const u = (c.loginUser || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const s = (c.slug || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return (u && u === clean) || (s && s === clean);
  });
  if (match) return match;

  // 2. Prioridade 2: Correspondência EXATA com o nome normalizado da igreja
  match = churches.find(c => {
    const n = (c.name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    return n && n === clean;
  });
  if (match) return match;

  // 3. Prioridade 3: Correspondência removendo stopwords completas (no, na, de, do, da)
  const stripWords = (t: string) => 
    t.toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '')
     .replace(/\b(no|na|nos|nas|de|do|da|dos|das|em|e|a|o)\b/gi, '')
     .replace(/[^a-z0-9]/g, '');

  const cleanNoWords = stripWords(raw);
  if (cleanNoWords.length >= 4) {
    match = churches.find(c => {
      const uNo = stripWords(c.loginUser || '');
      const sNo = stripWords(c.slug || '');
      const nNo = stripWords(c.name || '');
      return (uNo && uNo.length >= 3 && uNo === cleanNoWords) ||
             (sNo && sNo.length >= 3 && sNo === cleanNoWords) ||
             (nNo && nNo.length >= 4 && nNo === cleanNoWords);
    });
    if (match) return match;
  }

  // 4. Prioridade 4: Prefixo inicial do loginUser ou slug (apenas se digitou pelo menos 4 caracteres)
  if (clean.length >= 4) {
    match = churches.find(c => {
      const u = (c.loginUser || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const s = (c.slug || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return (u && u.length >= clean.length && u.startsWith(clean)) ||
             (s && s.length >= clean.length && s.startsWith(clean));
    });
    if (match) return match;
  }

  return undefined;
}

export function saveChurch(church: Church): void {
  const churches = getChurches();
  const index = churches.findIndex(c => c.id === church.id);
  if (index >= 0) {
    churches[index] = church;
  } else {
    churches.push(church);
  }
  setLocal('churches', churches);
}

export function deleteChurch(id: string): void {
  const churches = getChurches();
  if (churches.length <= 1) return;
  setLocal('churches', churches.filter(c => c.id !== id));

  // Limpa dados associados à igreja excluída
  if (id !== 'church_cba_maceio') {
    const members = getLocal<Member[]>('members', INITIAL_MEMBERS).filter(m => m.churchId !== id);
    setLocal('members', members);
    const children = getLocal<Child[]>('children', []).filter(c => c.churchId !== id);
    setLocal('children', children);
    const schedules = getLocal<Schedule[]>('schedules', []).filter(s => s.churchId !== id);
    setLocal('schedules', schedules);
  }
}

// ==========================================
// MEMBROS
// ==========================================

export function getMembers(churchId: string): Member[] {
  let members = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const hasCbaMembers = members.some(m => m.churchId === 'church_cba_maceio');
  if (churchId === 'church_cba_maceio' && !hasCbaMembers) {
    members = [...members, ...INITIAL_MEMBERS];
    setLocal('members', members);
  }
  return members.filter(m => m.churchId === churchId);
}

export function reloadSpreadsheetMembers(churchId: string): Member[] {
  const current = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const otherChurches = current.filter(m => m.churchId !== churchId);
  const updated = [...otherChurches, ...INITIAL_MEMBERS.filter(m => m.churchId === churchId)];
  setLocal('members', updated);
  return updated.filter(m => m.churchId === churchId);
}

export function saveMember(member: Member): void {
  const members = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = { ...member, updatedAt: new Date().toISOString() };
  } else {
    members.push({ ...member, createdAt: new Date().toISOString() });
  }
  setLocal('members', members);
}

export function deleteMember(id: string): void {
  const members = getLocal<Member[]>('members', INITIAL_MEMBERS);
  setLocal('members', members.filter(m => m.id !== id));
}

// ==========================================
// CRIANÇAS
// ==========================================

export function getChildren(churchId: string): Child[] {
  const children = getLocal<Child[]>('children', INITIAL_CHILDREN);
  return children.filter(c => c.churchId === churchId);
}

export function saveChild(child: Child): void {
  const children = getLocal<Child[]>('children', INITIAL_CHILDREN);
  const index = children.findIndex(c => c.id === child.id);
  if (index >= 0) {
    children[index] = child;
  } else {
    children.push({ ...child, createdAt: new Date().toISOString() });
  }
  setLocal('children', children);
}

export function deleteChild(id: string): void {
  const children = getLocal<Child[]>('children', INITIAL_CHILDREN);
  setLocal('children', children.filter(c => c.id !== id));
}

// ==========================================
// FAMÍLIAS
// ==========================================

export function getFamilies(churchId: string): Family[] {
  const families = getLocal<Family[]>('families', INITIAL_FAMILIES);
  return families.filter(f => f.churchId === churchId);
}

export function saveFamily(family: Family): void {
  const families = getLocal<Family[]>('families', INITIAL_FAMILIES);
  const index = families.findIndex(f => f.id === family.id);
  if (index >= 0) {
    families[index] = family;
  } else {
    families.push({ ...family, createdAt: new Date().toISOString() });
  }
  setLocal('families', families);
}

export function deleteFamily(id: string): void {
  const families = getLocal<Family[]>('families', INITIAL_FAMILIES);
  setLocal('families', families.filter(f => f.id !== id));
}

// ==========================================
// PEQUENOS GRUPOS (PGs)
// ==========================================

export function getSmallGroups(churchId: string): SmallGroup[] {
  const pgs = getLocal<SmallGroup[]>('small_groups', INITIAL_SMALL_GROUPS);
  return pgs.filter(pg => pg.churchId === churchId);
}

export function saveSmallGroup(pg: SmallGroup): void {
  const pgs = getLocal<SmallGroup[]>('small_groups', INITIAL_SMALL_GROUPS);
  const index = pgs.findIndex(p => p.id === pg.id);
  if (index >= 0) {
    pgs[index] = pg;
  } else {
    pgs.push({ ...pg, createdAt: new Date().toISOString() });
  }
  setLocal('small_groups', pgs);
}

export function deleteSmallGroup(id: string): void {
  const pgs = getLocal<SmallGroup[]>('small_groups', INITIAL_SMALL_GROUPS);
  setLocal('small_groups', pgs.filter(p => p.id !== id));
}

// ==========================================
// MINISTÉRIOS E LIDERANÇA
// ==========================================

export function getMinistries(churchId: string): Ministry[] {
  const list = getLocal<Ministry[]>('ministries', INITIAL_MINISTRIES);
  return list.filter(m => m.churchId === churchId);
}

export function saveMinistry(min: Ministry): void {
  const list = getLocal<Ministry[]>('ministries', INITIAL_MINISTRIES);
  const index = list.findIndex(m => m.id === min.id);
  if (index >= 0) {
    list[index] = min;
  } else {
    list.push({ ...min, createdAt: new Date().toISOString() });
  }
  setLocal('ministries', list);
}

export function deleteMinistry(id: string): void {
  const list = getLocal<Ministry[]>('ministries', INITIAL_MINISTRIES);
  setLocal('ministries', list.filter(m => m.id !== id));
}

export function getLeadership(churchId: string): Leadership[] {
  const list = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  return list.filter(l => l.churchId === churchId);
}

export function saveLeadership(lead: Leadership): void {
  const list = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  const index = list.findIndex(l => l.id === lead.id);
  if (index >= 0) {
    list[index] = lead;
  } else {
    list.push({ ...lead, createdAt: new Date().toISOString() });
  }
  setLocal('leadership', list);
}

export function deleteLeadership(id: string): void {
  const list = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  setLocal('leadership', list.filter(l => l.id !== id));
}

// ==========================================
// PROGRAMAÇÃO E EVENTOS
// ==========================================

export function getSchedules(churchId: string): Schedule[] {
  const list = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
  return list.filter(s => s.churchId === churchId);
}

export function saveSchedule(item: Schedule): void {
  const list = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
  const index = list.findIndex(s => s.id === item.id);
  if (index >= 0) {
    list[index] = item;
  } else {
    list.push({ ...item, createdAt: new Date().toISOString() });
  }
  setLocal('schedules', list);
}

export function deleteSchedule(id: string): void {
  const list = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
  setLocal('schedules', list.filter(s => s.id !== id));
}

export function getEvents(churchId: string): ChurchEvent[] {
  const list = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  return list.filter(e => e.churchId === churchId);
}

export function saveEvent(ev: ChurchEvent): void {
  const list = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  const index = list.findIndex(e => e.id === ev.id);
  if (index >= 0) {
    list[index] = ev;
  } else {
    list.push({ ...ev, createdAt: new Date().toISOString() });
  }
  setLocal('events', list);
}

export function deleteEvent(id: string): void {
  const list = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  setLocal('events', list.filter(e => e.id !== id));
}

// ==========================================
// GABINETE, VISITAS E PEDIDOS DE ORAÇÃO
// ==========================================

export function getPastoralAppointments(churchId: string): PastoralAppointment[] {
  const list = getLocal<PastoralAppointment[]>('appointments', INITIAL_APPOINTMENTS);
  return list.filter(a => a.churchId === churchId);
}

export function savePastoralAppointment(appt: PastoralAppointment): void {
  const list = getLocal<PastoralAppointment[]>('appointments', INITIAL_APPOINTMENTS);
  const index = list.findIndex(a => a.id === appt.id);
  if (index >= 0) {
    list[index] = appt;
  } else {
    list.push({ ...appt, createdAt: new Date().toISOString() });
  }
  setLocal('appointments', list);
}

export function deletePastoralAppointment(id: string): void {
  const list = getLocal<PastoralAppointment[]>('appointments', INITIAL_APPOINTMENTS);
  setLocal('appointments', list.filter(a => a.id !== id));
}

export function getPastoralVisits(churchId: string): PastoralVisit[] {
  const list = getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  return list.filter(v => v.churchId === churchId);
}

export function savePastoralVisit(visit: PastoralVisit): void {
  const list = getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  const index = list.findIndex(v => v.id === visit.id);
  if (index >= 0) {
    list[index] = visit;
  } else {
    list.push({ ...visit, createdAt: new Date().toISOString() });
  }
  setLocal('visits', list);
}

export function deletePastoralVisit(id: string): void {
  const list = getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  setLocal('visits', list.filter(v => v.id !== id));
}

export function getPrayerRequests(churchId: string): PrayerRequest[] {
  const list = getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  return list.filter(p => p.churchId === churchId);
}

export function savePrayerRequest(req: PrayerRequest): void {
  const list = getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  const index = list.findIndex(p => p.id === req.id);
  if (index >= 0) {
    list[index] = req;
  } else {
    list.push({ ...req, createdAt: new Date().toISOString() });
  }
  setLocal('prayer_requests', list);
}

export function deletePrayerRequest(id: string): void {
  const list = getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  setLocal('prayer_requests', list.filter(p => p.id !== id));
}

// ==========================================
// VISITANTES
// ==========================================

export function getVisitors(churchId: string): Visitor[] {
  const list = getLocal<Visitor[]>('visitors', INITIAL_VISITORS);
  return list.filter(v => v.churchId === churchId);
}

export function saveVisitor(vis: Visitor): void {
  const list = getLocal<Visitor[]>('visitors', INITIAL_VISITORS);
  const index = list.findIndex(v => v.id === vis.id);
  if (index >= 0) {
    list[index] = vis;
  } else {
    list.push({ ...vis, createdAt: new Date().toISOString() });
  }
  setLocal('visitors', list);
}

export function deleteVisitor(id: string): void {
  const list = getLocal<Visitor[]>('visitors', INITIAL_VISITORS);
  setLocal('visitors', list.filter(v => v.id !== id));
}

// ==========================================
// ESCOLA BÍBLICA DOMINICAL (EBD)
// ==========================================

export function getBibleClasses(churchId: string): BibleClass[] {
  const list = getLocal<BibleClass[]>('bible_classes', INITIAL_BIBLE_CLASSES);
  return list.filter(b => b.churchId === churchId);
}

export function saveBibleClass(bibleClass: BibleClass): void {
  const list = getLocal<BibleClass[]>('bible_classes', INITIAL_BIBLE_CLASSES);
  const index = list.findIndex(b => b.id === bibleClass.id);
  if (index >= 0) {
    list[index] = bibleClass;
  } else {
    list.push({ ...bibleClass, createdAt: new Date().toISOString() });
  }
  setLocal('bible_classes', list);
}

export function deleteBibleClass(id: string): void {
  const list = getLocal<BibleClass[]>('bible_classes', INITIAL_BIBLE_CLASSES);
  setLocal('bible_classes', list.filter(b => b.id !== id));
}

// ==========================================
// FINANCEIRO
// ==========================================

export function getFinancialEntries(churchId: string): FinancialEntry[] {
  const list = getLocal<FinancialEntry[]>('financial_entries', INITIAL_FINANCIAL_ENTRIES);
  return list.filter(f => f.churchId === churchId);
}

export function saveFinancialEntry(entry: FinancialEntry): void {
  const list = getLocal<FinancialEntry[]>('financial_entries', INITIAL_FINANCIAL_ENTRIES);
  const index = list.findIndex(f => f.id === entry.id);
  if (index >= 0) {
    list[index] = entry;
  } else {
    list.push({ ...entry, createdAt: new Date().toISOString() });
  }
  setLocal('financial_entries', list);
}

export function deleteFinancialEntry(id: string): void {
  const list = getLocal<FinancialEntry[]>('financial_entries', INITIAL_FINANCIAL_ENTRIES);
  setLocal('financial_entries', list.filter(f => f.id !== id));
}

export function getFinancialExpenses(churchId: string): FinancialExpense[] {
  const list = getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  return list.filter(f => f.churchId === churchId);
}

export function saveFinancialExpense(expense: FinancialExpense): void {
  const list = getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  const index = list.findIndex(f => f.id === expense.id);
  if (index >= 0) {
    list[index] = expense;
  } else {
    list.push({ ...expense, createdAt: new Date().toISOString() });
  }
  setLocal('financial_expenses', list);
}

export function deleteFinancialExpense(id: string): void {
  const list = getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  setLocal('financial_expenses', list.filter(f => f.id !== id));
}

// ==========================================
// MODELOS DE MENSAGENS DO WHATSAPP
// ==========================================

export function getMessageTemplates(churchId: string): MessageTemplate[] {
  const list = getLocal<MessageTemplate[]>('message_templates', INITIAL_MESSAGE_TEMPLATES);
  return list.filter(t => t.churchId === churchId);
}

export function saveMessageTemplate(tpl: MessageTemplate): void {
  const list = getLocal<MessageTemplate[]>('message_templates', INITIAL_MESSAGE_TEMPLATES);
  const index = list.findIndex(t => t.id === tpl.id);
  if (index >= 0) {
    list[index] = { ...tpl, updatedAt: new Date().toISOString() };
  } else {
    list.push(tpl);
  }
  setLocal('message_templates', list);
}

// ==========================================
// AUDITORIA (LOGS)
// ==========================================

export function getAuditLogs(churchId: string): AuditLog[] {
  const list = getLocal<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  return list.filter(a => a.churchId === churchId);
}

export function logAction(churchId: string, userName: string, userRole: string, action: string, details: string): void {
  const list = getLocal<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  const newLog: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    churchId,
    userName,
    userRole,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  list.unshift(newLog);
  setLocal('audit_logs', list.slice(0, 500)); // Mantém até 500 registros
}

// ==========================================
// CÁLCULOS ESPECIAIS (ANIVERSÁRIOS, BODAS, ETC)
// ==========================================

export interface BirthdayItem {
  id: string;
  name: string;
  photoUrl?: string;
  age: number;
  birthDate: string;
  whatsapp: string;
  phone?: string;
  isToday: boolean;
  daysRemaining: number;
  formattedDate: string;
  isChild?: boolean;
}

export function getBirthdays(churchId: string): { today: BirthdayItem[]; upcoming: BirthdayItem[]; all: BirthdayItem[] } {
  const members = getMembers(churchId);
  const children = getChildren(churchId);
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-indexed
  const currentDay = today.getDate();

  const allPersons: BirthdayItem[] = [];

  // Membros
  members.forEach(m => {
    if (!m.birthDate) return;
    const parts = m.birthDate.split('-');
    if (parts.length < 3) return;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);

    const bDateThisYear = new Date(today.getFullYear(), birthMonth, birthDay);
    if (bDateThisYear.getTime() < new Date(today.getFullYear(), currentMonth, currentDay).getTime()) {
      bDateThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffDays = Math.round((bDateThisYear.getTime() - new Date(today.getFullYear(), currentMonth, currentDay).getTime()) / (1000 * 60 * 60 * 24));
    const age = today.getFullYear() - birthYear;
    const isToday = currentMonth === birthMonth && currentDay === birthDay;

    allPersons.push({
      id: m.id,
      name: m.name,
      photoUrl: m.photoUrl,
      age: isToday ? age : age,
      birthDate: m.birthDate,
      whatsapp: m.whatsapp,
      phone: m.whatsapp || m.phone || '',
      isToday,
      daysRemaining: diffDays,
      formattedDate: `${String(birthDay).padStart(2, '0')}/${String(birthMonth + 1).padStart(2, '0')}`,
      isChild: false
    });
  });

  // Crianças
  children.forEach(c => {
    if (!c.birthDate) return;
    const parts = c.birthDate.split('-');
    if (parts.length < 3) return;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);

    const bDateThisYear = new Date(today.getFullYear(), birthMonth, birthDay);
    if (bDateThisYear.getTime() < new Date(today.getFullYear(), currentMonth, currentDay).getTime()) {
      bDateThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffDays = Math.round((bDateThisYear.getTime() - new Date(today.getFullYear(), currentMonth, currentDay).getTime()) / (1000 * 60 * 60 * 24));
    const age = today.getFullYear() - birthYear;
    const isToday = currentMonth === birthMonth && currentDay === birthDay;

    allPersons.push({
      id: c.id,
      name: c.name,
      photoUrl: c.photoUrl,
      age,
      birthDate: c.birthDate,
      whatsapp: c.guardianWhatsapp || c.guardianPhone,
      phone: c.guardianWhatsapp || c.guardianPhone || '',
      isToday,
      daysRemaining: diffDays,
      formattedDate: `${String(birthDay).padStart(2, '0')}/${String(birthMonth + 1).padStart(2, '0')}`,
      isChild: true
    });
  });

  const todayList = allPersons.filter(p => p.isToday);
  const upcomingList = allPersons
    .filter(p => !p.isToday && p.daysRemaining > 0 && p.daysRemaining <= 7)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const allSorted = [...allPersons].sort((a, b) => {
    const aParts = a.formattedDate.split('/').reverse().join('');
    const bParts = b.formattedDate.split('/').reverse().join('');
    return aParts.localeCompare(bParts);
  });

  return { today: todayList, upcoming: upcomingList, all: allSorted };
}

export interface WeddingAnniversaryItem {
  id: string;
  husbandName: string;
  wifeName: string;
  coupleName: string;
  yearsMarried: number;
  weddingDate: string;
  whatsapp: string;
  isToday: boolean;
  daysRemaining: number;
  formattedDate: string;
}

export function getWeddingAnniversaries(churchId: string): { today: WeddingAnniversaryItem[]; upcoming: WeddingAnniversaryItem[] } {
  const members = getMembers(churchId);
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const pairsSeen = new Set<string>();
  const results: WeddingAnniversaryItem[] = [];

  members.forEach(m => {
    if (m.maritalStatus !== 'Casado(a)' || !m.weddingDate) return;

    // Evita duplicar se ambos estiverem no banco
    const pairKey = [m.id, m.spouseId || m.spouseName || ''].sort().join('_');
    if (pairsSeen.has(pairKey)) return;
    pairsSeen.add(pairKey);

    const parts = m.weddingDate.split('-');
    if (parts.length < 3) return;
    const wedYear = parseInt(parts[0], 10);
    const wedMonth = parseInt(parts[1], 10) - 1;
    const wedDay = parseInt(parts[2], 10);

    const wedDateThisYear = new Date(today.getFullYear(), wedMonth, wedDay);
    if (wedDateThisYear.getTime() < new Date(today.getFullYear(), currentMonth, currentDay).getTime()) {
      wedDateThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffDays = Math.round((wedDateThisYear.getTime() - new Date(today.getFullYear(), currentMonth, currentDay).getTime()) / (1000 * 60 * 60 * 24));
    const yearsMarried = today.getFullYear() - wedYear;
    const isToday = currentMonth === wedMonth && currentDay === wedDay;

    let husband = m.gender === 'M' ? m.name : (m.spouseName || 'Esposo');
    let wife = m.gender === 'F' ? m.name : (m.spouseName || 'Esposa');

    results.push({
      id: m.id,
      husbandName: husband,
      wifeName: wife,
      coupleName: `${husband} e ${wife}`,
      yearsMarried,
      weddingDate: m.weddingDate,
      whatsapp: m.whatsapp,
      isToday,
      daysRemaining: diffDays,
      formattedDate: `${String(wedDay).padStart(2, '0')}/${String(wedMonth + 1).padStart(2, '0')}`
    });
  });

  const todayList = results.filter(r => r.isToday);
  const upcomingList = results
    .filter(r => !r.isToday && r.daysRemaining > 0 && r.daysRemaining <= 15)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return { today: todayList, upcoming: upcomingList };
}

export function formatWhatsAppMessage(template: string, data: Record<string, string | number>): string {
  let text = template;
  for (const [key, value] of Object.entries(data)) {
    text = text.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  return text;
}
