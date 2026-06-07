import React from 'react';
import type { ComparisonHistory } from '../types';

interface HistoryProps {
  history: ComparisonHistory[];
  onSelectHistory: (item: ComparisonHistory) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelectHistory, onClearHistory }) => {
  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2">
        <h3 className="text-gray-600 dark:text-gray-300 font-bold uppercase tracking-widest text-sm">Comparison Logs</h3>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="text-xs text-red-500 hover:text-red-400 uppercase tracking-widest font-bold transition-colors"
          >
            Purge Logs
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-400 text-sm font-mono text-center py-4">
          No logs found
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-all text-left group"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-300 font-mono tracking-wider">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center flex-wrap gap-2 mt-2">
                {(item.ayats || [item.ayat1, item.ayat2].filter(Boolean)).map((ayat, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <div className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-widest font-bold">VS</div>}
                    <div className={`border px-2 py-1 rounded text-sm font-mono font-bold group-hover:shadow-sm transition-all ${idx === 0 ? 'bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 dark:group-hover:shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 dark:group-hover:shadow-[0_0_8px_rgba(168,85,247,0.3)]'}`}>
                      {ayat!.surah}:{ayat!.ayah}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
