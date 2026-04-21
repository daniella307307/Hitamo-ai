import React, { useState } from 'react';
import { User } from '../types';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  passwordReset: (email: string) => Promise<{ token: string }>;
}

const passwordReset = async (email: string): Promise<{ token: string }> => {
  const response = await fetch('/api/password-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  return { token: data.token }; // Adjust based on actual API response
};

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const login = async (email: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setUser(data.user);
  };
  const logout = () => setUser(null);
  const value = { user, login, logout, passwordReset };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};