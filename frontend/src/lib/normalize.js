// Helpers that tolerate different backend response shapes.
export function list(d, ...keys) {
  if (Array.isArray(d)) return d;
  if (d && typeof d === "object") {
    for (const k of keys) if (Array.isArray(d[k])) return d[k];
  }
  return [];
}

export function pick(o, ...keys) {
  if (!o) return "";
  for (const k of keys) {
    if (o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k];
  }
  return "";
}

// Flattens {metadata: {...}} into the top level.
export function flat(r) {
  return { ...(r && r.metadata ? r.metadata : {}), ...(r || {}) };
}