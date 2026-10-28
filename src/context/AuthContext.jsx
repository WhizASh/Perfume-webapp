import { createContext, useContext, useEffect, useState } from 'react';
import {
  loginAdmin,
  logoutAdmin,
  subscribeToAuth,
  getCurrentAdmin,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(getCurrentAdmin());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setAdminUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await loginAdmin(email, password);
    setAdminUser(cred.user);
    return cred.user;
  };

  const logout = async () => {
    await logoutAdmin();
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
