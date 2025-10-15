import React from 'react';
import { SURAH_INFO } from '../quranData';

interface AyahSelectorProps {
  surah: number;
  ayah: number;
  onSurahChange: (surah: number) => void;
  onAyahChange: (ayah: number) => void;
  label: string;
}

const AyahSelector: React.FC<AyahSelectorProps> = ({
  surah,
  ayah,
  onSurahChange,
  onAyahChange,
  label,
}) => {
  const currentSurah = SURAH_INFO.find(s => s.number === surah);
  const maxAyah = currentSurah ? currentSurah.numberOfAyahs : 0;

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSurah = parseInt(e.target.value);
    onSurahChange(newSurah);
    // Reset ayah to 1 when surah changes
    onAyahChange(1);
  };

  const handleAyahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onAyahChange(parseInt(e.target.value));
  };

  // Generate ayah options including 0 for bismillah (except Fatiha and Tawbah)
  const ayahOptions = [];
  if (surah !== 1 && surah !== 9) {
    ayahOptions.push(
      <option key={0} value={0}>
        0 - Bismillah
      </option>
    );
  }
  for (let i = 1; i <= maxAyah; i++) {
    ayahOptions.push(
      <option key={i} value={i}>
        {i}
      </option>
    );
  }

  return (
    <div className="ayah-selector">
      <label className="selector-label">{label}</label>
      <div className="selector-controls">
        <div className="control-group">
          <label>Surah:</label>
          <select value={surah} onChange={handleSurahChange} className="select-input">
            {SURAH_INFO.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Ayah:</label>
          <select value={ayah} onChange={handleAyahChange} className="select-input">
            {ayahOptions}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AyahSelector;
