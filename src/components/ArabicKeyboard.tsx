import React, { useState } from 'react';

interface ArabicKeyboardProps {
  onKeyPress: (char: string) => void;
}

const ARABIC_LETTERS = [
  'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د',
  'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط',
  'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ',
  'أ', 'إ', 'آ', 'ذ'
];

export const ArabicKeyboard: React.FC<ArabicKeyboardProps> = ({ onKeyPress }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 flex flex-col items-end w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest hover:text-cyan-500 transition-colors flex items-center gap-1"
      >
        {isOpen ? 'Close Keyboard' : 'Open Arabic Keyboard ⌨️'}
      </button>
      
      {isOpen && (
        <div className="w-full mt-2 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md" dir="rtl">
          <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
            {ARABIC_LETTERS.map(char => (
              <button
                key={char}
                onClick={(e) => {
                  e.preventDefault();
                  onKeyPress(char);
                }}
                className="w-8 h-8 md:w-10 md:h-10 text-lg md:text-xl font-bold font-[Amiri_Quran] flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-gray-200 dark:border-gray-700 rounded transition-colors text-gray-800 dark:text-gray-200"
              >
                {char}
              </button>
            ))}
            <button
               onClick={(e) => {
                 e.preventDefault();
                 onKeyPress(' ');
               }}
               className="h-8 md:h-10 px-8 text-sm font-bold flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-gray-200 dark:border-gray-700 rounded transition-colors text-gray-800 dark:text-gray-200"
            >
              SPACE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
