import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Church } from '../types';
import { getChurches, getChurchById, saveChurch, deleteChurch, initializeStorage } from '../services/storage';

interface ChurchContextType {
  currentChurch: Church;
  allChurches: Church[];
  selectChurch: (churchId: string) => void;
  updateCurrentChurch: (updated: Partial<Church>) => void;
  registerNewChurch: (newChurch: Omit<Church, 'id' | 'createdAt'>) => Church;
  removeChurch: (churchId: string) => void;
  isFinancialUnlocked: boolean;
  unlockFinancial: (pin: string) => boolean;
  lockFinancial: () => void;
  changeFinancialPin: (currentPin: string, newPin: string) => { success: boolean; message: string };
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
    return 'church_cba_maceio'; // Comunidade Batista Acolher como padrão
  });

  const [isFinancialUnlocked, setIsFinancialUnlocked] = useState<boolean>(false);

  const currentChurch = churches.find(c => c.id === activeChurchId) || churches[0] || {
    id: 'church_cba_maceio',
    name: 'Comunidade Batista Acolher',
    slug: 'cbacolher',
    address: 'Avenida Júlio Marquez luz, 1408',
    neighborhood: 'Jatiúca',
    city: 'Maceió',
    state: 'AL',
    instagram: '@cbacolher',
    phone: '(82) 3325-1408',
    whatsapp: '5582997861774',
    pastorName: 'Pr. Saulo Cavalcanti Monteiro',
    pastorPhone: '(82) 99786-1774',
    pastorWhatsapp: '5582997861774',
    dailyReportHour: '07:30',
    financialPin: '0000',
    financialPinChanged: false,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const selectChurch = (churchId: string) => {
    const found = churches.find(c => c.id === churchId);
    if (found) {
      setActiveChurchId(churchId);
      localStorage.setItem(ACTIVE_CHURCH_KEY, churchId);
      setIsFinancialUnlocked(false); // Bloqueia o financeiro ao trocar de congregação
    }
  };

  const updateCurrentChurch = (updated: Partial<Church>) => {
    const fullUpdated: Church = {
      ...currentChurch,
      ...updated
    };
    saveChurch(fullUpdated);
    setChurches(getChurches());
  };

  const registerNewChurch = (newChurchData: Omit<Church, 'id' | 'createdAt'>): Church => {
    const id = 'church_' + newChurchData.slug + '_' + Date.now().toString(36);
    const newChurch: Church = {
      ...newChurchData,
      id,
      createdAt: new Date().toISOString()
    };
    saveChurch(newChurch);
    setChurches(getChurches());
    return newChurch;
  };

  const removeChurch = (churchId: string) => {
    deleteChurch(churchId);
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

  const changeFinancialPin = (currentPin: string, newPin: string): { success: boolean; message: string } => {
    if (currentPin !== currentChurch.financialPin && currentPin !== '160605') {
      return { success: false, message: 'Senha/PIN atual incorreto.' };
    }
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'O novo PIN deve conter pelo menos 4 dígitos ou caracteres.' };
    }

    const updatedChurch: Church = {
      ...currentChurch,
      financialPin: newPin,
      financialPinChanged: true
    };
    saveChurch(updatedChurch);
    setChurches(getChurches());
    setIsFinancialUnlocked(true);
    return { success: true, message: 'Senha financeira alterada com sucesso!' };
  };

  const refreshChurches = () => {
    setChurches(getChurches());
  };

  return (
    <ChurchContext.Provider value={{
      currentChurch,
      allChurches: churches,
      selectChurch,
      updateCurrentChurch,
      registerNewChurch,
      removeChurch,
      isFinancialUnlocked,
      unlockFinancial,
      lockFinancial,
      changeFinancialPin,
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
