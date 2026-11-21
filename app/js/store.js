// Saved progress for the Leonida Ledger: earned trophies, per-trophy counters and
// settings live in localStorage, and can be exported to a file and imported back.
export const STORE_KEY = 'leonida-ledger-v1';

export function defaultState() {
  return { earned: [], counters: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function earnedSet(state) {
  return new Set(state.earned);
}

export function toggleEarned(state, id) {
  const set = earnedSet(state);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  state.earned = [...set].sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function counterValue(state, id) {
  const value = state.counters[id];
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

// A counter reaching its target marks the trophy earned; dropping below it unmarks it.
export function setCounter(state, trophy, value) {
  const target = trophy.target;
  const clamped = target == null ? 0 : Math.max(0, Math.min(target, Math.floor(value)));
  state.counters[trophy.id] = clamped;
  const set = earnedSet(state);
  if (target != null && clamped >= target) set.add(trophy.id);
  if (target != null && clamped < target) set.delete(trophy.id);
  state.earned = [...set].sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function setSpoiler(state, on) {
  state.spoiler = on === true;
  saveState(state);
  return state;
}

export function exportFileName() {
  const day = new Date().toISOString().slice(0, 10);
  return `leonida-ledger-progress-${day}.json`;
}

export function exportProgress(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName();
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProgressFile(file, knownIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const known = new Set(knownIds);
  const earned = Array.isArray(parsed.earned)
    ? parsed.earned.filter((n) => Number.isInteger(n) && known.has(n))
    : [];
  const counters = {};
  if (parsed.counters && typeof parsed.counters === 'object') {
    for (const [key, value] of Object.entries(parsed.counters)) {
      const id = Number(key);
      if (known.has(id) && Number.isFinite(value)) counters[id] = Math.max(0, Math.floor(value));
    }
  }
  return {
    earned: [...new Set(earned)].sort((a, b) => a - b),
    counters,
    spoiler: parsed.spoiler === true,
  };
}

export function resetProgress() {
  localStorage.removeItem(STORE_KEY);
  return defaultState();
}
