import { createContext, useContext, useEffect, useState } from "react";
import { apiLogout, setToken } from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  // Session is in-memory only: on refresh, app resets to default logged-out state
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // Clear any legacy persistent storage on app mount
    try {
      localStorage.removeItem("ns-token");
      localStorage.removeItem("ns-user");
      sessionStorage.removeItem("ns-token");
      sessionStorage.removeItem("ns-user");
    } catch (_) {}
  }, []);

  const setAuthSession = (token, userObj) => {
    setToken(token);
    setUser(userObj);
    setReady(true);
    return userObj;
  };

  const logout = () => {
    try {
      apiLogout();
    } catch (_) {}
    setToken("");
    setUser(null);
    try {
      localStorage.removeItem("ns-token");
      localStorage.removeItem("ns-user");
      sessionStorage.removeItem("ns-token");
      sessionStorage.removeItem("ns-user");
    } catch (_) {}
  };

  return (
    <Ctx.Provider value={{ user, ready, logout, setAuthSession }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
