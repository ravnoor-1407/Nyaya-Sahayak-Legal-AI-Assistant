import { useEffect, useState } from "react";

export function useBackendStatus() {
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const r = await fetch("/api/helplines");
        if (alive) setStatus(r.ok ? "online" : "offline");
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