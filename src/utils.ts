import type { ComparisonHistory } from './types';

const HISTORY_KEY = 'comparison_history';
const SETTINGS_KEY = 'app_settings';
const MAX_HISTORY = 50;

export const getHistory = (): ComparisonHistory[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToHistory = (ayats: { surah: number; ayah: number }[]) => {
  try {
    const history = getHistory();
    const newEntry: ComparisonHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ayats
    };
    
    history.unshift(newEntry);
    
    // Keep only the latest MAX_HISTORY items
    const trimmedHistory = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};

export interface Settings {
  fontSize: number;
  highlightDifferences: boolean;
  vowelInsensitive: boolean;
  comparisonMode: 'letter' | 'word';
  hideMatchColor: boolean;
  hideDiacritics: boolean;
  ignoreWhiteSpace: boolean;
  matchColor: string;
  diffColor: string;
  theme: 'dark' | 'light';
  layout: 'vertical' | 'horizontal';
}

const DEFAULT_SETTINGS: Settings = {
  fontSize: 32,
  highlightDifferences: true,
  vowelInsensitive: true,
  comparisonMode: 'word',
  hideMatchColor: false,
  hideDiacritics: false,
  ignoreWhiteSpace: true,
  matchColor: '#06b6d4',
  diffColor: '#ec4899',
  theme: 'light',
  layout: 'vertical',
};

export const getSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

const SEARCH_HISTORY_KEY = 'compare_ayat_search_history';

export const getSearchHistory = (): string[] => {
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addSearchHistory = (term: string) => {
  if (!term || !term.trim()) return;
  const history = getSearchHistory();
  const filtered = history.filter(h => h !== term.trim());
  filtered.unshift(term.trim());
  const limited = filtered.slice(0, 10);
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
  } catch (e) {
    console.error("Failed to save search history", e);
  }
};

export const removeSearchHistory = (term: string) => {
  const history = getSearchHistory();
  const filtered = history.filter(h => h !== term);
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to save search history", e);
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (e) {
    console.error("Failed to clear search history", e);
  }
};

import { diffArrays } from 'diff';

export interface TextDiff {
  text: string;
  isDifferent: boolean;
}

export interface AlignedDiff {
  text1: string;
  text2: string;
  isDifferent: boolean;
}

export interface CompareOptions {
  /** Ignore diacritics (harakat/tashkeel) and normalize letter variants */
  vowelInsensitive?: boolean;
  /** Ignore all whitespace differences */
  ignoreWhiteSpace?: boolean;
  /** Treat ة and ه as equal (off by default — they are different letters) */
  normalizeTaaMarbuta?: boolean;
  /** Compare by grapheme (letter) or word */
  mode?: 'letter' | 'word';
}

/* ----------------------------- Tokenization ----------------------------- */

function splitGraphemes(text: string): string[] {
  const Seg = (Intl as any).Segmenter;
  if (Seg) {
    const segmenter = new Seg('ar', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s: any) => s.segment);
  }
  return Array.from(text);
}

function splitWords(text: string): string[] {
  // Keep whitespace tokens so we can preserve formatting in output.
  // We also intelligently separate common attached Arabic prefixes 
  // (وَ Waw, فَ Fa, بِ Ba, كَ Ka) when attached to words starting with ال / ٱل,
  // as well as لِ (Lam) attached to ل, so that Word Mode can align the core roots.
  const regex = /\s+|(?:\u0648\u064E?|\u0641\u064E?|\u0628\u0650?|\u0643\u064E?)(?=[\u0627\u0671]\u0644)|(?:\u0644\u0650?)(?=\u0644)|\S+/gu;
  return text.match(regex) ?? [];
}

/* ----------------------------- Normalization ----------------------------- */

// Unicode ranges for Arabic combining marks / diacritics
const TASHKEEL_RE =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g;

// Zero-width characters that affect visual rendering but not meaning
const ZERO_WIDTH_RE = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

