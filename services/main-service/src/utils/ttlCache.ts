type Entry<T> = { data: T; expiresAt: number };

export function createTtlCache<T>() {
  const store = new Map<string, Entry<T>>();
  return {
    get(key: string): T | null {
      const hit = store.get(key);
      if (hit && hit.expiresAt > Date.now()) return hit.data;
      return null;
    },
    set(key: string, data: T, ttlMs: number) {
      store.set(key, { data, expiresAt: Date.now() + ttlMs });
    },
  };
}
