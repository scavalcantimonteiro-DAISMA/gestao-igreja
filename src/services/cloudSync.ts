import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { useEffect } from 'react';
import { db } from '../firebase/config';
import { Church } from '../types';
import { 
  saveChurch, 
  deleteChurch, 
  getChurches, 
  isChurchDeleted, 
  registerCloudSyncHandler,
  getLocal,
  setLocal
} from './storage';
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
  INITIAL_MESSAGE_TEMPLATES
} from './seedData';

/**
 * Remove recursivamente todas as propriedades com valor 'undefined' para que
 * o Firestore setDoc() nunca rejeite o payload.
 */
export function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(item => sanitizeForFirestore(item));

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned;
}

// =========================================================================
// COLEÇÕES OPERACIONAIS SINCRONIZADAS EM TEMPO REAL
// =========================================================================

export interface SyncCollectionConfig {
  name: string;
  key: string;
  initial: any[];
}

export const SYNC_COLLECTIONS: SyncCollectionConfig[] = [
  { name: 'members', key: 'members', initial: INITIAL_MEMBERS },
  { name: 'children', key: 'children', initial: INITIAL_CHILDREN },
  { name: 'families', key: 'families', initial: INITIAL_FAMILIES },
  { name: 'small_groups', key: 'small_groups', initial: INITIAL_SMALL_GROUPS },
  { name: 'ministries', key: 'ministries', initial: INITIAL_MINISTRIES },
  { name: 'leadership', key: 'leadership', initial: INITIAL_LEADERSHIP },
  { name: 'schedules', key: 'schedules', initial: INITIAL_SCHEDULES },
  { name: 'events', key: 'events', initial: INITIAL_EVENTS },
  { name: 'appointments', key: 'appointments', initial: INITIAL_APPOINTMENTS },
  { name: 'visits', key: 'visits', initial: INITIAL_VISITS },
  { name: 'prayer_requests', key: 'prayer_requests', initial: INITIAL_PRAYER_REQUESTS },
  { name: 'visitors', key: 'visitors', initial: INITIAL_VISITORS },
  { name: 'bible_classes', key: 'bible_classes', initial: INITIAL_BIBLE_CLASSES },
  { name: 'financial_entries', key: 'financial_entries', initial: INITIAL_FINANCIAL_ENTRIES },
  { name: 'financial_expenses', key: 'financial_expenses', initial: INITIAL_FINANCIAL_EXPENSES },
  { name: 'fixed_expenses', key: 'fixed_expenses', initial: INITIAL_FIXED_EXPENSES },
  { name: 'message_templates', key: 'message_templates', initial: INITIAL_MESSAGE_TEMPLATES }
];

/**
 * Salva entidade de qualquer módulo na nuvem (Firestore)
 */
export async function saveEntityToCloud(collectionName: string, item: any): Promise<void> {
  try {
    if (!item || !item.id) return;
    const sanitized = sanitizeForFirestore({
      ...item,
      updatedAt: item.updatedAt || new Date().toISOString()
    });
    const itemDoc = doc(db, collectionName, item.id);
    await setDoc(itemDoc, sanitized, { merge: true });
  } catch (err) {
    console.warn(`Falha ao salvar ${collectionName}/${item?.id} na nuvem:`, err);
  }
}

/**
 * Exclui entidade de qualquer módulo na nuvem e registra tombstone
 */
