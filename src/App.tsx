import { useState, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import SettingsComponent from './components/Settings';
import History from './components/History';
import FeedCard from './components/FeedCard';
import SearchModal from './components/SearchModal';
import type { SearchMatch } from './components/SearchModal';
import type { AyahFeedData } from './components/FeedCard';
import { QuranService } from './quranService';
import { addToHistory, getHistory, clearHistory, getSettings, saveSettings, getSearchHistory, addSearchHistory, clearSearchHistory } from './utils';
import type { ComparisonHistory } from './types';
import type { Settings } from './utils';
import html2canvas from 'html2canvas';

export default function App() {
  const quranService = QuranService.getInstance();

  const [settings, setSettingsState] = useState<Settings>(getSettings());
  
  // State for N-verses
  const [feeds, setFeeds] = useState<AyahFeedData[]>([
    { id: 'feed_1', surah: 1, ayah: 1 },
    { id: 'feed_2', surah: 1, ayah: 2 }
  ]);

  const [globalSearch, setGlobalSearch] = useState('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [history, setHistory] = useState<ComparisonHistory[]>(getHistory());
  const [undoStack, setUndoStack] = useState<{ feed: AyahFeedData, index: number }[]>([]);
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory());
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isOfflineReady = quranService.isDataLoaded();

  const [playingFeedId, setPlayingFeedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  const fetchAyah = useCallback(async (surah: number, ayah: number) => {
    try {
      if (ayah === 0 && surah !== 1 && surah !== 9) {
        return 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
      } else if (ayah === 0) {
        return '';
      }
      return await quranService.getAyahAsync(surah, ayah) || '';
    } catch (e) {
      console.error('Error fetching ayah', e);
      return '';
    }
  }, [quranService]);

  const syncFeeds = useCallback(async () => {
    const feedsToSync = feeds.filter(f => f.text === undefined && !f.loading);
    if (feedsToSync.length === 0) return;

    setFeeds(prev => prev.map(f => f.text === undefined && !f.loading ? { ...f, loading: true } : f));

    const fetches = feedsToSync.map(async (feed) => {
      const text = await fetchAyah(feed.surah, feed.ayah);
      return { id: feed.id, text };
    });

    const results = await Promise.all(fetches);
    const resultMap = new Map(results.map(r => [r.id, r.text]));

    setFeeds(prev => prev.map(f => resultMap.has(f.id) ? { ...f, text: resultMap.get(f.id), loading: false } : f));
  }, [feeds, fetchAyah]);

  // Initial Sync and dependency on feed surah/ayah changes
  useEffect(() => {
    const needsSync = feeds.some(f => f.text === undefined && !f.loading);
    if (needsSync) {
      syncFeeds();
    }
  }, [feeds, syncFeeds]);

  // Theme Applier
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Global Search Handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (globalSearch.trim().length > 2) {
        // If query is numbers e.g. "2:255"
        const match = globalSearch.match(/^(\d+)[\s:]+(\d+)$/);
        if (match) {
          const s = parseInt(match[1]);
          const a = parseInt(match[2]);
          if (s >= 1 && s <= 114) {
            setFeeds([{ id: `feed_${Date.now()}`, surah: s, ayah: a }]);
          }
        } else {
          // Text Search
          const results = quranService.searchAyahs(globalSearch);
          setSearchMatches(results);

          if (results.length > 0) {
            const top9 = results.slice(0, 9);
            
            let shortestIdx = 0;
            let minLen = Infinity;
            top9.forEach((res, idx) => {
              const len = res.text.replace(/\s+/g, '').length;
              if (len < minLen) {
                minLen = len;
                shortestIdx = idx;
              }
            });

            const shortest = top9[shortestIdx];
            const rest = top9.filter((_, idx) => idx !== shortestIdx);
            const newFeedsData = [shortest, ...rest];

            const newFeeds = newFeedsData.map((res, idx) => ({
              id: `search_${res.surah}_${res.ayah}_${Date.now()}_${idx}`,
              surah: res.surah,
              ayah: res.ayah,
              text: res.text,
              loading: false
            }));
            setFeeds(newFeeds);
          }
        }
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [globalSearch, quranService]);

  const updateFeed = useCallback((id: string, surah: number, ayah: number) => {
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, surah, ayah, text: undefined } : f));
  }, []);

  const updateFeedText = useCallback((id: string, text: string) => {
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, text } : f));
  }, []);

  const handleCompareMatches = useCallback((selectedMatches: SearchMatch[]) => {
    const newFeeds = selectedMatches.map((res, idx) => ({
      id: `match_${res.surah}_${res.ayah}_${Date.now()}_${idx}`,
      surah: res.surah,
      ayah: res.ayah,
      text: res.text,
      loading: false
    }));
    setFeeds(newFeeds);
    setIsSearchModalOpen(false);
  }, []);

  const removeFeed = useCallback((id: string) => {
    if (feeds.length <= 1) return;
    const index = feeds.findIndex(f => f.id === id);
    if (index === -1) return;
    
    const feedToRemove = feeds[index];
    setUndoStack(stack => [...stack, { feed: feedToRemove, index }]);
    setFeeds(feeds.filter(f => f.id !== id));
  }, [feeds]);

  const undoRemove = useCallback(() => {
    if (undoStack.length === 0) return;
    
    // Extract the last item without a state updater callback to avoid StrictMode double-execution issues
    const last = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    setFeeds(currentFeeds => {
      const newFeeds = [...currentFeeds];
      // Generate a new ID to force a clean React mount and guarantee no duplicate keys
      const restoredFeed = { ...last.feed, id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` };
      newFeeds.splice(last.index, 0, restoredFeed);
      return newFeeds;
    });
  }, [undoStack]);

  const addEmptyFeed = useCallback(() => {
    setFeeds(prev => {
      const lastFeed = prev[prev.length - 1];
      return [...prev, { 
        id: `feed_${Date.now()}`, 
        surah: lastFeed ? lastFeed.surah : 1, 
        ayah: lastFeed ? lastFeed.ayah + 1 : 1 
      }];
    });
  }, []);

  const handleSave = useCallback(() => {
    if (feeds.length >= 2) {
      addToHistory(
        { surah: feeds[0].surah, ayah: feeds[0].ayah }, 
        { surah: feeds[1].surah, ayah: feeds[1].ayah }
      );
      setHistory(getHistory());
      setToastMessage('Data Logged Successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, [feeds]);

  const handleExportHtml = useCallback(() => {
    if (feeds.length === 0) return;
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Compare Ayat Export</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #fff; color: #000; }
          .card { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
          .text { font-family: "Amiri Quran", serif; font-size: 28px; direction: rtl; text-align: right; line-height: 2.5; }
          .meta { color: #666; font-size: 14px; margin-bottom: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <h1>Ayat Comparison Export</h1>
        <p>Exported on: ${new Date().toLocaleString()}</p>
        <hr style="margin-bottom: 30px; border: none; border-top: 1px solid #ccc;" />
    `;

    feeds.forEach((feed, idx) => {
      htmlContent += `
        <div class="card">
          <div class="meta">${idx === 0 ? 'Master Reference' : 'Comparison'} &mdash; Surah ${feed.surah}, Ayah ${feed.ayah}</div>
          <div class="text">${feed.text || ''}</div>
        </div>
      `;
    });

    htmlContent += `
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ayat_Compare_Export_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToastMessage('Exported HTML Successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  }, [feeds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focused in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undoRemove();
      }
      
      // Alt+N for new feed
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        addEmptyFeed();
      }

      // Ctrl+S for saving
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // / for search
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoRemove, addEmptyFeed, handleSave]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await quranService.downloadQuran();
    } catch (e) {
      console.error('Download failed', e);
      alert('Failed to initialize local data matrix.');
    }
    setIsDownloading(false);
  };

  const handleExportImage = async () => {
    const element = document.getElementById('ayat-compare-container');
    if (!element) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#030712' }); // bg-gray-950
      const link = document.createElement('a');
      link.download = `ayat-matrix-export.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Failed to export image', e);
      alert('Failed to generate visualization export.');
    }
    setIsExporting(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleSelectHistory = (item: ComparisonHistory) => {
    setFeeds([
      { id: `feed_${Date.now()}_1`, surah: item.ayat1.surah, ayah: item.ayat1.ayah },
      { id: `feed_${Date.now()}_2`, surah: item.ayat2.surah, ayah: item.ayat2.ayah }
    ]);
    setGlobalSearch('');
  };

  useEffect(() => {
    if (!playingFeedId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const feedIndex = feeds.findIndex(f => f.id === playingFeedId);
    if (feedIndex === -1) {
      setPlayingFeedId(null);
      return;
    }

    const feed = feeds[feedIndex];
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const surahStr = feed.surah.toString().padStart(3, '0');
    const ayahStr = feed.ayah.toString().padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/Husary_128kbps/${surahStr}${ayahStr}.mp3`;
    
    audioRef.current = new Audio(audioUrl);
    
    audioRef.current.onended = () => {
      // Find current index again in case feeds changed
      const currentIndex = feeds.findIndex(f => f.id === playingFeedId);
      if (currentIndex !== -1 && currentIndex + 1 < feeds.length) {
        setPlayingFeedId(feeds[currentIndex + 1].id);
      } else {
        setPlayingFeedId(null);
      }
    };
    
    audioRef.current.onerror = () => {
      setPlayingFeedId(null);
    };

    audioRef.current.play().catch(() => {
      setPlayingFeedId(null);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [playingFeedId, feeds]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(feeds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFeeds(items);
  };

  const referenceFeed = feeds[0] || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans selection:bg-cyan-200 dark:selection:bg-cyan-900 selection:text-cyan-900 dark:selection:text-cyan-100 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 transition-colors duration-300">
          <div className="text-center md:text-left mb-4 md:mb-0 flex flex-col gap-1">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-500 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              Ayat Compare
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-bold tracking-widest mt-2 uppercase">Advanced Quranic Analysis Matrix</p>
            <div className="inline-flex items-center gap-3 mt-4 text-[11px] font-mono font-bold bg-white text-black px-3 py-1.5 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-gray-300 dark:border-gray-500 max-w-fit">
              <span>v{typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : '0.0.0'}</span>
              <span className="text-gray-600">•</span>
              <span>BUILD: {typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'DEV'}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-4">
              <button
                onClick={() => alert('Keyboard Shortcuts:\n\nCtrl+Z : Undo close card\nCtrl+N : Add new feed\nCtrl+S : Log Data to History\n/ : Focus Global Search')}
                className="text-xs font-mono text-cyan-600 dark:text-cyan-400 tracking-wider hover:underline"
              >
                [?] Shortcuts
              </button>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isOfflineReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300 tracking-wider">SYS.STATUS</span>
              </div>
            </div>
          </div>
        </header>

        {/* Top Controls & Settings */}
        <section className="space-y-6">
          
          {/* Global Search Bar */}
          <div className="relative">
            <input 
              id="global-search-input"
              type="text" 
              className="w-full bg-white dark:bg-gray-900 border-2 border-cyan-300 dark:border-cyan-500/50 text-cyan-900 dark:text-cyan-100 p-4 rounded-lg shadow-sm dark:shadow-[inset_0_0_20px_rgba(0,255,255,0.05)] focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:shadow-md dark:focus:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all placeholder-gray-400 dark:placeholder-gray-600 font-bold text-lg"
              placeholder="GLOBAL SEARCH: Enter Arabic phrase (e.g. إِنّا أَعتَدنا) or reference (e.g. 2:255)... [Shortcut: /]" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              dir={/[a-zA-Z]/.test(globalSearch) ? "ltr" : "rtl"}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearch.trim()) {
                  addSearchHistory(globalSearch);
                  setSearchHistory(getSearchHistory());
                  if (searchMatches.length > 0) setIsSearchModalOpen(true);
                }
              }}
            />
            {isSearchFocused && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Searches</span>
                  <button 
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearSearchHistory();
                      setSearchHistory([]);
                    }} 
                    className="text-xs text-red-500 hover:text-red-600 font-bold tracking-wider"
                  >
                    CLEAR
                  </button>
                </div>
                <ul>
                  {searchHistory.map((term, idx) => (
                    <li key={idx}>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setGlobalSearch(term);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center justify-between"
                      >
                        <span dir={/[a-zA-Z]/.test(term) ? "ltr" : "rtl"} className="text-lg" style={{ fontFamily: /[a-zA-Z]/.test(term) ? 'inherit' : '"Amiri Quran", serif' }}>
                          {term}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button 
              onClick={syncFeeds} 
              className="px-6 py-2 bg-white dark:bg-gray-900 border border-cyan-400 dark:border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:bg-cyan-50 dark:hover:bg-cyan-950 dark:hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
            >
              Sync Feeds
            </button>
            <button 
              onClick={addEmptyFeed} 
              className="px-6 py-2 bg-white dark:bg-gray-900 border border-purple-400 dark:border-purple-500 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:bg-purple-50 dark:hover:bg-purple-950 dark:hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
            >
              + Add Feed
            </button>
            {undoStack.length > 0 && (
              <button 
                onClick={undoRemove} 
                className="px-6 py-2 bg-white dark:bg-gray-900 border border-yellow-400 dark:border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:bg-yellow-50 dark:hover:bg-yellow-950 transition-all"
                title="Undo Close (Ctrl+Z)"
              >
                Undo Close
              </button>
            )}
            <button 
              onClick={handleSave} 
              className="px-6 py-2 bg-white dark:bg-gray-900 border border-orange-400 dark:border-orange-500 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(249,115,22,0.2)] hover:bg-orange-50 dark:hover:bg-orange-950 dark:hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
            >
              Log Data
            </button>
            <button 
              onClick={handleExportImage} 
              disabled={isExporting} 
              className="px-6 py-2 bg-white dark:bg-gray-900 border border-pink-400 dark:border-pink-500 text-pink-600 dark:text-pink-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(236,72,153,0.2)] hover:bg-pink-50 dark:hover:bg-pink-950 dark:hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all disabled:opacity-50"
            >
              {isExporting ? 'Rendering...' : 'Export Vis'}
            </button>
            <button 
              onClick={handleExportHtml} 
              className="px-6 py-2 bg-white dark:bg-gray-900 border border-emerald-400 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:bg-emerald-50 dark:hover:bg-emerald-950 dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
            >
              Export HTML
            </button>
            {!isOfflineReady && (
              <button 
                onClick={handleDownload} 
                disabled={isDownloading} 
                className="px-6 py-2 bg-white dark:bg-gray-900 border border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:bg-green-50 dark:hover:bg-green-950 dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all disabled:opacity-50"
              >
                {isDownloading ? 'Initializing...' : 'Init Matrix'}
              </button>
            )}
            {searchMatches.length > 0 && (
              <button 
                onClick={() => {
                  addSearchHistory(globalSearch);
                  setSearchHistory(getSearchHistory());
                  setIsSearchModalOpen(true);
                }} 
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 text-white font-bold uppercase tracking-widest text-sm rounded shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all animate-pulse"
              >
                Show {searchMatches.length} Matches
              </button>
            )}
          </div>

          <SettingsComponent settings={settings} onChange={handleSettingsChange} />
        </section>

        {/* Primary Visualization Area */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="feeds-droppable" direction={settings.layout === 'horizontal' ? 'horizontal' : 'vertical'}>
            {(provided) => (
              <div 
                id="ayat-compare-container" 
                className={`pt-2 flex gap-6 w-full ${settings.layout === 'horizontal' ? 'flex-col lg:flex-row pb-8' : 'flex-col'}`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {feeds.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400 uppercase tracking-widest font-bold w-full">
                    No active feeds. Use Global Search or Add a Feed.
                  </div>
                ) : (
                  feeds.map((feed, index) => (
                    <Draggable key={feed.id} draggableId={feed.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${settings.layout === 'horizontal' ? 'flex-1 min-w-0' : 'w-full'} ${snapshot.isDragging ? 'z-50 shadow-2xl opacity-90' : ''}`}
                        >
                          <FeedCard 
                            index={index}
                            feed={feed}
                            referenceFeed={referenceFeed}
                            isReference={index === 0}
                            settings={settings}
                            onUpdateFeed={updateFeed}
                            onUpdateText={updateFeedText}
                            onRemoveFeed={removeFeed}
                            dragHandleProps={provided.dragHandleProps}
                            isPlaying={playingFeedId === feed.id}
                            onToggleAudio={() => setPlayingFeedId(playingFeedId === feed.id ? null : feed.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Data Logs (History) */}
        <div className="border border-orange-200 dark:border-orange-900 rounded-lg p-6 bg-white dark:bg-gray-900/40 mt-8 shadow-sm dark:shadow-none transition-colors duration-300">
          <History history={history} onSelectHistory={handleSelectHistory} onClearHistory={handleClearHistory} />
        </div>

      </div>
      
      {isSearchModalOpen && (
        <SearchModal
          matches={searchMatches}
          onClose={() => setIsSearchModalOpen(false)}
          onCompare={handleCompareMatches}
          theme={settings.theme}
        />
      )}
    </div>
  );
}
