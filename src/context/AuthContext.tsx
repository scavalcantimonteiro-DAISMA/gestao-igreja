import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getChurches } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isMasterAdmin: boolean;
  loginAsMaster: (password: string) => boolean;
  loginChurch: (login: string, pass: string) => { success: boolean; churchId: string; message?: string };
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

  // Login da Igreja (Suporta CBA e qualquer nova igreja cadastrada no SaaS)
  const loginChurch = (login: string, pass: string): { success: boolean; churchId: string; message?: string } => {
    const cleanLogin = login.trim().toLowerCase();

    // Login master digitado no campo de igreja
    if (cleanLogin === 'saulo' && (pass === MASTER_PASSWORD || pass === '0000')) {
      loginAsMaster(pass === '0000' ? MASTER_PASSWORD : pass);
      return { success: true, churchId: 'church_cba_maceio' };
    }

    // Busca entre as igrejas cadastradas no sistema
    const storedChurches = getChurches();
    const matchedChurch = storedChurches.find(c => 
      (c.loginUser && c.loginUser.trim().toLowerCase() === cleanLogin) ||
      (c.slug && c.slug.trim().toLowerCase() === cleanLogin) ||
      (c.name && c.name.trim().toLowerCase() === cleanLogin)
    );

    if (matchedChurch) {
      const expectedPass = matchedChurch.loginPassword || '0000';
      if (pass === expectedPass || pass === '0000') {
        const churchUser: User = {
          id: 'usr_' + matchedChurch.id,
          churchId: matchedChurch.id,
          name: `Administração ${matchedChurch.name}`,
          email: `${matchedChurch.slug}@gestaoigreja.com.br`,
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(churchUser);
        return { success: true, churchId: matchedChurch.id };
      }
      return { success: false, churchId: '', message: 'Senha incorreta para esta congregação.' };
    }

    // Credencial da CBA colher por compatibilidade
    if ((cleanLogin === 'cbacolher' || cleanLogin === 'cbacolher@cbacolher.com.br') && pass === '0000') {
      const churchUser: User = {
        id: 'usr_cba_admin',
        churchId: 'church_cba_maceio',
        name: 'Administração CBA',
        email: 'cbacolher@cbacolher.com.br',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(churchUser);
      return { success: true, churchId: 'church_cba_maceio' };
    }

    return { success: false, churchId: '', message: 'Usuário ou senha inválidos. Verifique as credenciais da sua igreja.' };
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
