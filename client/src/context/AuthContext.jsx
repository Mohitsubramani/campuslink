import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuslink_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('campuslink_token') || null;
  });

  const [pendingEmail, setPendingEmail] = useState(() => {
    return localStorage.getItem('campuslink_pending_email') || '';
  });

  const [devOtpNotice, setDevOtpNotice] = useState(() => {
    return localStorage.getItem('campuslink_dev_otp') || '';
  });

  const saveAuthSession = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('campuslink_token', authToken);
    localStorage.setItem('campuslink_user', JSON.stringify(userData));
    localStorage.removeItem('campuslink_pending_email');
    localStorage.removeItem('campuslink_dev_otp');
    setPendingEmail('');
    setDevOtpNotice('');
  };

  const setOtpPending = (email, devNotice = '') => {
    setPendingEmail(email);
    setDevOtpNotice(devNotice);
    localStorage.setItem('campuslink_pending_email', email);
    if (devNotice) {
      localStorage.setItem('campuslink_dev_otp', devNotice);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPendingEmail('');
    setDevOtpNotice('');
    localStorage.removeItem('campuslink_token');
    localStorage.removeItem('campuslink_user');
    localStorage.removeItem('campuslink_pending_email');
    localStorage.removeItem('campuslink_dev_otp');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      pendingEmail,
      devOtpNotice,
      setOtpPending,
      setDevOtpNotice,
      saveAuthSession,
      logout,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
