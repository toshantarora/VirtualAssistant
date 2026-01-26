import { useState } from 'react';
import { AuthContext } from './AuthContext';

const getInitialUser = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return token && user ? JSON.parse(user) : null;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading] = useState(false);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};
export default AuthProvider;
