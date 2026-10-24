import { useEffect, useRef, useState } from "react";

export default function CountUp({ value, duration = 1100 }) {
  const target = typeof value === "number" ? value : parseInt(value, 10);
  const numeric = Number.isFinite(target);
  const [n, setN] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!numeric) return undefined;
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return undefined;
    }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, numeric, duration]);

  if (!numeric) return <>{value}</>;
  return <>{n.toLocaleString("en-IN")}</>;
}