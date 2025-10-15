export interface Ayat {
  surah: number;
  ayah: number;
  text: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

export interface ComparisonHistory {
  id: string;
  timestamp: number;
  ayat1: { surah: number; ayah: number };
  ayat2: { surah: number; ayah: number };
}

export interface Settings {
  fontSize: number;
}

export interface QuranData {
  [key: string]: string; // key format: "surah:ayah"
}
