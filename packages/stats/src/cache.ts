/** The part of `localStorage` the cache uses, so any store (or none) can stand in. */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type CacheEntry<V> = { value: V; at: number };

export type TtlCacheOptions = {
  /** How long an entry stays fresh. */
  ttlMs: number;
  /** Mirrors entries here, so a reload inside the TTL doesn't fetch again. Leave out to keep them in memory only. */
  storage?: StorageLike | null;
  /** Prefixes the storage keys, so they never clash with anything else stored. */
  prefix?: string;
  now?: () => number;
};

/** A small map of key to value and time. An entry is returned only while it's fresh. Storage that throws or holds junk is ignored. */
export class TtlCache<V> {
  private readonly map = new Map<string, CacheEntry<V>>();
  private readonly storage: StorageLike | null;
  private readonly prefix: string;
  private readonly now: () => number;
  ttlMs: number;

  constructor({ ttlMs, storage = null, prefix = "stats:", now = () => Date.now() }: TtlCacheOptions) {
    this.ttlMs = ttlMs;
    this.storage = storage;
    this.prefix = prefix;
    this.now = now;
  }

  /** The entry, if it's still fresh. */
  get(key: string): CacheEntry<V> | undefined {
    const entry = this.map.get(key) ?? this.fromStorage(key);
    if (!entry) return undefined;
    if (this.now() - entry.at >= this.ttlMs) return undefined;
    return entry;
  }

  set(key: string, value: V): CacheEntry<V> {
    const entry = { value, at: this.now() };
    this.map.set(key, entry);
    try { this.storage?.setItem(this.prefix + key, JSON.stringify(entry)); } catch { /* full or blocked: memory still has it */ }
    return entry;
  }

  delete(key: string) {
    this.map.delete(key);
    try { this.storage?.removeItem(this.prefix + key); } catch { /* blocked */ }
  }

  /** Empties memory. Stored entries go too, but only the ones this cache has seen, so nothing else in storage is touched. */
  clear() {
    for (const key of [...this.map.keys()]) this.delete(key);
  }

  private fromStorage(key: string): CacheEntry<V> | undefined {
    try {
      const raw = this.storage?.getItem(this.prefix + key);
      if (!raw) return undefined;
      const entry: unknown = JSON.parse(raw);
      if (!entry || typeof entry !== "object" || !("at" in entry) || typeof entry.at !== "number" || !("value" in entry)) return undefined;
      const typed = entry as CacheEntry<V>;
      this.map.set(key, typed);
      return typed;
    } catch {
      return undefined;
    }
  }
}
