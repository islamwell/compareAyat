import type { QuranData } from './types';
import { BISMILLAH } from './quranData';

const STORAGE_KEY = 'quran_data';
const DOWNLOAD_STATUS_KEY = 'quran_download_status';

// Tanzil API endpoint for simple-clean text (no diacritics marking)
const TANZIL_API = 'https://api.alquran.cloud/v1/quran/quran-simple';

// Sample data for demonstration purposes
const SAMPLE_DATA: QuranData = {
  '1:1': 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',
  '1:2': 'ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِینَ',
  '1:3': 'ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',
  '1:4': 'مَـٰلِكِ یَوۡمِ ٱلدِّینِ',
  '1:5': 'إِیَّاكَ نَعۡبُدُ وَإِیَّاكَ نَسۡتَعِینُ',
  '1:6': 'ٱهۡدِنَا ٱلصِّرَ ٰطَ ٱلۡمُسۡتَقِیمَ',
  '1:7': 'صِرَ ٰطَ ٱلَّذِینَ أَنۡعَمۡتَ عَلَیۡهِمۡ غَیۡرِ ٱلۡمَغۡضُوبِ عَلَیۡهِمۡ وَلَا ٱلضَّاۤلِّینَ',
  '2:1': 'الم',
  '2:2': 'ذَ ٰلِكَ ٱلۡكِتَـٰبُ لَا رَیۡبَ ۛ فِیهِ ۛ هُدࣰى لِّلۡمُتَّقِینَ',
  '2:3': 'ٱلَّذِینَ یُؤۡمِنُونَ بِٱلۡغَیۡبِ وَیُقِیمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقۡنَـٰهُمۡ یُنفِقُونَ',
  '2:255': 'ٱللَّهُ لَاۤ إِلَـٰهَ إِلَّا هُوَ ٱلۡحَیُّ ٱلۡقَیُّومُۚ لَا تَأۡخُذُهُۥ سِنَةࣱ وَلَا نَوۡمࣱۚ لَّهُۥ مَا فِی ٱلسَّمَـٰوَ ٰتِ وَمَا فِی ٱلۡأَرۡضِۗ مَن ذَا ٱلَّذِی یَشۡفَعُ عِندَهُۥۤ إِلَّا بِإِذۡنِهِۦۚ یَعۡلَمُ مَا بَیۡنَ أَیۡدِیهِمۡ وَمَا خَلۡفَهُمۡۖ وَلَا یُحِیطُونَ بِشَیۡءࣲ مِّنۡ عِلۡمِهِۦۤ إِلَّا بِمَا شَاۤءَۚ وَسِعَ كُرۡسِیُّهُ ٱلسَّمَـٰوَ ٰتِ وَٱلۡأَرۡضَۖ وَلَا یَـُٔودُهُۥ حِفۡظُهُمَاۚ وَهُوَ ٱلۡعَلِیُّ ٱلۡعَظِیمُ',
  '112:1': 'قُلۡ هُوَ ٱللَّهُ أَحَدٌ',
  '112:2': 'ٱللَّهُ ٱلصَّمَدُ',
  '112:3': 'لَمۡ یَلِدۡ وَلَمۡ یُولَدۡ',
  '112:4': 'وَلَمۡ یَكُن لَّهُۥ كُفُوًا أَحَدُۢ',
  '113:1': 'قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ',
  '113:2': 'مِن شَرِّ مَا خَلَقَ',
  '113:3': 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
  '113:4': 'وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِی ٱلۡعُقَدِ',
  '113:5': 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
  '114:1': 'قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
  '114:2': 'مَلِكِ ٱلنَّاسِ',
  '114:3': 'إِلَـٰهِ ٱلنَّاسِ',
  '114:4': 'مِن شَرِّ ٱلۡوَسۡوَاسِ ٱلۡخَنَّاسِ',
  '114:5': 'ٱلَّذِی یُوَسۡوِسُ فِی صُدُورِ ٱلنَّاسِ',
  '114:6': 'مِنَ ٱلۡجِنَّةِ وَٱلنَّاسِ',
};

export class QuranService {
  private static instance: QuranService;
  private quranData: QuranData = {};
  private isLoaded = false;

