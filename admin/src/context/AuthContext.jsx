import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAdminLogout = () => {
      logout();
    };
    window.addEventListener("admin-logout", handleAdminLogout);

    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const res = await api.getCurrentUser();
          if (res.user && res.user.role === "admin") {
            setUser(res.user);
          } else {
            // Not an admin user - clear tokens
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_refresh_token");
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
        }
      }
      setLoading(false);
    };
    checkAuth();

    return () => {
      window.removeEventListener("admin-logout", handleAdminLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.user.role !== "admin") {
        throw new Error("Access denied: Administrative privileges required.");
      }
      localStorage.setItem("admin_token", res.token);
      localStorage.setItem("admin_refresh_token", res.refreshToken);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
