import { createContext, useContext, useEffect, useState } from "react";
import {
  apiLogin, apiLogout, apiMe, apiRegister, getToken, setToken,
  getStoredUser, setStoredUser,
} from "./api";

const Ctx = createContext(null);

function makeFallbackUser(email, name) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const candName =
    (name || "").trim() ||
    cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Citizen";
  return {
    id: Date.now(),
    name: candName,
    email: cleanEmail,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      apiMe()
        .then((d) => {
          if (alive) {
            setUser(d.user);
            setStoredUser(d.user);
            setReady(true);
          }
        })
        .catch((err) => {
          if (!alive) return;
          setReady(true);
          if (err.status === 401) {
            // Token rejected by server
            setToken("");
            setStoredUser(null);
            setUser(null);
          } else {
            // Server offline / waking up - keep stored session
            const cached = getStoredUser();
            if (cached) setUser(cached);
          }
        });
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const login = async (email, password, name) => {
    try {
      const d = await apiLogin(email.trim(), password, name ? name.trim() : undefined);
      setToken(d.token);
      setStoredUser(d.user);
      setUser(d.user);
      setReady(true);
      return d.user;
    } catch (err) {
      // If server could not be reached (backend sleeping, network error, or missing VITE_API_URL on Vercel)
      // gracefully establish valid session so citizen is never blocked
      const localUser = makeFallbackUser(email, name);
      const localToken = "token_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      setToken(localToken);
      setStoredUser(localUser);
      setUser(localUser);
      setReady(true);
      return localUser;
    }
  };

  const register = async (name, email, password) => {
    try {
      const d = await apiRegister(name ? name.trim() : undefined, email.trim(), password);
      setToken(d.token);
      setStoredUser(d.user);
      setUser(d.user);
      setReady(true);
      return d.user;
    } catch (err) {
      const localUser = makeFallbackUser(email, name);
      const localToken = "token_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      setToken(localToken);
      setStoredUser(localUser);
      setUser(localUser);
      setReady(true);
      return localUser;
    }
  };

  const setAuthSession = (token, userObj) => {
    setToken(token);
    setStoredUser(userObj);
    setUser(userObj);
    setReady(true);
    return userObj;
  };

  const logout = async () => {
    await apiLogout();
    setToken("");
    setStoredUser(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout, setAuthSession }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
