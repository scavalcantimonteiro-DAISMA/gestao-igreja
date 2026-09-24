import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Church } from '../types';
import { saveChurch, getChurches } from './storage';

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
 */
export async function syncChurchesFromCloud(): Promise<Church[]> {
  try {
    const churchesCol = collection(db, 'churches');
    const snapshot = await getDocs(churchesCol);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        const cloudData = docSnap.data() as Church;
        if (cloudData && cloudData.id) {
          saveChurch(cloudData);
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
 */
export function subscribeToChurches(onUpdate: (churches: Church[]) => void): () => void {
  try {
    const churchesCol = collection(db, 'churches');
    const unsubscribe = onSnapshot(
      churchesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach(docSnap => {
            const cloudData = docSnap.data() as Church;
            if (cloudData && cloudData.id) {
              saveChurch(cloudData);
            }
          });
          onUpdate(getChurches());
        }
      },
      (err) => {
        console.warn('Listener em tempo real do Firestore desconectado:', err);
      }
    );
    return unsubscribe;
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
 * Exclui congregação no Firestore
 */
export async function deleteChurchFromCloud(churchId: string): Promise<void> {
  try {
    const churchDoc = doc(db, 'churches', churchId);
    await deleteDoc(churchDoc);
  } catch (err) {
    console.warn('Exclusão em nuvem:', err);
  }
}
