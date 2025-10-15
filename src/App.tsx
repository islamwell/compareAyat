import { useState, useEffect } from 'react';
import './App.css';
import AyahSelector from './components/AyahSelector';
import AyahDisplay from './components/AyahDisplay';
import Settings from './components/Settings';
import History from './components/History';
import { QuranService } from './quranService';
import { getSettings, saveSettings, getHistory, addToHistory, clearHistory, compareTexts } from './utils';
import type { ComparisonHistory } from './types';

function App() {
  const [surah1, setSurah1] = useState(1);
  const [ayah1, setAyah1] = useState(1);
  const [surah2, setSurah2] = useState(1);
  const [ayah2, setAyah2] = useState(2);
  
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  
  const [fontSize, setFontSize] = useState(getSettings().fontSize);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [vowelInsensitive, setVowelInsensitive] = useState(true);
  
  const [history, setHistory] = useState<ComparisonHistory[]>(getHistory());
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isQuranLoaded, setIsQuranLoaded] = useState(false);
  
  const quranService = QuranService.getInstance();

  useEffect(() => {
    setIsQuranLoaded(quranService.isDataLoaded());
  }, [quranService]);

  useEffect(() => {
    const newText1 = quranService.getAyah(surah1, ayah1);
    const newText2 = quranService.getAyah(surah2, ayah2);
    setText1(newText1);
    setText2(newText2);
    
    if (newText1 && newText2) {
      addToHistory({ surah: surah1, ayah: ayah1 }, { surah: surah2, ayah: ayah2 });
      setHistory(getHistory());
    }
  }, [surah1, ayah1, surah2, ayah2, quranService]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    saveSettings({ fontSize: size });
  };

  const handleDownloadQuran = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      await quranService.downloadQuran((progress) => {
        setDownloadProgress(progress);
      });
      setIsQuranLoaded(true);
      // Refresh the displayed ayahs
      setText1(quranService.getAyah(surah1, ayah1));
      setText2(quranService.getAyah(surah2, ayah2));
    } catch {
      alert('Failed to download Quran. Please check your internet connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectHistory = (item: ComparisonHistory) => {
    setSurah1(item.ayat1.surah);
    setAyah1(item.ayat1.ayah);
    setSurah2(item.ayat2.surah);
    setAyah2(item.ayat2.ayah);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const differences1 = compareTexts(text1, text2, vowelInsensitive);
  const differences2 = compareTexts(text2, text1, vowelInsensitive);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Compare Ayat</h1>
        <div className="header-buttons">
          <button onClick={() => setShowSettings(!showSettings)} className="header-button">
            {showSettings ? 'Hide' : 'Show'} Settings
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className="header-button">
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
      </header>

      {showSettings && (
        <Settings
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          highlightDifferences={highlightDifferences}
          onHighlightChange={setHighlightDifferences}
          vowelInsensitive={vowelInsensitive}
          onVowelInsensitiveChange={setVowelInsensitive}
          onDownloadQuran={handleDownloadQuran}
          isDownloading={isDownloading}
          downloadProgress={downloadProgress}
          isQuranLoaded={isQuranLoaded}
        />
      )}

      {showHistory && (
        <History
          history={history}
          onSelectHistory={handleSelectHistory}
          onClearHistory={handleClearHistory}
        />
      )}

      <div className="comparison-container">
        <div className="comparison-panel">
          <AyahSelector
            surah={surah1}
            ayah={ayah1}
            onSurahChange={setSurah1}
            onAyahChange={setAyah1}
            label="First Ayah"
          />
          <AyahDisplay
            text={text1}
            differences={differences1}
            fontSize={fontSize}
            highlightDifferences={highlightDifferences}
            label="Ayah 1"
          />
        </div>

        <div className="comparison-divider">VS</div>

        <div className="comparison-panel">
          <AyahSelector
            surah={surah2}
            ayah={ayah2}
            onSurahChange={setSurah2}
            onAyahChange={setAyah2}
            label="Second Ayah"
          />
          <AyahDisplay
            text={text2}
            differences={differences2}
            fontSize={fontSize}
            highlightDifferences={highlightDifferences}
            label="Ayah 2"
          />
        </div>
      </div>

      {!isQuranLoaded && (
        <div className="download-notice">
          ⚠️ Quran data not downloaded. Click "Download Quran for Offline" in Settings to enable comparison.
        </div>
      )}
    </div>
  );
}

export default App;