function stripZeroWidth(text: string): string {
  return text.replace(ZERO_WIDTH_RE, '');
}

function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL_RE, '');
}

/**
 * Normalize Arabic letter variants that are visually/orthographically
 * interchangeable but encoded differently.
 */
function normalizeArabicLetters(
  text: string,
  opts: { normalizeTaaMarbuta: boolean }
): string {
  let out = text
    // Remove tatweel (kashida) — purely decorative
    .replace(/\u0640/g, '')
    // Alef variants → bare alef:  آ أ إ ٱ → ا
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // Waw variants → bare waw:  ؤ → و
    .replace(/\u0624/g, '\u0648')
    // Yeh variants → yeh:  ى ئ ي(Farsi) → ي
    .replace(/[\u0649\u0626\u06CC]/g, '\u064A')
    // Kaf variants → kaf:  ک → ك
    .replace(/\u06A9/g, '\u0643')
    // Standalone hamza variants → hamza
    .replace(/[\u0621]/g, '\u0621')
    // Arabic-Indic digits → ASCII digits (٠-٩ → 0-9)
    .replace(/[\u0660-\u0669]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x30)
    )
    // Extended Arabic-Indic digits (Persian ۰-۹ → 0-9)
    .replace(/[\u06F0-\u06F9]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 0x30)
    );

  if (opts.normalizeTaaMarbuta) {
    // ة → ه  (opt-in; these are technically different letters)
    out = out.replace(/\u0629/g, '\u0647');
  }

  return out;
}

/**
 * Build a normalized comparison key for a token. Returns null if the token
 * should be skipped entirely (e.g. pure whitespace when ignoring whitespace).
 */
function unitKey(
  unit: string,
  vowelInsensitive: boolean,
  ignoreWhiteSpace: boolean,
  normalizeTaaMarbuta: boolean
): string | null {
  let key = unit.normalize('NFC');
  key = stripZeroWidth(key);

  if (vowelInsensitive) {
    key = stripTashkeel(key);
    key = normalizeArabicLetters(key, { normalizeTaaMarbuta });
  }

  if (ignoreWhiteSpace) {
    // Pure whitespace tokens are dropped from comparison entirely
    if (/^\s*$/.test(key)) return null;
    // Internal whitespace inside a token is removed
    key = key.replace(/\s+/g, '');
  }

  return key.normalize('NFC');
}

/* ----------------------------- Unit Building ----------------------------- */

type Unit = { raw: string; key: string; skipped: boolean };

function buildUnits(
  text: string,
  mode: 'letter' | 'word',
  vowelInsensitive: boolean,
  ignoreWhiteSpace: boolean,
  normalizeTaaMarbuta: boolean
): Unit[] {
  const rawUnits = mode === 'word' ? splitWords(text) : splitGraphemes(text);

  return rawUnits.map((raw) => {
    const key = unitKey(raw, vowelInsensitive, ignoreWhiteSpace, normalizeTaaMarbuta);
    return {
      raw,
      key: key ?? '',
      skipped: key === null, // skipped tokens still render but don't participate in diff
    };
  });
}

/* ----------------------------- Diff Pipeline ----------------------------- */

function mergeChunks(chunks: AlignedDiff[]): AlignedDiff[] {
  const out: AlignedDiff[] = [];
  for (const chunk of chunks) {
    if (chunk.text1 === '' && chunk.text2 === '') continue;
    const prev = out[out.length - 1];
    if (prev && prev.isDifferent === chunk.isDifferent) {
      prev.text1 += chunk.text1;
      prev.text2 += chunk.text2;
    } else {
      out.push({ ...chunk });
    }
  }
  return out;
}

/**
 * Compare two Arabic texts and return aligned diff chunks.
 * Skipped tokens (e.g. whitespace when ignoreWhiteSpace=true) are preserved
 * in the output as non-different chunks so the original formatting is retained.
 */
