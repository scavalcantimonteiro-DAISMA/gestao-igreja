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
  BaptismRecord,
  FinancialEntry, 
  FinancialExpense, 
  FixedExpense, 
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
  INITIAL_FIXED_EXPENSES, 
  INITIAL_MESSAGE_TEMPLATES, 
  INITIAL_AUDIT_LOGS 
} from './seedData';

// Prefixo para chaves de armazenamento local
const PREFIX = 'gi_';

export type CloudSyncHandler = (action: 'save' | 'delete', collection: string, dataOrId: any) => void;
let cloudSyncHandler: CloudSyncHandler | null = null;

export function registerCloudSyncHandler(handler: CloudSyncHandler): void {
  cloudSyncHandler = handler;
}

export function notifyCloudSync(action: 'save' | 'delete', collection: string, dataOrId: any): void {
  if (cloudSyncHandler) {
    try {
      cloudSyncHandler(action, collection, dataOrId);
    } catch (e) {
      console.warn(`Falha ao despachar sincronização em nuvem (${action} em ${collection}):`, e);
    }
  }
}

export function getLocal<T>(key: string, defaultValue: T): T {
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

export function setLocal<T>(key: string, value: T, silent = false): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    if (!silent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gi_storage_changed', { detail: { key, value } }));
    }
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

export function markChurchDeleted(id: string): void {
  const deleted = getLocal<string[]>('gi_deleted_church_ids', []);
  if (!deleted.includes(id)) {
    deleted.push(id);
    setLocal('gi_deleted_church_ids', deleted);
  }
}

export function isChurchDeleted(id: string): boolean {
  const deleted = getLocal<string[]>('gi_deleted_church_ids', []);
  return deleted.includes(id);
}

// Inicializa dados de forma segura, garantindo dados demonstrativos fictícios e a integridade da congregação oficial CBA
export function initializeStorage(): void {
  // 0. Restauração emergencial e definitiva da congregação oficial Comunidade Batista Acolher
  const RESTORE_CBA_KEY = 'gi_restored_cba_maceio_v1';
  if (typeof localStorage !== 'undefined') {
    // Remove church_cba_maceio da lista de deletados se foi inserida por engano
    const deleted = getLocal<string[]>('gi_deleted_church_ids', []);
    if (deleted.includes('church_cba_maceio')) {
      setLocal('gi_deleted_church_ids', deleted.filter(id => id !== 'church_cba_maceio'));
    }

    if (localStorage.getItem(RESTORE_CBA_KEY) !== 'true') {
      // 1. Garante a igreja CBA na lista de igrejas
      const currentChurches = getLocal<Church[]>('churches', []);
      const cbaChurch = INITIAL_CHURCHES.find(c => c.id === 'church_cba_maceio');
      if (cbaChurch && !currentChurches.some(c => c.id === 'church_cba_maceio')) {
        currentChurches.push(cbaChurch);
        setLocal('churches', currentChurches);
      }

      // 2. Garante os 140 membros da CBA
      const currentMembers = getLocal<Member[]>('members', []);
      const cbaInitMembers = INITIAL_MEMBERS.filter(m => m.churchId === 'church_cba_maceio');
      const existingCbaIds = new Set(currentMembers.filter(m => m.churchId === 'church_cba_maceio').map(m => m.id));
      const missingMembers = cbaInitMembers.filter(m => !existingCbaIds.has(m.id));
      if (missingMembers.length > 0) {
        setLocal('members', [...currentMembers, ...missingMembers]);
      }

      // 3. Garante ministérios da CBA
      const currentMin = getLocal<Ministry[]>('ministries', []);
      const cbaMin = INITIAL_MINISTRIES.filter(m => m.churchId === 'church_cba_maceio');
      const existingMinIds = new Set(currentMin.map(m => m.id));
      const missingMin = cbaMin.filter(m => !existingMinIds.has(m.id));
      if (missingMin.length > 0) {
        setLocal('ministries', [...currentMin, ...missingMin]);
      }

      // 4. Garante liderança da CBA
      const currentLead = getLocal<Leadership[]>('leadership', []);
      const cbaLead = INITIAL_LEADERSHIP.filter(l => l.churchId === 'church_cba_maceio');
      const existingLeadIds = new Set(currentLead.map(l => l.id));
      const missingLead = cbaLead.filter(l => !existingLeadIds.has(l.id));
      if (missingLead.length > 0) {
        setLocal('leadership', [...currentLead, ...missingLead]);
      }

      // 5. Garante escalas e eventos da CBA
      const currentSched = getLocal<Schedule[]>('schedules', []);
      const cbaSched = INITIAL_SCHEDULES.filter(s => s.churchId === 'church_cba_maceio');
      const existingSchedIds = new Set(currentSched.map(s => s.id));
      const missingSched = cbaSched.filter(s => !existingSchedIds.has(s.id));
      if (missingSched.length > 0) {
        setLocal('schedules', [...currentSched, ...missingSched]);
      }

      const currentEvt = getLocal<ChurchEvent[]>('events', []);
      const cbaEvt = INITIAL_EVENTS.filter(e => e.churchId === 'church_cba_maceio');
      const existingEvtIds = new Set(currentEvt.map(e => e.id));
      const missingEvt = cbaEvt.filter(e => !existingEvtIds.has(e.id));
      if (missingEvt.length > 0) {
        setLocal('events', [...currentEvt, ...missingEvt]);
      }

      localStorage.setItem(RESTORE_CBA_KEY, 'true');
    }

    // 0.1 Atualização e autocura de caracteres acentuados (UTF-8) para a congregação oficial CBA
    const FIX_ACCENTS_KEY = 'gi_fixed_accents_utf8_v5';
    if (localStorage.getItem(FIX_ACCENTS_KEY) !== 'true') {
      // 1. Membros
      const storedMembers = getLocal<Member[]>('members', []);
      const cbaCleanMap = new Map(INITIAL_MEMBERS.filter(m => m.churchId === 'church_cba_maceio').map(m => [m.id, m]));
      const updatedMembers = storedMembers.map(m => {
        if (m.churchId === 'church_cba_maceio' && cbaCleanMap.has(m.id)) {
          return { ...m, ...cbaCleanMap.get(m.id) };
        }
        return m;
      });
      const currentCbaIds = new Set(updatedMembers.filter(m => m.churchId === 'church_cba_maceio').map(m => m.id));
      cbaCleanMap.forEach((cleanMember, id) => {
        if (!currentCbaIds.has(id)) {
          updatedMembers.push(cleanMember);
        }
      });
      setLocal('members', updatedMembers);

      // 2. Ministérios
      const storedMin = getLocal<Ministry[]>('ministries', []);
      const cleanMinMap = new Map(INITIAL_MINISTRIES.filter(m => m.churchId === 'church_cba_maceio').map(m => [m.id, m]));
      const updatedMin = storedMin.map(m => {
        if (m.churchId === 'church_cba_maceio' && cleanMinMap.has(m.id)) {
          return { ...m, ...cleanMinMap.get(m.id) };
        }
        return m;
      });
      setLocal('ministries', updatedMin);

      // 3. Liderança
      const storedLead = getLocal<Leadership[]>('leadership', []);
      const cleanLeadMap = new Map(INITIAL_LEADERSHIP.filter(l => l.churchId === 'church_cba_maceio').map(l => [l.id, l]));
      const updatedLead = storedLead.map(l => {
        if (l.churchId === 'church_cba_maceio' && cleanLeadMap.has(l.id)) {
          return { ...l, ...cleanLeadMap.get(l.id) };
        }
        return l;
      });
      setLocal('leadership', updatedLead);

      // 4. Escalas / Programação
      const storedSched = getLocal<Schedule[]>('schedules', []);
      const cleanSchedMap = new Map(INITIAL_SCHEDULES.filter(s => s.churchId === 'church_cba_maceio').map(s => [s.id, s]));
      const updatedSched = storedSched.map(s => {
        if (s.churchId === 'church_cba_maceio' && cleanSchedMap.has(s.id)) {
          return { ...s, ...cleanSchedMap.get(s.id) };
        }
        return s;
      });
      setLocal('schedules', updatedSched);

      // 5. Eventos
      const storedEvt = getLocal<ChurchEvent[]>('events', []);
      const cleanEvtMap = new Map(INITIAL_EVENTS.filter(e => e.churchId === 'church_cba_maceio').map(e => [e.id, e]));
      const updatedEvt = storedEvt.map(e => {
        if (e.churchId === 'church_cba_maceio' && cleanEvtMap.has(e.id)) {
          return { ...e, ...cleanEvtMap.get(e.id) };
        }
        return e;
      });
      setLocal('events', updatedEvt);

      localStorage.setItem(FIX_ACCENTS_KEY, 'true');
    }
  }

  // 1. Cria backup instantâneo de segurança do estado atual
  createAutoSafetyBackup();

  // 2. Congregações: Garante que congregações excluídas NUNCA sejam recriadas (exceto CBA que é protegida)
  const deletedIds = getLocal<string[]>('gi_deleted_church_ids', []).filter(id => id !== 'church_cba_maceio');
  const storedChurches = getLocal<Church[]>('churches', INITIAL_CHURCHES).filter(c => !deletedIds.includes(c.id));

  INITIAL_CHURCHES.forEach(initChurch => {
    if (deletedIds.includes(initChurch.id)) return;
    const existingIndex = storedChurches.findIndex(c => 
      c.id === initChurch.id || 
      (c.loginUser && c.loginUser.toLowerCase() === initChurch.loginUser.toLowerCase()) ||
      (c.slug && c.slug.toLowerCase() === initChurch.slug.toLowerCase())
    );
    if (existingIndex >= 0) {
      const existing = storedChurches[existingIndex];
      if (!existing.pastorName && initChurch.pastorName) existing.pastorName = initChurch.pastorName;
    } else {
      storedChurches.push(initChurch);
    }
  });
  setLocal('churches', storedChurches);

  // 3. Membros: Garante membros tanto da CBA (140 membros) quanto demonstrativos
  const storedMembers = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const hasDemoMembers = storedMembers.some(m => m.churchId === 'church_demo');
  const hasCbaMembers = storedMembers.some(m => m.churchId === 'church_cba_maceio');
  let updatedMembers = [...storedMembers];
  if (!hasDemoMembers) {
    const demoMembers = INITIAL_MEMBERS.filter(m => m.churchId === 'church_demo');
    updatedMembers = [...updatedMembers, ...demoMembers];
  }
  if (!hasCbaMembers) {
    const cbaMembers = INITIAL_MEMBERS.filter(m => m.churchId === 'church_cba_maceio');
    updatedMembers = [...updatedMembers, ...cbaMembers];
  }
  if (updatedMembers.length !== storedMembers.length) {
    setLocal('members', updatedMembers);
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

  // 6. Programação / Escalas
  const storedSchedules = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
  if (storedSchedules.length === 0 && INITIAL_SCHEDULES.length > 0) {
    setLocal('schedules', INITIAL_SCHEDULES);
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
  // Proteção vital: a congregação Comunidade Batista Acolher é permanente e nunca pode ser excluída
  if (id === 'church_cba_maceio') {
    console.warn('Tentativa de excluir a Comunidade Batista Acolher bloqueada por segurança do sistema.');
    return;
  }

  // 1. Registra tombstone para nunca mais ressuscitar em nenhum dispositivo
  markChurchDeleted(id);

  // 2. Remove da lista de igrejas
  const churches = getChurches();
  setLocal('churches', churches.filter(c => c.id !== id));

  // 3. Limpa todos os dados associados à igreja excluída
  const members = getLocal<Member[]>('members', []).filter(m => m.churchId !== id);
  setLocal('members', members);
  const children = getLocal<Child[]>('children', []).filter(c => c.churchId !== id);
  setLocal('children', children);
  const families = getLocal<Family[]>('families', []).filter(f => f.churchId !== id);
  setLocal('families', families);
  const smallGroups = getLocal<SmallGroup[]>('small_groups', []).filter(g => g.churchId !== id);
  setLocal('small_groups', smallGroups);
  const ministries = getLocal<Ministry[]>('ministries', []).filter(m => m.churchId !== id);
  setLocal('ministries', ministries);
  const leadership = getLocal<Leadership[]>('leadership', []).filter(l => l.churchId !== id);
  setLocal('leadership', leadership);
  const schedules = getLocal<Schedule[]>('schedules', []).filter(s => s.churchId !== id);
  setLocal('schedules', schedules);
  const events = getLocal<ChurchEvent[]>('events', []).filter(e => e.churchId !== id);
  setLocal('events', events);
  const appointments = getLocal<PastoralAppointment[]>('appointments', []).filter(a => a.churchId !== id);
  setLocal('appointments', appointments);
  const visits = getLocal<PastoralVisit[]>('visits', []).filter(v => v.churchId !== id);
  setLocal('visits', visits);
  const prayerRequests = getLocal<PrayerRequest[]>('prayer_requests', []).filter(p => p.churchId !== id);
  setLocal('prayer_requests', prayerRequests);
  const visitors = getLocal<Visitor[]>('visitors', []).filter(v => v.churchId !== id);
  setLocal('visitors', visitors);
  const bibleClasses = getLocal<BibleClass[]>('bible_classes', []).filter(b => b.churchId !== id);
  setLocal('bible_classes', bibleClasses);
  const financialEntries = getLocal<FinancialEntry[]>('financial_entries', []).filter(f => f.churchId !== id);
  setLocal('financial_entries', financialEntries);
  const financialExpenses = getLocal<FinancialExpense[]>('financial_expenses', []).filter(f => f.churchId !== id);
  setLocal('financial_expenses', financialExpenses);
  const fixedExpenses = getLocal<FixedExpense[]>('fixed_expenses', []).filter(f => f.churchId !== id);
  setLocal('fixed_expenses', fixedExpenses);
  const messageTemplates = getLocal<MessageTemplate[]>('message_templates', []).filter(t => t.churchId !== id);
  setLocal('message_templates', messageTemplates);
}

// ==========================================
// MEMBROS
// ==========================================

export function getMembers(churchId: string): Member[] {
  let members = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const hasDemoMembers = members.some(m => m.churchId === 'church_demo');
  if (churchId === 'church_demo' && !hasDemoMembers) {
    members = [...members, ...INITIAL_MEMBERS];
    setLocal('members', members);
  }
  const filtered = members.filter(m => m.churchId === churchId);
  return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
}

export function reloadSpreadsheetMembers(churchId: string): Member[] {
  const current = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const otherChurches = current.filter(m => m.churchId !== churchId);
  const updated = [...otherChurches, ...INITIAL_MEMBERS.filter(m => m.churchId === churchId)];
  setLocal('members', updated);
  return updated
    .filter(m => m.churchId === churchId)
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
}

export function saveMember(member: Member): void {
  const members = getLocal<Member[]>('members', INITIAL_MEMBERS);
  const index = members.findIndex(m => m.id === member.id);
  const updated = index >= 0 
    ? { ...member, updatedAt: new Date().toISOString() }
    : { ...member, createdAt: member.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    members[index] = updated;
  } else {
    members.push(updated);
  }
  members.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  setLocal('members', members);
  notifyCloudSync('save', 'members', updated);
}

export function deleteMember(id: string): void {
  const members = getLocal<Member[]>('members', INITIAL_MEMBERS);
  setLocal('members', members.filter(m => m.id !== id));
  notifyCloudSync('delete', 'members', id);
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
  const updated = index >= 0 
    ? { ...child, updatedAt: new Date().toISOString() }
    : { ...child, createdAt: child.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    children[index] = updated;
  } else {
    children.push(updated);
  }
  setLocal('children', children);
  notifyCloudSync('save', 'children', updated);
}

export function deleteChild(id: string): void {
  const children = getLocal<Child[]>('children', INITIAL_CHILDREN);
  setLocal('children', children.filter(c => c.id !== id));
  notifyCloudSync('delete', 'children', id);
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
  const updated = index >= 0 
    ? { ...family, updatedAt: new Date().toISOString() }
    : { ...family, createdAt: family.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    families[index] = updated;
  } else {
    families.push(updated);
  }
  setLocal('families', families);
  notifyCloudSync('save', 'families', updated);
}

export function deleteFamily(id: string): void {
  const families = getLocal<Family[]>('families', INITIAL_FAMILIES);
  setLocal('families', families.filter(f => f.id !== id));
  notifyCloudSync('delete', 'families', id);
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
  const updated = index >= 0 
    ? { ...pg, updatedAt: new Date().toISOString() }
    : { ...pg, createdAt: pg.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    pgs[index] = updated;
  } else {
    pgs.push(updated);
  }
  setLocal('small_groups', pgs);
  notifyCloudSync('save', 'small_groups', updated);
}

export function deleteSmallGroup(id: string): void {
  const pgs = getLocal<SmallGroup[]>('small_groups', INITIAL_SMALL_GROUPS);
  setLocal('small_groups', pgs.filter(p => p.id !== id));
  notifyCloudSync('delete', 'small_groups', id);
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
  const updated = index >= 0 
    ? { ...min, updatedAt: new Date().toISOString() }
    : { ...min, createdAt: min.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('ministries', list);
  notifyCloudSync('save', 'ministries', updated);
}

export function deleteMinistry(id: string): void {
  const list = getLocal<Ministry[]>('ministries', INITIAL_MINISTRIES);
  setLocal('ministries', list.filter(m => m.id !== id));
  notifyCloudSync('delete', 'ministries', id);
}

export function getLeadership(churchId: string): Leadership[] {
  const list = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  return list.filter(l => l.churchId === churchId);
}

export function saveLeadership(lead: Leadership): void {
  const list = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  const index = list.findIndex(l => l.id === lead.id);
  const updated = index >= 0 
    ? { ...lead, updatedAt: new Date().toISOString() }
    : { ...lead, createdAt: lead.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('leadership', list);
  notifyCloudSync('save', 'leadership', updated);
}

export function deleteLeadership(id: string): void {
  const list = getLocal<Leadership[]>('leadership', INITIAL_LEADERSHIP);
  setLocal('leadership', list.filter(l => l.id !== id));
  notifyCloudSync('delete', 'leadership', id);
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
  const updated = index >= 0 
    ? { ...item, updatedAt: new Date().toISOString() }
    : { ...item, createdAt: item.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('schedules', list);
  notifyCloudSync('save', 'schedules', updated);
}

export function deleteSchedule(id: string): void {
  const list = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
  setLocal('schedules', list.filter(s => s.id !== id));
  notifyCloudSync('delete', 'schedules', id);
}

export function getEvents(churchId: string): ChurchEvent[] {
  const list = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  return list.filter(e => e.churchId === churchId);
}

export function saveEvent(ev: ChurchEvent): void {
  const list = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  const index = list.findIndex(e => e.id === ev.id);
  const updated = index >= 0 
    ? { ...ev, updatedAt: new Date().toISOString() }
    : { ...ev, createdAt: ev.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('events', list);
  notifyCloudSync('save', 'events', updated);
}

export function deleteEvent(id: string): void {
  const list = getLocal<ChurchEvent[]>('events', INITIAL_EVENTS);
  setLocal('events', list.filter(e => e.id !== id));
  notifyCloudSync('delete', 'events', id);
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
  const updated = index >= 0 
    ? { ...appt, updatedAt: new Date().toISOString() }
    : { ...appt, createdAt: appt.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('appointments', list);
  notifyCloudSync('save', 'appointments', updated);
}

export function deletePastoralAppointment(id: string): void {
  const list = getLocal<PastoralAppointment[]>('appointments', INITIAL_APPOINTMENTS);
  setLocal('appointments', list.filter(a => a.id !== id));
  notifyCloudSync('delete', 'appointments', id);
}

export function getPastoralVisits(churchId: string): PastoralVisit[] {
  const list = getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  return list.filter(v => v.churchId === churchId);
}

export function savePastoralVisit(visit: PastoralVisit): void {
  const list = getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  const index = list.findIndex(v => v.id === visit.id);
  const updated = index >= 0 
    ? { ...visit, updatedAt: new Date().toISOString() }
    : { ...visit, createdAt: visit.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('visits', list);
  notifyCloudSync('save', 'visits', updated);
}

export function deletePastoralVisit(id: string): void {
  const list = getLocal<PastoralVisit[]>('visits', INITIAL_VISITS);
  setLocal('visits', list.filter(v => v.id !== id));
  notifyCloudSync('delete', 'visits', id);
}

export function getPrayerRequests(churchId: string): PrayerRequest[] {
  const list = getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  return list.filter(p => p.churchId === churchId);
}

export function savePrayerRequest(req: PrayerRequest): void {
  const list = getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  const index = list.findIndex(p => p.id === req.id);
  const updated = index >= 0 
    ? { ...req, updatedAt: new Date().toISOString() }
    : { ...req, createdAt: req.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('prayer_requests', list);
  notifyCloudSync('save', 'prayer_requests', updated);
}

export function deletePrayerRequest(id: string): void {
  const list = getLocal<PrayerRequest[]>('prayer_requests', INITIAL_PRAYER_REQUESTS);
  setLocal('prayer_requests', list.filter(p => p.id !== id));
  notifyCloudSync('delete', 'prayer_requests', id);
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
  const updated = index >= 0 
    ? { ...vis, updatedAt: new Date().toISOString() }
    : { ...vis, createdAt: vis.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('visitors', list);
  notifyCloudSync('save', 'visitors', updated);
}

export function deleteVisitor(id: string): void {
  const list = getLocal<Visitor[]>('visitors', INITIAL_VISITORS);
  setLocal('visitors', list.filter(v => v.id !== id));
  notifyCloudSync('delete', 'visitors', id);
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
  const updated = index >= 0 
    ? { ...bibleClass, updatedAt: new Date().toISOString() }
    : { ...bibleClass, createdAt: bibleClass.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('bible_classes', list);
  notifyCloudSync('save', 'bible_classes', updated);
}

export function deleteBibleClass(id: string): void {
  const list = getLocal<BibleClass[]>('bible_classes', INITIAL_BIBLE_CLASSES);
  setLocal('bible_classes', list.filter(b => b.id !== id));
  notifyCloudSync('delete', 'bible_classes', id);
}

// ==========================================
// BATISMOS
// ==========================================

export function getBaptismRecords(churchId: string): BaptismRecord[] {
  const list = getLocal<BaptismRecord[]>('baptism_records', []);
  return list.filter(b => b.churchId === churchId);
}

export function saveBaptismRecord(record: BaptismRecord): void {
  const list = getLocal<BaptismRecord[]>('baptism_records', []);
  const index = list.findIndex(b => b.id === record.id);
  const updated = index >= 0 
    ? { ...record }
    : { ...record, createdAt: record.createdAt || new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('baptism_records', list);
  notifyCloudSync('save', 'baptism_records', updated);
}

export function deleteBaptismRecord(id: string): void {
  const list = getLocal<BaptismRecord[]>('baptism_records', []);
  setLocal('baptism_records', list.filter(b => b.id !== id));
  notifyCloudSync('delete', 'baptism_records', id);
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
  const updated = index >= 0 
    ? { ...entry, updatedAt: new Date().toISOString() }
    : { ...entry, createdAt: entry.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('financial_entries', list);
  notifyCloudSync('save', 'financial_entries', updated);
}

export function deleteFinancialEntry(id: string): void {
  const list = getLocal<FinancialEntry[]>('financial_entries', INITIAL_FINANCIAL_ENTRIES);
  setLocal('financial_entries', list.filter(f => f.id !== id));
  notifyCloudSync('delete', 'financial_entries', id);
}

export function getFinancialExpenses(churchId: string): FinancialExpense[] {
  const list = getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  return list.filter(f => f.churchId === churchId);
}

export function saveFinancialExpense(expense: FinancialExpense): void {
  const list = getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  const index = list.findIndex(f => f.id === expense.id);
  const updated = index >= 0 
    ? { ...expense, updatedAt: new Date().toISOString() }
    : { ...expense, createdAt: expense.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('financial_expenses', list);
  notifyCloudSync('save', 'financial_expenses', updated);
}

export function deleteFinancialExpense(id: string): void {
  const list = getLocal<FinancialExpense[]>('financial_expenses', INITIAL_FINANCIAL_EXPENSES);
  setLocal('financial_expenses', list.filter(f => f.id !== id));
  notifyCloudSync('delete', 'financial_expenses', id);
}

export function getFixedExpenses(churchId: string): FixedExpense[] {
  const list = getLocal<FixedExpense[]>('fixed_expenses', INITIAL_FIXED_EXPENSES);
  return list.filter(f => f.churchId === churchId);
}

export function saveFixedExpense(expense: FixedExpense): void {
  const list = getLocal<FixedExpense[]>('fixed_expenses', INITIAL_FIXED_EXPENSES);
  const index = list.findIndex(f => f.id === expense.id);
  const updated = index >= 0 
    ? { ...expense, updatedAt: new Date().toISOString() }
    : { ...expense, createdAt: expense.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('fixed_expenses', list);
  notifyCloudSync('save', 'fixed_expenses', updated);
}

export function deleteFixedExpense(id: string): void {
  const list = getLocal<FixedExpense[]>('fixed_expenses', INITIAL_FIXED_EXPENSES);
  setLocal('fixed_expenses', list.filter(f => f.id !== id));
  notifyCloudSync('delete', 'fixed_expenses', id);
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
  const updated = index >= 0 
    ? { ...tpl, updatedAt: new Date().toISOString() }
    : { ...tpl, createdAt: (tpl as any).createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (index >= 0) {
    list[index] = updated;
  } else {
    list.push(updated);
  }
  setLocal('message_templates', list);
  notifyCloudSync('save', 'message_templates', updated);
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
  const families = getFamilies(churchId);
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

    const nameKey = [m.name.trim().toLowerCase(), (m.spouseName || '').trim().toLowerCase()].sort().join('_');
    pairsSeen.add(nameKey);

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
    const yearsMarried = Math.max(1, today.getFullYear() - wedYear);
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

  // Também inclui celebrações registradas na aba Famílias & Casamentos
  families.forEach(f => {
    if (!f.weddingDate) return;

    const husband = f.fatherName?.trim() || 'Esposo';
    const wife = f.motherName?.trim() || 'Esposa';
    const coupleName = f.fatherName && f.motherName ? `${husband} e ${wife}` : f.familyName;

    const nameKey = [husband.toLowerCase(), wife.toLowerCase()].sort().join('_');
    if (pairsSeen.has(f.id) || (f.fatherName && f.motherName && pairsSeen.has(nameKey))) return;
    pairsSeen.add(f.id);
    pairsSeen.add(nameKey);

    const parts = f.weddingDate.split('-');
    if (parts.length < 3) return;
    const wedYear = parseInt(parts[0], 10);
    const wedMonth = parseInt(parts[1], 10) - 1;
    const wedDay = parseInt(parts[2], 10);

    const wedDateThisYear = new Date(today.getFullYear(), wedMonth, wedDay);
    if (wedDateThisYear.getTime() < new Date(today.getFullYear(), currentMonth, currentDay).getTime()) {
      wedDateThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffDays = Math.round((wedDateThisYear.getTime() - new Date(today.getFullYear(), currentMonth, currentDay).getTime()) / (1000 * 60 * 60 * 24));
    const yearsMarried = Math.max(1, today.getFullYear() - wedYear);
    const isToday = currentMonth === wedMonth && currentDay === wedDay;

    results.push({
      id: f.id,
      husbandName: husband,
      wifeName: wife,
      coupleName,
      yearsMarried,
      weddingDate: f.weddingDate,
      whatsapp: f.whatsapp || f.phone || '',
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
