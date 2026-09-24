import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Church } from '../types';
import { saveChurch } from './storage';

export async function syncChurchesFromCloud(): Promise<void> {
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
  } catch (err) {
    console.warn('Sincronizacao em nuvem (modo local ativo):', err);
  }
}

export async function saveChurchToCloud(church: Church): Promise<void> {
  try {
    const churchDoc = doc(db, 'churches', church.id);
    await setDoc(churchDoc, church, { merge: true });
  } catch (err) {
    console.warn('Salvamento em nuvem (modo local ativo):', err);
  }
}

export async function deleteChurchFromCloud(churchId: string): Promise<void> {
  try {
    const churchDoc = doc(db, 'churches', churchId);
    await deleteDoc(churchDoc);
  } catch (err) {
    console.warn('Exclusao em nuvem:', err);
  }
}
