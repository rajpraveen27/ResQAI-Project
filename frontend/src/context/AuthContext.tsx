import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { currentUser } from '../data/mockData';

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(currentUser);

  const hasRole = (roles: UserRole[]) => roles.includes(user.role);
  const isAdmin = user.role === 'admin';
  const isCoordinator = user.role === 'admin' || user.role === 'coordinator';

  return (
    <AuthContext.Provider value={{ user, setUser, hasRole, isAdmin, isCoordinator }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
