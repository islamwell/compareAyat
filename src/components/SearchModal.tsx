import { useState, useEffect } from 'react';
import { surahNames } from '../surahNames';

export interface SearchMatch {
  surah: number;
  ayah: number;
  text: string;
}

interface SearchModalProps {
  matches: SearchMatch[];
  onClose: () => void;
  onCompare: (selected: SearchMatch[]) => void;
  theme: 'dark' | 'light';
}

export default function SearchModal({ matches, onClose, onCompare, theme }: SearchModalProps) {
  // By default, select the first 10 matches so the user doesn't have to manually check them if they just want a quick comparison.
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set(matches.slice(0, 10).map((_, i) => i)));

  // Reset selections if matches change
  useEffect(() => {
    setSelectedIndices(new Set(matches.slice(0, 10).map((_, i) => i)));
  }, [matches]);

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  const selectAll = () => {
    setSelectedIndices(new Set(matches.map((_, i) => i)));
  };

  const clearAll = () => {
    setSelectedIndices(new Set());
  };

  const handleCompare = () => {
    const selected = matches.filter((_, i) => selectedIndices.has(i));
    onCompare(selected);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Search Matches <span className="text-sm font-normal text-gray-500">({matches.length} found)</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <button onClick={selectAll} className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 hover:underline">Select All</button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button onClick={clearAll} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:underline">Clear All</button>
          <div className="flex-1"></div>
          <span className="text-xs font-bold text-gray-500">{selectedIndices.size} selected</span>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {matches.map((match, index) => {
            const isSelected = selectedIndices.has(index);
            return (
              <div 
                key={`${match.surah}-${match.ayah}-${index}`}
                onClick={() => toggleSelection(index)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' 
                    : 'border-gray-200 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700 bg-white dark:bg-gray-950'
                }`}
              >
                <div className="pt-1">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-500 mb-2 font-mono uppercase tracking-widest">
                    Surah {match.surah} : Ayah {match.ayah} &mdash; <span className="text-cyan-600 dark:text-cyan-400">{surahNames[match.surah - 1]}</span>
                  </div>
                  <div className="text-right text-gray-800 dark:text-gray-200 text-xl md:text-2xl" dir="rtl" style={{ fontFamily: '"Amiri Quran", serif' }}>
                    {match.text}
                  </div>
                </div>
              </div>
            );
          })}
          {matches.length === 0 && (
            <div className="text-center text-gray-500 py-10">No matches found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={selectedIndices.size === 0}
            className={`px-6 py-2.5 rounded font-bold uppercase tracking-widest text-sm transition-all ${
              selectedIndices.size > 0 
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg' 
                : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Compare Selected ({selectedIndices.size})
          </button>
        </div>
      </div>
    </div>
  );
}
