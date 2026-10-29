import { useEffect, useState } from "react";

export function useBackendStatus() {
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const apiBase =
          import.meta.env && import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
            : "";
        const r = await fetch(apiBase + "/api/helplines");
        const isJson = r.headers.get("content-type")?.includes("application/json");
        if (alive) setStatus(r.ok && isJson ? "online" : "offline");
      } catch (e) {
        if (alive) setStatus("offline");
      }
    };
    ping();
    const id = setInterval(ping, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return status;
}
