"use client"

// Tiny external store backed by localStorage. Lets components read persisted
// state through useSyncExternalStore — hydration-safe (server snapshot is the
// fallback until after hydration) with no setState-in-effect cascades.
//
// The snapshot is referentially stable between writes (React compares with
// Object.is), and writes propagate to every subscribed component.
export function createLocalStorageStore<T>(
  key: string,
  parse: (raw: unknown) => T | null,
  fallback: T,
  serialize: (value: T) => string = (value) => JSON.stringify(value)
) {
  // null = not read yet; replaced only on writes / storage events.
  let state: T | null = null
  const listeners = new Set<() => void>()
  let storageListenerAttached = false

  function read(): T {
    if (state !== null) return state
    if (typeof window === "undefined") return fallback
    try {
      const raw = window.localStorage.getItem(key)
      state = raw === null ? fallback : (parse(JSON.parse(raw)) ?? fallback)
    } catch {
      state = fallback
    }
    return state
  }

  function ensureStorageListener() {
    if (storageListenerAttached || typeof window === "undefined") return
    storageListenerAttached = true
    // Keep tabs in sync: invalidate the cache when another tab writes.
    window.addEventListener("storage", (e) => {
      if (e.key !== key) return
      state = null
      listeners.forEach((l) => l())
    })
  }

  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      ensureStorageListener()
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: read,
    getServerSnapshot: () => fallback,
    get(): T {
      return read()
    },
    set(next: T): void {
      state = next
      try {
        window.localStorage.setItem(key, serialize(next))
      } catch {
        // storage full/blocked — state still updates in-memory
      }
      listeners.forEach((l) => l())
    },
  }
}
