import React from 'react';

interface SettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  highlightDifferences: boolean;
  onHighlightChange: (highlight: boolean) => void;
  vowelInsensitive: boolean;
  onVowelInsensitiveChange: (insensitive: boolean) => void;
  onDownloadQuran: () => void;
  isDownloading: boolean;
  downloadProgress: number;
  isQuranLoaded: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  fontSize,
  onFontSizeChange,
  highlightDifferences,
  onHighlightChange,
  vowelInsensitive,
  onVowelInsensitiveChange,
  onDownloadQuran,
  isDownloading,
  downloadProgress,
  isQuranLoaded,
}) => {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      
      <div className="setting-group">
        <label>
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="16"
          max="48"
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={highlightDifferences}
            onChange={(e) => onHighlightChange(e.target.checked)}
          />
          <span>Highlight Differences</span>
        </label>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={vowelInsensitive}
            onChange={(e) => onVowelInsensitiveChange(e.target.checked)}
          />
          <span>Vowel Insensitive (Fatha, Kasra, Damma)</span>
        </label>
      </div>

      <div className="setting-group">
        {!isQuranLoaded ? (
          <button
            onClick={onDownloadQuran}
            disabled={isDownloading}
            className="download-button"
          >
            {isDownloading ? `Downloading... ${downloadProgress.toFixed(0)}%` : 'Download Quran for Offline'}
          </button>
        ) : (
          <div className="download-status">
            ✓ Quran Downloaded (Offline Mode Available)
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