export function compareTextsAligned(
  text1: string,
  text2: string,
  options: CompareOptions = {}
): AlignedDiff[] {
  const {
    vowelInsensitive = false,
    ignoreWhiteSpace = false,
    normalizeTaaMarbuta = false,
    mode = 'letter',
  } = options;

  const aFull = buildUnits(text1, mode, vowelInsensitive, ignoreWhiteSpace, normalizeTaaMarbuta);
  const bFull = buildUnits(text2, mode, vowelInsensitive, ignoreWhiteSpace, normalizeTaaMarbuta);

  // Filter out skipped tokens for the diff itself, but remember their positions
  const a = aFull.filter((u) => !u.skipped);
  const b = bFull.filter((u) => !u.skipped);

  const diff = diffArrays(a.map((u) => u.key), b.map((u) => u.key));

  // Walk back through the original (including skipped) arrays to reconstruct text
  let aIdxFull = 0;
  let bIdxFull = 0;
  let aIdx = 0;
  let bIdx = 0;
  const chunks: AlignedDiff[] = [];

  // Helper: consume N non-skipped units from a side, also emitting any
  // skipped tokens encountered along the way as equal chunks.
  function consume(
    side: 'a' | 'b',
    count: number,
    target: 'text1' | 'text2'
  ): string {
    const full = side === 'a' ? aFull : bFull;
    let idxFull = side === 'a' ? aIdxFull : bIdxFull;
    let collected = '';
    let consumed = 0;
    let skippedBuffer = '';

    while (idxFull < full.length && consumed < count) {
      const u = full[idxFull];
      if (u.skipped) {
        skippedBuffer += u.raw;
      } else {
        collected += skippedBuffer + u.raw;
        skippedBuffer = '';
        consumed++;
      }
      idxFull++;
    }
    // Trailing skipped tokens are left for the next iteration

    if (side === 'a') aIdxFull = idxFull;
    else bIdxFull = idxFull;

    // Push back any trailing skipped buffer
    if (skippedBuffer) {
      // Rewind so skipped tokens are picked up next time
      if (side === 'a') aIdxFull -= countTrailingSkipped(full, idxFull);
      else bIdxFull -= countTrailingSkipped(full, idxFull);
    }

    void target;
    return collected;
  }

  function countTrailingSkipped(arr: Unit[], endIdx: number): number {
    let n = 0;
    for (let i = endIdx - 1; i >= 0 && arr[i].skipped; i--) n++;
    return n;
  }

  for (const part of diff) {
    const len = part.value.length;

    if (part.added) {
      const bText = consume('b', len, 'text2');
      chunks.push({ text1: '', text2: bText, isDifferent: true });
      bIdx += len;
    } else if (part.removed) {
      const aText = consume('a', len, 'text1');
      chunks.push({ text1: aText, text2: '', isDifferent: true });
      aIdx += len;
    } else {
      const aText = consume('a', len, 'text1');
      const bText = consume('b', len, 'text2');
      chunks.push({ text1: aText, text2: bText, isDifferent: false });
      aIdx += len;
      bIdx += len;
    }
  }

  // Append any trailing skipped tokens (e.g. trailing whitespace)
  let tail1 = '';
  while (aIdxFull < aFull.length && aFull[aIdxFull].skipped) {
    tail1 += aFull[aIdxFull++].raw;
  }
  let tail2 = '';
  while (bIdxFull < bFull.length && bFull[bIdxFull].skipped) {
    tail2 += bFull[bIdxFull++].raw;
  }
  if (tail1 || tail2) {
    chunks.push({ text1: tail1, text2: tail2, isDifferent: false });
  }

  return mergeChunks(chunks);
}

/**
 * Backward-compatible single-sided diff.
 */
export function compareTexts(
  text1: string,
  text2: string,
  options: CompareOptions = {}
): TextDiff[] {
  return compareTextsAligned(text1, text2, options)
    .filter((c) => c.text1 !== '')
    .map((c) => ({ text: c.text1, isDifferent: c.isDifferent }));
}