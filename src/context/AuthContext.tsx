import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { getChurches, findChurchByLogin } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isMasterAdmin: boolean;
  loginAsMaster: (password: string) => boolean;
  loginChurch: (login: string, pass: string) => { success: boolean; churchId: string; role?: UserRole; mustChangePassword?: boolean; message?: string };
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

  // Login da Igreja (Suporta CBA e qualquer nova igreja cadastrada no SaaS)
  const loginChurch = (login: string, pass: string): { success: boolean; churchId: string; role?: UserRole; mustChangePassword?: boolean; message?: string } => {
    if (!login || !login.trim()) {
      return { success: false, churchId: '', message: 'Informe o login da sua congregação.' };
    }

    // Busca exata e segura entre as congregações cadastradas
    const storedChurches = getChurches();
    const matchedChurch = findChurchByLogin(storedChurches, login);

    if (matchedChurch) {
      // 1. VERIFICA SE DIGITOU A SENHA ESPECÍFICA DE LÍDER DE ESCALA
      const isScalePass = Boolean(
        matchedChurch.scaleAccessPassword && 
        matchedChurch.scaleAccessPassword.trim() !== '' && 
        pass.trim() === matchedChurch.scaleAccessPassword.trim()
      );

      if (isScalePass) {
        const scaleUser: User = {
          id: 'usr_scale_' + matchedChurch.id,
          churchId: matchedChurch.id,
          name: `Líder de Escala (${matchedChurch.name})`,
          email: `escala@${matchedChurch.slug}.com`,
          role: 'LIDER_ESCALA',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(scaleUser);
        return { 
          success: true, 
          churchId: matchedChurch.id, 
          role: 'LIDER_ESCALA', 
          mustChangePassword: false 
        };
      }

      // 2. VERIFICA SE DIGITOU A SENHA ADMINISTRATIVA PRINCIPAL DA IGREJA
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
        return { success: true, churchId: matchedChurch.id, role: 'ADMIN', mustChangePassword: false };
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
    const cid = churchId || 'church_demo';
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
    const isCba = churchId === 'church_cba_maceio';
    let name = isCba ? 'Membro CBA' : 'Usuário';
    let email = isCba ? 'usuario@cbacolher.com.br' : 'usuario@igrejabetel.com.br';

    switch (role) {
      case 'SUPERADMIN':
        name = 'Saulo Monteiro';
        email = 'saulo@smdesenvolvimento.com.br';
        break;
      case 'ADMIN':
        name = isCba ? 'Administração CBA' : 'Administração Betel';
        email = isCba ? 'admin@cbacolher.com.br' : 'admin@igrejabetel.com.br';
        break;
      case 'PASTOR':
        name = isCba ? 'Pr. Saulo Cavalcanti' : 'Pr. Marcos Aurélio Silveira';
        email = isCba ? 'pastor@cbacolher.com.br' : 'pastor@igrejabetel.com.br';
        break;
      case 'SECRETARIA':
        name = isCba ? 'Secretaria CBA' : 'Secretaria Betel';
        email = isCba ? 'secretaria@cbacolher.com.br' : 'secretaria@igrejabetel.com.br';
        break;
      case 'TESOURARIA':
        name = isCba ? 'Tesouraria CBA' : 'Tesouraria Betel';
        email = isCba ? 'tesouraria@cbacolher.com.br' : 'tesouraria@igrejabetel.com.br';
        break;
      case 'LIDER_PG':
        name = isCba ? 'Líder Pequeno Grupo CBA' : 'Carlos Eduardo Oliveira (Líder PG)';
        email = isCba ? 'liderpg@cbacolher.com.br' : 'carlos.pg@igrejabetel.com.br';
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
