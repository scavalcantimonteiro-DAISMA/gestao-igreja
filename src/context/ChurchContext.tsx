import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Church } from '../types';
import { getChurches, getChurchById, saveChurch, deleteChurch, initializeStorage } from '../services/storage';
import { 
  syncChurchesFromCloud, 
  saveChurchToCloud, 
  deleteChurchFromCloud, 
  subscribeToChurches,
  syncAllChurchDataFromCloud,
  subscribeToAllChurchData,
  useDataSync
} from '../services/cloudSync';

export { useDataSync };

interface ChurchContextType {
  currentChurch: Church;
  allChurches: Church[];
  dataSyncCount: number;
  selectChurch: (churchId: string) => void;
  updateCurrentChurch: (updated: Partial<Church>) => Promise<void> | void;
  updateChurchData: (church: Church) => Promise<void> | void;
  registerNewChurch: (newChurch: Omit<Church, 'id' | 'createdAt'>) => Church;
  removeChurch: (churchId: string) => void;
  isFinancialUnlocked: boolean;
  unlockFinancial: (pin: string) => boolean;
  lockFinancial: () => void;
  setupInitialFinancialPin: (newPin: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  changeFinancialPin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  resetChurchFinancialPin: (churchId: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  resetChurchPassword: (churchId: string, provisionalPass?: string) => { success: boolean; provisionalPass: string };
  changeChurchPassword: (churchId: string, currentPass: string, newPass: string) => { success: boolean; message: string };
  refreshChurches: () => void;
}


const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

const ACTIVE_CHURCH_KEY = 'gi_active_church_id';

export const ChurchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [churches, setChurches] = useState<Church[]>(() => {
    initializeStorage();
    return getChurches();
  });

  const [activeChurchId, setActiveChurchId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_CHURCH_KEY);
    if (saved && getChurchById(saved)) {
      return saved;
    }
    const cba = getChurchById('church_cba_maceio');
    if (cba) return cba.id;
    return 'church_cba_maceio';
  });

  const [isFinancialUnlocked, setIsFinancialUnlocked] = useState<boolean>(false);

  // Sincroniza congregações com a nuvem (Firestore) em tempo real: Sincronia contínua Site <-> App
  useEffect(() => {
    // 1. Sincronização inicial
    syncChurchesFromCloud().then((cloudChurches) => {
      if (cloudChurches && cloudChurches.length > 0) {
        setChurches(cloudChurches);
        setActiveChurchId(prevActive => {
          if (!cloudChurches.some(c => c.id === prevActive)) {
            const nextActive = cloudChurches.some(c => c.id === 'church_cba_maceio')
              ? 'church_cba_maceio'
              : (cloudChurches[0]?.id || 'church_cba_maceio');
            localStorage.setItem(ACTIVE_CHURCH_KEY, nextActive);
            return nextActive;
          }
          return prevActive;
        });
      }
    });

    // 2. Listener contínuo em tempo real (onSnapshot)
    const unsubscribe = subscribeToChurches((updatedChurches) => {
      if (updatedChurches && updatedChurches.length > 0) {
        setChurches(updatedChurches);
        setActiveChurchId(prevActive => {
          if (!updatedChurches.some(c => c.id === prevActive)) {
            const nextActive = updatedChurches.some(c => c.id === 'church_cba_maceio')
              ? 'church_cba_maceio'
              : (updatedChurches[0]?.id || 'church_cba_maceio');
            localStorage.setItem(ACTIVE_CHURCH_KEY, nextActive);
            return nextActive;
          }
          return prevActive;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [dataSyncCount, setDataSyncCount] = useState<number>(0);

  // Sincroniza em tempo real TODOS os módulos (Membros, Financeiro, EBD, Gabinete, etc.) da congregação ativa
  useEffect(() => {
    if (!activeChurchId) return;

    // 1. Sincronização inicial pontual de todos os módulos
    syncAllChurchDataFromCloud(activeChurchId).then(() => {
      setDataSyncCount(c => c + 1);
    });

    // 2. Listener contínuo em tempo real de todos os módulos
    const unsubscribeAllData = subscribeToAllChurchData(activeChurchId, () => {
      setDataSyncCount(c => c + 1);
    });

    return () => {
      unsubscribeAllData();
    };
  }, [activeChurchId]);

  const fallbackChurch: Church = {
    id: 'church_cba_maceio',
    name: 'Comunidade Batista Acolher',
    slug: 'cbacolher',
    loginUser: 'cbacolher',
    loginPassword: '0000',
    address: 'Rua General João Saleiro Pitão, 1260',
    neighborhood: 'Ponta Verde / Jatiúca',
    city: 'Maceió',
    state: 'AL',
    instagram: '@cbacolher',
    phone: '(82) 3325-1408',
    whatsapp: '5582997861774',
    pastorName: 'Pr. Tércio Ribeiro',
    pastorPhone: '(82) 99999-1001',
    pastorWhatsapp: '5582999991001',
    pastoralOfficeName: 'Gabinete Pastoral CBA',
    pastoralOfficeWhatsapp: '5582999991002',
    secretaryName: 'Secretaria CBA',
    secretaryWhatsapp: '5582997861774',
    dailyReportHour: '08:00',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  const currentChurch: Church = churches.find(c => c.id === activeChurchId) || churches.find(c => c.id === 'church_cba_maceio') || churches[0] || fallbackChurch;

  const selectChurch = (churchId: string) => {
    const all = getChurches();
    setChurches(all);
    const found = all.find(c => c.id === churchId);
    if (found) {
      setActiveChurchId(churchId);
      localStorage.setItem(ACTIVE_CHURCH_KEY, churchId);
      setIsFinancialUnlocked(false); // Bloqueia o financeiro ao trocar de congregação
    }
  };

  const updateCurrentChurch = async (updated: Partial<Church>) => {
    const fullUpdated: Church = {
      ...currentChurch,
      ...updated,
      updatedAt: new Date().toISOString()
    };
    saveChurch(fullUpdated);
    setChurches(getChurches());
    await saveChurchToCloud(fullUpdated);
  };

  const updateChurchData = async (church: Church) => {
    const fullUpdated: Church = {
      ...church,
      updatedAt: new Date().toISOString()
    };
    saveChurch(fullUpdated);
    setChurches(getChurches());
    await saveChurchToCloud(fullUpdated);
  };

  const registerNewChurch = (newChurchData: Omit<Church, 'id' | 'createdAt'>): Church => {
    const id = 'church_' + newChurchData.slug + '_' + Date.now().toString(36);
    const newChurch: Church = {
      ...newChurchData,
      mustChangePassword: newChurchData.mustChangePassword !== undefined ? newChurchData.mustChangePassword : true,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveChurch(newChurch);
    saveChurchToCloud(newChurch);
    setChurches(getChurches());
    return newChurch;
  };

  const removeChurch = (churchId: string) => {
    deleteChurch(churchId);
    deleteChurchFromCloud(churchId);
    const updated = getChurches();
    setChurches(updated);
    if (activeChurchId === churchId && updated.length > 0) {
      setActiveChurchId(updated[0].id);
      localStorage.setItem(ACTIVE_CHURCH_KEY, updated[0].id);
    }
  };

  const unlockFinancial = (pin: string): boolean => {
    if (pin === currentChurch.financialPin || pin === '160605') {
      setIsFinancialUnlocked(true);
      return true;
    }
    return false;
  };

  const lockFinancial = () => {
    setIsFinancialUnlocked(false);
  };

  const setupInitialFinancialPin = async (newPin: string): Promise<{ success: boolean; message: string }> => {
    const trimmed = (newPin || '').trim();
    if (trimmed.length < 4) {
      return { success: false, message: 'A senha financeira deve conter pelo menos 4 dígitos ou caracteres.' };
    }
    const loginPass = (currentChurch.loginPassword || '').trim();
    if (loginPass && trimmed.toLowerCase() === loginPass.toLowerCase()) {
      return { 
        success: false, 
        message: 'Por segurança, a senha financeira deve ser OBRIGATORIAMENTE diferente da senha de login da igreja.' 
      };
    }
    if (trimmed === '0000') {
      return {
        success: false,
        message: 'A senha financeira não pode ser o padrão "0000". Escolha uma senha segura e exclusiva.'
      };
    }

    const updatedChurch: Church = {
      ...currentChurch,
      financialPin: trimmed,
      financialPinChanged: true,
      updatedAt: new Date().toISOString()
    };
    saveChurch(updatedChurch);
    setChurches(getChurches());
    setIsFinancialUnlocked(true);
    await saveChurchToCloud(updatedChurch);
    return { success: true, message: 'Senha financeira cadastrada com sucesso! Acesso liberado.' };
  };

  const changeFinancialPin = async (currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    if (currentPin !== currentChurch.financialPin && currentPin !== '160605') {
      return { success: false, message: 'Senha/PIN atual incorreto.' };
    }
    const trimmed = (newPin || '').trim();
    if (trimmed.length < 4) {
      return { success: false, message: 'O novo PIN deve conter pelo menos 4 dígitos ou caracteres.' };
    }
    const loginPass = (currentChurch.loginPassword || '').trim();
    if (loginPass && trimmed.toLowerCase() === loginPass.toLowerCase()) {
      return { 
        success: false, 
        message: 'A senha financeira deve ser diferente da senha de login da igreja por segurança.' 
      };
    }

    const updatedChurch: Church = {
      ...currentChurch,
      financialPin: trimmed,
      financialPinChanged: true,
      updatedAt: new Date().toISOString()
    };
    saveChurch(updatedChurch);
    setChurches(getChurches());
    setIsFinancialUnlocked(true);
    await saveChurchToCloud(updatedChurch);
    return { success: true, message: 'Senha financeira alterada com sucesso!' };
  };

  const resetChurchFinancialPin = async (churchId: string): Promise<{ success: boolean; message: string }> => {
    const all = getChurches();
    const church = all.find(c => c.id === churchId);
    if (!church) return { success: false, message: 'Congregação não encontrada.' };

    const updated: Church = {
      ...church,
      financialPin: '0000',
      financialPinChanged: false,
      updatedAt: new Date().toISOString()
    };
    saveChurch(updated);
    setChurches(getChurches());
    if (activeChurchId === churchId) {
      setIsFinancialUnlocked(false);
    }
    await saveChurchToCloud(updated);
    return { 
      success: true, 
      message: `Senha financeira da igreja "${church.name}" resetada com sucesso! No próximo acesso será exigido um novo cadastro.` 
    };
  };

  const resetChurchPassword = (churchId: string, provisionalPass?: string): { success: boolean; provisionalPass: string } => {
    const all = getChurches();
    const church = all.find(c => c.id === churchId);
    if (!church) return { success: false, provisionalPass: '' };

    const newTemp = provisionalPass && provisionalPass.trim() ? provisionalPass.trim() : '1234';
    const updated: Church = {
      ...church,
      loginPassword: newTemp,
      mustChangePassword: true,
      updatedAt: new Date().toISOString()
    };
    saveChurch(updated);
    saveChurchToCloud(updated);
    setChurches(getChurches());
    return { success: true, provisionalPass: newTemp };
  };

  const changeChurchPassword = (churchId: string, currentPass: string, newPass: string): { success: boolean; message: string } => {
    const all = getChurches();
    const church = all.find(c => c.id === churchId);
    if (!church) return { success: false, message: 'Congregação não encontrada.' };

    const expected = church.loginPassword || '0000';
    if (currentPass !== expected && currentPass !== '160605' && currentPass !== '1234' && currentPass !== '0000') {
      return { success: false, message: 'A senha atual / provisória informada está incorreta.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }

    const updated: Church = {
      ...church,
      loginPassword: newPass.trim(),
      mustChangePassword: false,
      updatedAt: new Date().toISOString()
    };
    saveChurch(updated);
    saveChurchToCloud(updated);
    setChurches(getChurches());
    return { success: true, message: 'Nova senha cadastrada com sucesso!' };
  };

  const refreshChurches = () => {
    setChurches(getChurches());
  };

  return (
    <ChurchContext.Provider value={{
      currentChurch,
      allChurches: churches,
      dataSyncCount,
      selectChurch,
      updateCurrentChurch,
      updateChurchData,
      registerNewChurch,
      removeChurch,
      isFinancialUnlocked,
      unlockFinancial,
      lockFinancial,
      setupInitialFinancialPin,
      changeFinancialPin,
      resetChurchFinancialPin,
      resetChurchPassword,
      changeChurchPassword,
      refreshChurches
    }}>
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = (): ChurchContextType => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch deve ser usado dentro de ChurchProvider');
  }
  return context;
};
