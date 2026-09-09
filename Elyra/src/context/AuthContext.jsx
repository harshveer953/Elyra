import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("elyra_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("elyra_token") || null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'

  useEffect(() => {
    if (user) {
      localStorage.setItem("elyra_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("elyra_user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("elyra_token", token);
    } else {
      localStorage.removeItem("elyra_token");
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    setUser(data);
    setToken(data.token);
    setAuthModalOpen(false);
    return data;
  };

  const register = async (name, email, phone, password) => {
    const data = await apiRegister({ name, email, phone, password });
    setUser(data);
    setToken(data.token);
    setAuthModalOpen(false);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("elyra_user");
    localStorage.removeItem("elyra_token");
  };

  const updateCredits = (newCredits) => {
    if (user) {
      setUser((prev) => ({ ...prev, credits: newCredits }));
    }
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: !!user?.isAdmin,
        login,
        register,
        logout,
        updateCredits,
        authModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
