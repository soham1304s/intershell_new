import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("internshell_user"));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("internshell_token")));

  useEffect(() => {
    if (!localStorage.getItem("internshell_token")) return;
    api("/auth/me")
      .then((current) => {
        setUser(current);
        localStorage.setItem("internshell_user", JSON.stringify(current));
      })
      .catch(() => {
        localStorage.removeItem("internshell_token");
        localStorage.removeItem("internshell_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (mode, payload) => {
    const data = await api(`/auth/${mode}`, { method: "POST", body: payload });
    localStorage.setItem("internshell_token", data.token);
    localStorage.setItem("internshell_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("internshell_token");
    localStorage.removeItem("internshell_user");
    setUser(null);
  };

  const refreshUser = async () => {
    const current = await api("/auth/me");
    setUser(current);
    localStorage.setItem("internshell_user", JSON.stringify(current));
    return current;
  };

  const value = useMemo(() => ({
    user,
    loading,
    login: (payload) => authenticate("login", payload),
    register: (payload) => authenticate("register", payload),
    google: (credential, role) => authenticate("google", { credential, role }),
    logout,
    refreshUser,
    setUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
