import React from 'react';
import { surahNames } from '../surahNames';

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
  const handleSurahChange = (s: number) => onSurahChange(Math.max(1, Math.min(114, s)));
  const handleAyahChange = (a: number) => onAyahChange(Math.max(1, a));

  return (
    <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 dark:bg-gray-900/30 px-2 py-1.5 rounded-md border border-gray-200/50 dark:border-gray-800/50 w-fit">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest hidden md:inline">
          {label.split(' ')[0]}
        </span>
        
        <div className="flex items-center gap-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => handleSurahChange(surah - 1)}
            className="px-1.5 py-0.5 text-gray-700 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            -
          </button>
          <div className="relative group flex items-center">
            <span className="text-xs text-gray-600 absolute left-1 pointer-events-none opacity-50 font-mono">S</span>
            <input 
              type="number" 
              min="1" 
              max="114" 
              value={surah}
              onChange={(e) => onSurahChange(parseInt(e.target.value) || 1)}
              title={surahNames[surah - 1]}
              className="w-14 bg-transparent text-gray-800 dark:text-gray-100 py-0.5 pl-4 pr-1 text-center font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-sm"
            />
          </div>
          <button 
            onClick={() => handleSurahChange(surah + 1)}
            className="px-1.5 py-0.5 text-gray-500 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <span className="text-gray-500 dark:text-gray-500 font-bold">:</span>

      <div className="flex items-center gap-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => handleAyahChange(ayah - 1)}
          className="px-1.5 py-0.5 text-gray-500 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          -
        </button>
        <div className="relative group flex items-center">
          <span className="text-xs text-gray-400 absolute left-1 pointer-events-none opacity-50 font-mono">A</span>
          <input 
            type="number" 
            min="1"
            value={ayah}
            onChange={(e) => onAyahChange(parseInt(e.target.value) || 1)}
            className="w-14 bg-transparent text-gray-800 dark:text-gray-100 py-0.5 pl-4 pr-1 text-center font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded-sm"
          />
        </div>
        <button 
          onClick={() => handleAyahChange(ayah + 1)}
          className="px-1.5 py-0.5 text-gray-700 hover:text-cyan-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          +
        </button>
      </div>

      <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-[100px] ml-1" title={surahNames[surah - 1]}>
        {surahNames[surah - 1]}
      </span>
    </div>
  );
};

export default AyahSelector;
