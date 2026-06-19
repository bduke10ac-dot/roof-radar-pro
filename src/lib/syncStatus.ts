import { useSyncExternalStore } from "react";

export type SyncState = "idle" | "saving" | "saved" | "error";

let pending = 0;
let state: SyncState = "idle";
let lastSavedAt: number | null = null;
let savedTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(next: SyncState) {
  state = next;
  emit();
}

/**
 * Wrap any persistence promise so the global sync indicator reflects
 * real database write state (saving -> saved / error).
 */
export async function trackSync<T>(promise: Promise<T>): Promise<T> {
  pending += 1;
  if (savedTimer) {
    clearTimeout(savedTimer);
    savedTimer = null;
  }
  setState("saving");
  try {
    const result = await promise;
    pending = Math.max(0, pending - 1);
    if (pending === 0) {
      lastSavedAt = Date.now();
      setState("saved");
      savedTimer = setTimeout(() => {
        if (pending === 0) setState("idle");
      }, 2500);
    }
    return result;
  } catch (err) {
    pending = Math.max(0, pending - 1);
    setState("error");
    throw err;
  }
}

type Snapshot = { state: SyncState; lastSavedAt: number | null };
let snapshot: Snapshot = { state, lastSavedAt };

function getSnapshot(): Snapshot {
  if (snapshot.state !== state || snapshot.lastSavedAt !== lastSavedAt) {
    snapshot = { state, lastSavedAt };
  }
  return snapshot;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSyncStatus(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
