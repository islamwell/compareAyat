import type { ComparisonHistory, Settings } from './types';
import { normalizeArabicText } from './quranService';

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

export const addToHistory = (ayat1: { surah: number; ayah: number }, ayat2: { surah: number; ayah: number }) => {
  try {
    const history = getHistory();
    const newEntry: ComparisonHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ayat1,
      ayat2,
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

export const getSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { fontSize: 24 };
  } catch {
    return { fontSize: 24 };
  }
};

export const saveSettings = (settings: Settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export interface TextDiff {
  text: string;
  isDifferent: boolean;
}

export const compareTexts = (text1: string, text2: string, vowelInsensitive: boolean): TextDiff[] => {
  const processText = vowelInsensitive ? normalizeArabicText : (t: string) => t;
  
  const normalized1 = processText(text1);
  const normalized2 = processText(text2);
  
  // Split into words for comparison
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  const normalizedWords1 = normalized1.split(/\s+/);
  const normalizedWords2 = normalized2.split(/\s+/);
  
  const result: TextDiff[] = [];
  const maxLength = Math.max(words1.length, words2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (i < words1.length) {
      const isDifferent = i >= normalizedWords2.length || normalizedWords1[i] !== normalizedWords2[i];
      result.push({ text: words1[i], isDifferent });
    }
  }
  
  return result;
};
