import React from 'react';
import type { ComparisonHistory } from '../types';
import { SURAH_INFO } from '../quranData';

interface HistoryProps {
  history: ComparisonHistory[];
  onSelectHistory: (item: ComparisonHistory) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelectHistory, onClearHistory }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSurahName = (surahNumber: number) => {
    const surah = SURAH_INFO.find(s => s.number === surahNumber);
    return surah ? surah.englishName : `Surah ${surahNumber}`;
  };

  const formatAyahRef = (surah: number, ayah: number) => {
    return `${getSurahName(surah)}:${ayah}`;
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>Comparison History</h3>
        {history.length > 0 && (
          <button onClick={onClearHistory} className="clear-button">
            Clear History
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <p className="empty-message">No comparison history yet</p>
      ) : (
        <div className="history-list">
          {history.map(item => (
            <div
              key={item.id}
              className="history-item"
              onClick={() => onSelectHistory(item)}
            >
              <div className="history-comparison">
                <span className="history-ayah">
                  {formatAyahRef(item.ayat1.surah, item.ayat1.ayah)}
                </span>
                <span className="history-vs">vs</span>
                <span className="history-ayah">
                  {formatAyahRef(item.ayat2.surah, item.ayat2.ayah)}
                </span>
              </div>
              <div className="history-date">{formatDate(item.timestamp)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
