import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getChurches } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isMasterAdmin: boolean;
  loginAsMaster: (password: string) => boolean;
  loginChurch: (login: string, pass: string) => { success: boolean; churchId: string; mustChangePassword?: boolean; message?: string };
  loginChurchDirect: (churchId: string) => void;
  loginUser: (email: string, pass: string, churchId?: string) => boolean;
  logout: () => void;
  switchDemoRole: (role: UserRole, churchId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_PASSWORD = '160605';
const AUTH_SESSION_KEY = 'gi_session_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicialmente NULO para sempre exigir a tela de login ao abrir, conforme solicitado pelo usuário
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, [currentUser]);

  // Login Master de Saulo Monteiro (SaaS Admin)
  const loginAsMaster = (password: string): boolean => {
    if (password === MASTER_PASSWORD || password === 'S@ulo160605') {
      const masterUser: User = {
        id: 'usr_saulo_master',
        churchId: 'church_cba_maceio',
        name: 'Saulo Monteiro',
        email: 'saulo@smdesenvolvimento.com.br',
        role: 'SUPERADMIN',
        isActive: true,
        createdAt: '2026-09-21T00:00:00Z'
      };
      setCurrentUser(masterUser);
      return true;
    }
    return false;
  };

  // Função auxiliar de normalização (remove acentos, pontuações, espaços e stopwords)
  const normalizeChurchKey = (str?: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '');
  };

  const stripStopwords = (str: string) => {
    return str.replace(/(no|na|de|do|da|dos|das|em|a|o)/g, '');
  };

  // Login da Igreja (Suporta CBA e qualquer nova igreja cadastrada no SaaS)
  const loginChurch = (login: string, pass: string): { success: boolean; churchId: string; mustChangePassword?: boolean; message?: string } => {
    const cleanTerm = normalizeChurchKey(login);
    const cleanTermNoStop = stripStopwords(cleanTerm);

    if (!cleanTerm) {
      return { success: false, churchId: '', message: 'Informe o login da sua congregação.' };
    }

    // Busca inteligente e flexível entre as igrejas cadastradas no sistema
    const storedChurches = getChurches();
    const matchedChurch = storedChurches.find(c => {
      const u = normalizeChurchKey(c.loginUser);
      const s = normalizeChurchKey(c.slug);
      const n = normalizeChurchKey(c.name);

      const uNoStop = stripStopwords(u);
      const sNoStop = stripStopwords(s);
      const nNoStop = stripStopwords(n);

      return u === cleanTerm || s === cleanTerm || n === cleanTerm ||
             uNoStop === cleanTermNoStop || sNoStop === cleanTermNoStop ||
             (cleanTerm.length >= 4 && (u.includes(cleanTerm) || cleanTerm.includes(u))) ||
             (cleanTerm.length >= 4 && (s.includes(cleanTerm) || cleanTerm.includes(s))) ||
             (cleanTerm.length >= 6 && n.includes(cleanTerm)) ||
             (cleanTermNoStop.length >= 5 && nNoStop.includes(cleanTermNoStop));
    });

    if (matchedChurch) {
      const expectedPass = matchedChurch.loginPassword || '0000';
      const isPassCorrect = 
        pass === expectedPass || 
        (pass === '0000' && !matchedChurch.loginPassword) ||
        (matchedChurch.mustChangePassword && (pass === '1234' || pass === '0000' || pass === expectedPass));

      if (isPassCorrect) {
        // Se a senha for provisória ou tiver sido resetada, sinaliza que deve trocar antes de entrar
        if (matchedChurch.mustChangePassword) {
          return { 
            success: true, 
            churchId: matchedChurch.id, 
            mustChangePassword: true, 
            message: 'Esta congregação está com senha provisória e precisa cadastrar uma nova senha.' 
          };
        }

        const churchUser: User = {
          id: 'usr_' + matchedChurch.id,
          churchId: matchedChurch.id,
          name: matchedChurch.name,
          email: `${matchedChurch.slug}@gestaoigreja.com.br`,
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(churchUser);
        return { success: true, churchId: matchedChurch.id, mustChangePassword: false };
      }
      return { success: false, churchId: '', message: 'Senha incorreta para esta congregação.' };
    }

    return { success: false, churchId: '', message: 'Usuário ou senha inválidos. Verifique as credenciais da sua igreja.' };
  };

  const loginChurchDirect = (churchId: string): void => {
    const storedChurches = getChurches();
    const church = storedChurches.find(c => c.id === churchId);
    if (!church) return;

    const churchUser: User = {
      id: 'usr_' + church.id,
      churchId: church.id,
      name: church.name,
      email: `${church.slug}@gestaoigreja.com.br`,
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(churchUser);
  };

  const loginUser = (email: string, pass: string, churchId?: string): boolean => {
    if (pass === MASTER_PASSWORD || pass === 'S@ulo160605') {
      return loginAsMaster(pass);
    }
    const cid = churchId || 'church_cba_maceio';
    const role: UserRole = email.includes('pastor') ? 'PASTOR' : email.includes('tesouraria') ? 'TESOURARIA' : 'ADMIN';
    setCurrentUser({
      id: 'usr_' + Date.now(),
      churchId: cid,
      name: email.split('@')[0],
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    return true;
  };

  const switchDemoRole = (role: UserRole, churchId: string) => {
    let name = 'Usuário';
    let email = 'usuario@cbacolher.com.br';

    switch (role) {
      case 'SUPERADMIN':
        name = 'Saulo Monteiro';
        email = 'saulo@smdesenvolvimento.com.br';
        break;
      case 'ADMIN':
        name = 'Administração CBA';
        email = 'cbacolher@cbacolher.com.br';
        break;
      case 'PASTOR':
        name = 'Pr. Saulo Cavalcanti';
        email = 'pastor@cbacolher.com.br';
        break;
      case 'SECRETARIA':
        name = 'Secretaria CBA';
        email = 'secretaria@cbacolher.com.br';
        break;
      case 'TESOURARIA':
        name = 'Tesouraria CBA';
        email = 'tesouraria@cbacolher.com.br';
        break;
      case 'LIDER_PG':
        name = 'Carlos Santos (Líder PG)';
        email = 'carlos.pg@cbacolher.com.br';
        break;
    }

    setCurrentUser({
      id: 'usr_' + role.toLowerCase(),
      churchId,
      name,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isMasterAdmin: currentUser?.role === 'SUPERADMIN',
      loginAsMaster,
      loginChurch,
      loginChurchDirect,
      loginUser,
      logout,
      switchDemoRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
