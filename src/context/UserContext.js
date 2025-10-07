
import React, { createContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/userService";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Debug: log user state
  useEffect(() => {
    console.log('[UserContext] user state:', user);
  }, [user]);

  // Auto-fetch user info from token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser()
        .then((userData) => setUser(userData))
        .catch(() => setUser(null));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
