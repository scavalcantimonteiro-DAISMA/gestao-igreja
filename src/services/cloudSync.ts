import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Church } from '../types';
import { saveChurch, deleteChurch, getChurches, isChurchDeleted } from './storage';

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

/**
 * Sincronização inicial por busca pontual (one-time fetch)
 * Garante que igrejas excluídas na nuvem sejam apagadas do storage local.
 */
export async function syncChurchesFromCloud(): Promise<Church[]> {
  try {
    // 1. Sincroniza congregações marcadas como excluídas no Firestore
    try {
      const deletedSnap = await getDocs(collection(db, 'deleted_churches'));
      if (!deletedSnap.empty) {
        deletedSnap.forEach(delDoc => {
          deleteChurch(delDoc.id);
        });
      }
    } catch (e) {
      // Ignora erro se coleção de tombstone estiver vazia
    }

    // 2. Busca congregações ativas no Firestore
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

    // 3. Reconciliação: se existem igrejas no Firestore, qualquer congregação
    // local não-demo que não exista mais na nuvem deve ser removida
    if (cloudIds.size > 0) {
      const localChurches = getChurches();
      localChurches.forEach(localC => {
        if (localC.id !== 'church_demo' && !cloudIds.has(localC.id)) {
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

/**
 * Listener em tempo real contínuo via onSnapshot do Firestore:
 * Garante sincronização bidirecional instantânea entre Web (Site) e Mobile (App/PWA).
 * Escuta tanto adições/alterações quanto remoções ('removed') e tombstones.
 */
export function subscribeToChurches(onUpdate: (churches: Church[]) => void): () => void {
  try {
    const churchesCol = collection(db, 'churches');

    // Listener de exclusões na nuvem (tombstones)
    let unsubDeleted: (() => void) | null = null;
    try {
      unsubDeleted = onSnapshot(collection(db, 'deleted_churches'), (delSnap) => {
        if (!delSnap.empty) {
          let changed = false;
          delSnap.forEach(d => {
            const id = d.id;
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
        // 1. Processa remoções explícitas de documentos
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed') {
            deleteChurch(change.doc.id);
          }
        });

        // 2. Processa congregações ativas recebidas
        const cloudIds = new Set<string>();
        snapshot.docs.forEach(docSnap => {
          const cloudData = docSnap.data() as Church;
          if (cloudData && cloudData.id && !isChurchDeleted(cloudData.id)) {
            cloudIds.add(cloudData.id);
            saveChurch(cloudData);
          }
        });

        // 3. Reconcilia congregações ausentes na nuvem (exceto demo)
        if (cloudIds.size > 0) {
          const localChurches = getChurches();
          localChurches.forEach(localC => {
            if (localC.id !== 'church_demo' && !cloudIds.has(localC.id)) {
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

/**
 * Salva e propaga alterações de uma congregação no Firestore
 */
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

/**
 * Exclui congregação no Firestore e registra tombstone para sincronização
 * em todos os navegadores, apps e PWAs conectados.
 */
export async function deleteChurchFromCloud(churchId: string): Promise<void> {
  try {
    // 1. Remove localmente de imediato
    deleteChurch(churchId);

    // 2. Remove da coleção 'churches' no Firestore
    const churchDoc = doc(db, 'churches', churchId);
    await deleteDoc(churchDoc);

    // 3. Registra tombstone na coleção 'deleted_churches'
    const tombstoneDoc = doc(db, 'deleted_churches', churchId);
    await setDoc(tombstoneDoc, {
      id: churchId,
      deletedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Exclusão em nuvem:', err);
  }
}
