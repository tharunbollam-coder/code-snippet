import React, { createContext, useContext, useState } from 'react';

const AuthContextSimple = createContext();

export const AuthProviderSimple = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simple mock authentication - just check if there's a token
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsAuthenticated(true);
      setUser({ username: 'user', email: 'user@example.com' }); // Generic user
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // For now, just set a mock token and user
      localStorage.setItem('token', 'mock-token');
      setUser({ username: 'user', email: email });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // For now, just set a mock token and user
      localStorage.setItem('token', 'mock-token');
      setUser({ username: userData.username, email: userData.email });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContextSimple.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContextSimple.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContextSimple);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