export async function deleteEntityFromCloud(collectionName: string, id: string): Promise<void> {
  try {
    if (!id) return;
    const itemDoc = doc(db, collectionName, id);
    await deleteDoc(itemDoc);

    const tombstoneDoc = doc(db, 'deleted_records', `${collectionName}_${id}`);
    await setDoc(tombstoneDoc, {
      collection: collectionName,
      id,
      deletedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Falha ao excluir ${collectionName}/${id} na nuvem:`, err);
  }
}

// Registra despachador automático conectado ao storage local
registerCloudSyncHandler((action, collectionName, dataOrId) => {
  if (action === 'save') {
    saveEntityToCloud(collectionName, dataOrId);
  } else if (action === 'delete') {
    deleteEntityFromCloud(collectionName, dataOrId);
  }
});

/**
 * Sincronização inicial completa dos dados operacionais da igreja ativa.
 * Faz merge bidirecional: dados existentes na nuvem vêm para o aparelho;
 * dados locais existentes no aparelho sobem para a nuvem.
 */
export async function syncAllChurchDataFromCloud(churchId: string): Promise<void> {
  if (!churchId) return;

  for (const col of SYNC_COLLECTIONS) {
    try {
      const q = query(collection(db, col.name), where('churchId', '==', churchId));
      const snap = await getDocs(q);
      const localAll = getLocal<any[]>(col.key, col.initial);
      const otherChurches = localAll.filter(item => item.churchId !== churchId);
      const thisChurchLocal = localAll.filter(item => item.churchId === churchId);

      if (!snap.empty) {
        // Nuvem tem dados: consolida
        const cloudItems: any[] = [];
        snap.forEach(d => {
          cloudItems.push(d.data());
        });
        const merged = [...otherChurches, ...cloudItems];
        setLocal(col.key, merged, true);
      } else if (thisChurchLocal.length > 0) {
        // Nuvem estava vazia mas temos dados locais: sobe para a nuvem imediatamente
        for (const item of thisChurchLocal) {
          saveEntityToCloud(col.name, item);
        }
      }
    } catch (err) {
      console.warn(`Sincronização inicial pontual de ${col.name} em modo offline:`, err);
    }
  }

  // Notifica o aplicativo da conclusão da sincronização
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gi_data_synced', { detail: { churchId } }));
  }
}

/**
 * Listener em tempo real contínuo via onSnapshot para TODOS os módulos da igreja ativa.
 * Quando qualquer dado mudar no site (PC) ou no app (Celular), o outro aparelho
 * é atualizado instantaneamente em fração de segundo.
 */
export function subscribeToAllChurchData(churchId: string, onUpdate: () => void): () => void {
  if (!churchId) return () => {};

  const unsubs: (() => void)[] = [];

  SYNC_COLLECTIONS.forEach(col => {
    try {
      const q = query(collection(db, col.name), where('churchId', '==', churchId));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          let currentAll = getLocal<any[]>(col.key, col.initial);
          let modified = false;

          // 1. Processa remoções
          snapshot.docChanges().forEach(change => {
            if (change.type === 'removed') {
              const removedId = change.doc.id;
              const prevLen = currentAll.length;
              currentAll = currentAll.filter(item => item.id !== removedId);
              if (currentAll.length !== prevLen) {
                modified = true;
              }
            }
          });

          // 2. Processa adições e modificações
          snapshot.docs.forEach(docSnap => {
            const cloudData = docSnap.data();
            if (cloudData && cloudData.id) {
              const idx = currentAll.findIndex(item => item.id === cloudData.id);
              if (idx >= 0) {
                if (JSON.stringify(currentAll[idx]) !== JSON.stringify(cloudData)) {
                  currentAll[idx] = cloudData;
                  modified = true;
                }
              } else {
                currentAll.push(cloudData);
                modified = true;
              }
            }
          });

          if (modified) {
            setLocal(col.key, [...currentAll], false);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('gi_data_synced', { 
                detail: { collection: col.key, churchId } 
              }));
            }
            onUpdate();
          }
        },
        (err) => {
          console.warn(`Listener de ${col.name} desconectado:`, err);
        }
      );
      unsubs.push(unsub);
    } catch (err) {
      console.warn(`Falha ao registrar listener de ${col.name}:`, err);
    }
  });

  return () => {
    unsubs.forEach(unsub => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
  };
}

/**
 * Hook utilitário para que qualquer tela do sistema recarregue seus dados
 * automaticamente assim que receber atualizações em tempo real do Firestore.
 */
export function useDataSync(refreshFn: () => void, deps: any[] = []): void {
  useEffect(() => {
    const handler = () => {
      refreshFn();
    };
    window.addEventListener('gi_data_synced', handler);
    window.addEventListener('gi_storage_changed', handler);
    return () => {
      window.removeEventListener('gi_data_synced', handler);
      window.removeEventListener('gi_storage_changed', handler);
    };
  }, deps);
}

// =========================================================================
// SINCRONIZAÇÃO DE IGREJAS (MULTI-TENANCY)
// =========================================================================

export async function syncChurchesFromCloud(): Promise<Church[]> {
  try {
    // 0. Remove tombstone acidental da CBA se existir no Firestore
    try {
      await deleteDoc(doc(db, 'deleted_churches', 'church_cba_maceio')).catch(() => {});
    } catch {
      // Ignora
    }

    try {
      const deletedSnap = await getDocs(collection(db, 'deleted_churches'));
      if (!deletedSnap.empty) {
        deletedSnap.forEach(delDoc => {
          if (delDoc.id !== 'church_cba_maceio') {
            deleteChurch(delDoc.id);
          }
        });
      }
    } catch (e) {
      // Ignora erro se coleção estiver vazia
    }

    const churchesCol = collection(db, 'churches');
    const snapshot = await getDocs(churchesCol);
    const cloudIds = new Set<string>();

    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        const cloudData = docSnap.data() as Church;
        if (cloudData && cloudData.id) {
          if (!isChurchDeleted(cloudData.id)) {
            cloudIds.add(cloudData.id);
            saveChurch(cloudData);
          }
        }
      });
    }

    // Garante que a CBA e o Demo estejam sempre presentes tanto localmente quanto na nuvem
    const cbaChurch = INITIAL_CHURCHES.find(c => c.id === 'church_cba_maceio');
    if (cbaChurch) {
      saveChurch(cbaChurch);
      if (!cloudIds.has('church_cba_maceio')) {
        saveChurchToCloud(cbaChurch).catch(console.warn);
      }
    }

    if (cloudIds.size > 0) {
      const localChurches = getChurches();
      localChurches.forEach(localC => {
        if (localC.id !== 'church_demo' && localC.id !== 'church_cba_maceio' && !cloudIds.has(localC.id)) {
          deleteChurch(localC.id);
        }
      });
    }

    return getChurches();
  } catch (err) {
    console.warn('Sincronização inicial em nuvem (modo local ativo):', err);
    return getChurches();
  }
}

export function subscribeToChurches(onUpdate: (churches: Church[]) => void): () => void {
  try {
    const churchesCol = collection(db, 'churches');

    let unsubDeleted: (() => void) | null = null;
    try {
      unsubDeleted = onSnapshot(collection(db, 'deleted_churches'), (delSnap) => {
        if (!delSnap.empty) {
          let changed = false;
          delSnap.forEach(d => {
            const id = d.id;
            if (id === 'church_cba_maceio') return; // NUNCA deletar CBA
            const current = getChurches();
            if (current.some(c => c.id === id)) {
              deleteChurch(id);
              changed = true;
            }
          });
          if (changed) {
            onUpdate(getChurches());
          }
        }
      });
    } catch (e) {
      console.warn('Listener de tombstones não inicializado:', e);
    }

    const unsubscribeChurches = onSnapshot(
      churchesCol,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed' && change.doc.id !== 'church_cba_maceio') {
            deleteChurch(change.doc.id);
          }
        });

        const cloudIds = new Set<string>();
        snapshot.docs.forEach(docSnap => {
          const cloudData = docSnap.data() as Church;
          if (cloudData && cloudData.id && !isChurchDeleted(cloudData.id)) {
            cloudIds.add(cloudData.id);
            saveChurch(cloudData);
          }
        });

        // Garante permanência da CBA
        const cbaChurch = INITIAL_CHURCHES.find(c => c.id === 'church_cba_maceio');
        if (cbaChurch) {
          saveChurch(cbaChurch);
        }

        if (cloudIds.size > 0) {
          const localChurches = getChurches();
          localChurches.forEach(localC => {
            if (localC.id !== 'church_demo' && localC.id !== 'church_cba_maceio' && !cloudIds.has(localC.id)) {
              deleteChurch(localC.id);
            }
          });
        }

        onUpdate(getChurches());
      },
      (err) => {
        console.warn('Listener em tempo real do Firestore desconectado:', err);
      }
    );

    return () => {
      unsubscribeChurches();
      if (unsubDeleted) unsubDeleted();
    };
  } catch (err) {
    console.warn('Falha ao iniciar listener em tempo real:', err);
    return () => {};
  }
}

export async function saveChurchToCloud(church: Church): Promise<{ success: boolean; error?: string }> {
  try {
    const churchWithTimestamp: Church = {
      ...church,
      updatedAt: new Date().toISOString()
    };
    const sanitized = sanitizeForFirestore(churchWithTimestamp);
    const churchDoc = doc(db, 'churches', church.id);
    await setDoc(churchDoc, sanitized, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('Erro ao salvar congregação em nuvem:', err);
    return { success: false, error: err?.message || 'Erro desconhecido' };
  }
}

export async function deleteChurchFromCloud(churchId: string): Promise<void> {
  // Proibição total de exclusão da congregação oficial CBA
  if (churchId === 'church_cba_maceio') {
    console.warn('Tentativa de excluir a Comunidade Batista Acolher da nuvem bloqueada por segurança.');
    return;
  }

  try {
    deleteChurch(churchId);
    const churchDoc = doc(db, 'churches', churchId);
    await deleteDoc(churchDoc);

    const tombstoneDoc = doc(db, 'deleted_churches', churchId);
    await setDoc(tombstoneDoc, {
      id: churchId,
      deletedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Exclusão em nuvem:', err);
  }
}
