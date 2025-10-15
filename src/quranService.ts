import type { QuranData } from './types';
import { BISMILLAH } from './quranData';

const STORAGE_KEY = 'quran_data';
const DOWNLOAD_STATUS_KEY = 'quran_download_status';

// Tanzil API endpoint for simple-clean text (no diacritics marking)
const TANZIL_API = 'https://api.alquran.cloud/v1/quran/quran-simple-clean';

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
            this.quranData[key] = ayah.text;
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
  // Remove Arabic diacritics (tashkeel)
  // Fatha: ◌َ (U+064E)
  // Kasra: ◌ِ (U+0650)
  // Damma: ◌ُ (U+064F)
  // Sukun: ◌ْ (U+0652)
  // Shadda: ◌ّ (U+0651)
  // Tanween: ◌ً (U+064B), ◌ٌ (U+064C), ◌ٍ (U+064D)
  // Maddah: ◌ٓ (U+0653)
  // Hamza above/below: ◌ٔ (U+0654), ◌ٕ (U+0655)
  // Superscript Alef: ◌ٰ (U+0670)
  
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
};

export const normalizeArabicText = (text: string): string => {
  // Normalize different forms of Alef
  let normalized = text.replace(/[أإآ]/g, 'ا');
  
  // Normalize Taa Marbuta and Haa
  normalized = normalized.replace(/ة/g, 'ه');
  
  // Remove vowels
  normalized = removeVowels(normalized);
  
  return normalized;
};
