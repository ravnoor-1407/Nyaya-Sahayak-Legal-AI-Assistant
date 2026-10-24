import { createContext, useContext, useEffect, useState } from "react";
import {
  apiLogin, apiLogout, apiMe, apiRegister, getToken, setToken,
} from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer;
    const load = () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      apiMe()
        .then((d) => {
          if (alive) {
            setUser(d.user);
            setReady(true);
          }
        })
        .catch((err) => {
          if (!alive) return;
          setReady(true);
          if (err.status === 401) {
            setToken("");
            setUser(null);
          } else {
            timer = setTimeout(load, 4000); // backend not up yet: try again
          }
        });
    };
    load();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  const login = async (email, password) => {
    const d = await apiLogin(email.trim(), password);
    setToken(d.token);
    setUser(d.user);
    setReady(true);
    return d.user;
  };

  const register = async (name, email, password) => {
    const d = await apiRegister(name.trim(), email.trim(), password);
    setToken(d.token);
    setUser(d.user);
    setReady(true);
    return d.user;
  };

  const setAuthSession = (token, userObj) => {
    setToken(token);
    setUser(userObj);
    setReady(true);
    return userObj;
  };

  const logout = async () => {
    await apiLogout();
    setToken("");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout, setAuthSession }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