  private constructor() {
    this.loadFromStorage();
    // Load sample data if no data exists
    if (Object.keys(this.quranData).length === 0) {
      this.quranData = { ...SAMPLE_DATA };
      this.isLoaded = true;
    }
    // Try loading a public plain-quran file if available (non-blocking)
    this.loadFromPublic().catch(() => {
      // ignore — we'll fallback to API on demand
      // console.debug('No public quran file loaded', e);
    });
  }

  static getInstance(): QuranService {
    if (!QuranService.instance) {
      QuranService.instance = new QuranService();
    }
    return QuranService.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.quranData = JSON.parse(stored);
        
        // Detect if cached data is clean text (missing diacritics)
        let cleanTextDetected = false;
        const sampleKeys = Object.keys(this.quranData).slice(0, 50);
        if (sampleKeys.length > 0) {
          let diacriticCount = 0;
          sampleKeys.forEach(k => {
            if (/[\u064B-\u065F\u0670]/.test(this.quranData[k])) {
              diacriticCount++;
            }
          });
          if (diacriticCount / sampleKeys.length < 0.1) {
            cleanTextDetected = true;
          }
        }

        if (cleanTextDetected) {
          console.log('Old clean database detected in cache. Clearing cache for reload.');
          this.quranData = {};
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(DOWNLOAD_STATUS_KEY);
          return;
        }

        // Reprocess ayah 1 to strip Bismillah if not already done
        for (const key in this.quranData) {
          const [, ayahStr] = key.split(':');
          const ayahNum = parseInt(ayahStr, 10);
          if (ayahNum === 1) {
            this.quranData[key] = this.stripBismillah(this.quranData[key]);
          }
        }
        this.saveToStorage(); // Save the updated data
        this.isLoaded = true;
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quranData));
      localStorage.setItem(DOWNLOAD_STATUS_KEY, 'complete');
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async downloadQuran(onProgress?: (progress: number) => void): Promise<void> {
    try {
      const response = await fetch(TANZIL_API);
      const data = await response.json();

      if (data.code === 200 && data.data && data.data.surahs) {
        const surahs = data.data.surahs as Array<{
          number: number;
          ayahs: Array<{ numberInSurah: number; text: string }>;
        }>;
        let totalAyahs = 0;
        let processedAyahs = 0;

        // Count total ayahs
        surahs.forEach((surah) => {
          totalAyahs += surah.ayahs.length;
        });

        // Process each surah and ayah
        surahs.forEach((surah) => {
          surah.ayahs.forEach((ayah) => {
            const key = `${surah.number}:${ayah.numberInSurah}`;
            let text = ayah.text;
            if (ayah.numberInSurah === 1) {
              text = this.stripBismillah(text);
            }
            this.quranData[key] = text;
            processedAyahs++;
            if (onProgress) {
              onProgress((processedAyahs / totalAyahs) * 100);
            }
          });
        });

        this.isLoaded = true;
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error downloading Quran:', error);
      throw error;
    }
  }

  /**
   * Fetch a single surah from the API and cache its ayahs locally.
   * Returns true if any ayahs were added to the cache.
   */
  async downloadSurah(surahNumber: number): Promise<boolean> {
    try {
      const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-simple`;
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.code === 200 && json.data && json.data.ayahs) {
        const ayahs = json.data.ayahs as Array<{ numberInSurah: number; text: string }>;
        ayahs.forEach((ayah) => {
          const key = `${surahNumber}:${ayah.numberInSurah}`;
          let text = ayah.text;
          if (ayah.numberInSurah === 1) {
            text = this.stripBismillah(text);
          }
          this.quranData[key] = text;
        });
        this.isLoaded = true;
        this.saveToStorage();
        return true;
      }
    } catch (error) {
      console.error('Error downloading surah:', error);
    }
    return false;
  }

  /**
   * Async getter for a single ayah. If the ayah is not present in the local cache,
   * this will attempt to fetch the entire surah from the API and then return the ayah.
   */
  async getAyahAsync(surah: number, ayah: number): Promise<string> {
    // Handle special ayah 0 cases
    if (ayah === 0) {
      if (surah === 1) {
        return '';
      } else if (surah === 9) {
        return '';
      } else {
        return BISMILLAH;
      }
    }

    const key = `${surah}:${ayah}`;
    if (this.quranData[key]) {
      return this.quranData[key];
    }

    // Try to download the surah and cache it
    const ok = await this.downloadSurah(surah);
    if (ok && this.quranData[key]) {
      return this.quranData[key];
    }

    // As a last resort, try fetching a single ayah endpoint
    try {
      const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-simple`;
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.code === 200 && json.data && json.data.text) {
        let text = json.data.text;
        if (ayah === 1) {
          text = this.stripBismillah(text);
        }
        this.quranData[key] = text;
        this.saveToStorage();
        return this.quranData[key];
      }
    } catch (error) {
      console.error('Error fetching ayah:', error);
    }

    return '';
  }

  /**
   * Try to load a plain quran text file placed in the public folder at
   * /quran-simple-min.txt with lines in the format: surah|ayah|text
   */
  async loadFromPublic(): Promise<void> {
    try {
      const url = '/quran-simple-min.txt';
      const resp = await fetch(url);
      if (!resp.ok) return;
      const txt = await resp.text();
      const lines = txt.split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        if (parts.length < 3) continue;
        const surah = parseInt(parts[0], 10);
        const ayah = parseInt(parts[1], 10);
        let text = parts.slice(2).join('|').trim();

        // For non-Fatiha surahs, remove Bismillah if it appears at start
        if (surah !== 1 && ayah === 1) {
          text = this.stripBismillah(text);
        }

        const key = `${surah}:${ayah}`;
        if (text) {
          this.quranData[key] = text;
        }
      }

      // mark loaded if we've populated significant entries
      if (Object.keys(this.quranData).length > 10) {
        this.isLoaded = true;
        this.saveToStorage();
      }
    } catch {
      // ignore
    }
  }

  private stripBismillah(text: string): string {
    // Remove common diacritics for easier matching
    const deVowel = (t: string) => t.replace(/[\u064B-\u065F\u0670]/g, '');
    const normalized = deVowel(text).replace(/\s+/g, ' ').trim();

    // Check for exact Bismillah phrase
    if (normalized.startsWith('بسم الله الرحمن الرحيم')) {
      // It's exactly 4 words, so strip the first 4 tokens from the original text
      const parts = text.trim().split(/\s+/);
      return parts.slice(4).join(' ').replace(/^[:-|\s]+/, '').trim();
    }

    return text;
  }

  searchAyahs(query: string): { surah: number; ayah: number; text: string }[] {
    const results: { surah: number; ayah: number; text: string }[] = [];
    if (!query || query.trim() === '') return results;
    
    // Use the normalized version
    const normalizedQuery = normalizeArabicText(query);

    for (const [key, text] of Object.entries(this.quranData)) {
      if (normalizeArabicText(text).includes(normalizedQuery)) {
        const [surahStr, ayahStr] = key.split(':');
        results.push({ surah: parseInt(surahStr, 10), ayah: parseInt(ayahStr, 10), text });
      }
    }
    return results;
  }

  getAyah(surah: number, ayah: number): string {
    // Handle ayah 0 as bismillah (except for Surah Al-Fatiha and At-Tawbah)
    if (ayah === 0) {
      if (surah === 1) {
        // In Fatiha, ayah 0 doesn't exist, bismillah is ayah 1
        return '';
      } else if (surah === 9) {
        // Surah At-Tawbah doesn't have bismillah
        return '';
      } else {
        return BISMILLAH;
      }
    }

    const key = `${surah}:${ayah}`;
    return this.quranData[key] || '';
  }

  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  getDownloadStatus(): string {
    return localStorage.getItem(DOWNLOAD_STATUS_KEY) || 'not_started';
  }
}

export const removeVowels = (text: string): string => {
  // Remove Arabic diacritics (tashkeel) and Quranic symbols/signs
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g, '');
};

export const normalizeArabicText = (text: string): string => {
  if (!text) return '';
  
  // Normalize different forms of Alef, including Alef Wasla
  let normalized = text.replace(/[أإآٱ]/g, 'ا');
  
  // Normalize Taa Marbuta and Haa
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Yehs (Farsi Yeh / Alef Maksura to standard Arabic Yeh)
  normalized = normalized.replace(/[ىی]/g, 'ي');
  
  // Remove vowels and Quranic symbols
  normalized = removeVowels(normalized);
  
  return normalized;
};
