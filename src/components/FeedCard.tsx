import React, { useRef, useState, useEffect } from 'react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import AyahSelector from './AyahSelector';
import { compareTexts } from '../utils';
import type { TextDiff, Settings } from '../utils';


export interface AyahFeedData {
  id: string;
  surah: number;
  ayah: number;
  text?: string;
  loading?: boolean;
}

interface FeedCardProps {
  feed: AyahFeedData;
  referenceFeed: AyahFeedData | null;
  isReference: boolean;
  settings: Settings;
  onUpdateFeed: (id: string, surah: number, ayah: number) => void;
  onUpdateText?: (id: string, text: string) => void;
  onRemoveFeed: (id: string) => void;
  index: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isPlaying: boolean;
  onToggleAudio: () => void;
}

// Convert hex color to rgba for glows
function hexToRgba(hex: string, alpha: number) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : `rgba(0,255,255,${alpha})`;
}

export default function FeedCard({
  feed,
  referenceFeed,
  isReference,
  settings,
  onUpdateFeed,
  onUpdateText,
  onRemoveFeed,
  index,
  dragHandleProps,
  isPlaying,
  onToggleAudio
}: FeedCardProps) {

  const [isCollapsed, setIsCollapsed] = useState(settings.layout === 'horizontal');
  
  useEffect(() => {
    setIsCollapsed(settings.layout === 'horizontal');
  }, [settings.layout]);
  const touchStart = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 50) onUpdateFeed(feed.id, feed.surah, feed.ayah + 1); 
    else if (diff < -50) onUpdateFeed(feed.id, feed.surah, Math.max(feed.surah === 1 ? 1 : 0, feed.ayah - 1)); 
    touchStart.current = null;
  };

  const getHighlights = (): TextDiff[] => {
    if (!feed.text) return [];
    
    // If it's the reference feed, everything is a match against itself
    if (isReference || !referenceFeed || !referenceFeed.text) {
      return [{ text: feed.text, isDifferent: false }];
    }

    // Compare this feed's text against the reference text
    return compareTexts(feed.text, referenceFeed!.text, {
      vowelInsensitive: settings.vowelInsensitive,
      ignoreWhiteSpace: settings.ignoreWhiteSpace,
      mode: settings.comparisonMode,
    });
  };

  const highlighted = getHighlights();

  let matchChars = 0;
  let diffCharsCount = 0;
  highlighted.forEach(item => {
    const cleanText = item.text.replace(/\s+/g, '');
    if (item.isDifferent) {
      diffCharsCount += cleanText.length;
    } else {
      matchChars += cleanText.length;
    }
  });
  const totalChars = matchChars + diffCharsCount;
  const matchPercentage = totalChars > 0 ? Math.round((matchChars / totalChars) * 100) : 0;

  const totalWords = feed.text ? feed.text.trim().split(/\s+/).length : 0;
  const totalLetters = feed.text ? feed.text.replace(/\s+/g, '').length : 0;

  const renderHighlight = (item: TextDiff, idx: number) => {
    const isDiff = item.isDifferent;
    
    // Strip diacritics visually if requested
    const displayText = settings.hideDiacritics ? item.text.replace(/[\u064B-\u065F\u0670]/g, '') : item.text;

    if (isDiff && settings.highlightDifferences) {
      return (
        <span 
          key={idx} 
          className="font-bold rounded-sm relative z-10 px-0.5 mx-0.5"
          style={{ 
            color: settings.diffColor,
            backgroundColor: hexToRgba(settings.diffColor, 0.15),
            boxShadow: `inset 0 -2px 0 ${settings.diffColor}`
          }}
        >
          {displayText}
        </span>
      );
    }
    
    if (!isDiff && !settings.hideMatchColor) {
      return (
        <span 
          key={idx} 
          className="font-bold rounded-sm relative z-10 px-0.5 mx-0.5"
          style={{ 
            color: settings.matchColor,
            backgroundColor: hexToRgba(settings.matchColor, 0.1),
            boxShadow: `inset 0 -1px 0 ${hexToRgba(settings.matchColor, 0.5)}`
          }}
        >
          {displayText}
        </span>
      );
    }

    // Unhighlighted normal text
    return <span key={idx} className="text-gray-200 leading-[2.5]">{displayText}</span>;
  };

  const borderColor = isReference ? settings.matchColor : settings.diffColor;
  const shadowColor = hexToRgba(borderColor, 0.15);

  return (
    <div 
      className={`relative rounded-xl border-2 transition-all duration-300 p-6 flex flex-col justify-between 
        ${isReference ? 'bg-white dark:bg-black/60 shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.8)]' : 'bg-gray-50 dark:bg-gray-900/60'}`}
      style={{
        borderColor: borderColor,
        boxShadow: settings.theme === 'dark' ? `inset 0 0 30px ${shadowColor}` : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`flex justify-between items-start relative ${isCollapsed ? 'h-0 overflow-visible z-10' : 'mb-2'}`}>
        <div className="flex items-center gap-2 w-full pr-16">
          <div 
            {...dragHandleProps} 
            className={`cursor-grab active:cursor-grabbing p-1.5 text-gray-600 hover:text-cyan-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors ${isCollapsed ? 'bg-white/80 dark:bg-gray-900/80 shadow-sm' : ''}`}
            title="Drag to reorder"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <AyahSelector
                surah={feed.surah}
                ayah={feed.ayah}
                onSurahChange={(s) => onUpdateFeed(feed.id, s, feed.ayah)}
                onAyahChange={(a) => onUpdateFeed(feed.id, feed.surah, a)}
                label={isReference ? "Reference [Master]" : `Compare [${index + 1}]`}
              />
            </div>
          )}
        </div>
        
        <div className={`absolute top-0 right-0 flex items-center gap-1 ${isCollapsed ? 'bg-white/80 dark:bg-gray-900/80 shadow-sm rounded-full' : ''}`}>
          <button 
            onClick={onToggleAudio}
            className={`transition-colors p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 ${isPlaying ? 'text-cyan-500' : 'text-gray-600 hover:text-cyan-500'}`}
            title={isPlaying ? "Pause Audio" : "Play Husary 128kbps"}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-cyan-500 transition-colors p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
            title={isCollapsed ? "Show Controls" : "Hide Controls"}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>

          {!isReference && (
            <button 
              onClick={() => onRemoveFeed(feed.id)}
              className="text-gray-600 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
              title="Remove Feed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div 
        className={`flex-1 min-h-[80px] flex items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 transition-all ${isCollapsed ? 'bg-transparent border-transparent px-2 py-6' : 'bg-gray-100 dark:bg-gray-950/50'}`}
        dir="rtl"
      >
        {feed.loading ? (
          <div className="animate-pulse flex items-center justify-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest text-sm">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
          </div>
        ) : feed.text ? (
          isReference ? (
            <textarea
              className="w-full text-right bg-transparent outline-none resize-y text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-cyan-500/50 rounded"
              value={feed.text}
              onChange={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                if (onUpdateText) onUpdateText(feed.id, e.target.value);
              }}
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              style={{ 
                fontSize: `${settings.fontSize}px`, 
                fontFamily: '"Amiri Quran", serif',
                lineHeight: settings.hideDiacritics ? '2' : '2.5',
                minHeight: '60px'
              }}
            />
          ) : (
            <div 
              className="text-right flex-1 text-gray-800 dark:text-gray-200" 
              style={{ 
                fontSize: `${settings.fontSize}px`, 
                fontFamily: '"Amiri Quran", serif',
                lineHeight: settings.hideDiacritics ? '2' : '2.5'
              }}
            >
              {highlighted.map((item, idx) => renderHighlight(item, idx))}
            </div>
          )
        ) : (
          <div className="text-gray-600 text-center text-xs font-sans uppercase tracking-widest">
            Awaiting Signal
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex justify-between items-center mt-3 h-4 transition-all">
          <div className="flex gap-2 text-xs md:text-sm font-mono text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">
            <span>{totalWords} W</span>
            <span>•</span>
            <span>{totalLetters} L</span>
          </div>

          {!isReference && feed.text && referenceFeed?.text && (
            <div className="flex gap-1.5 text-xs md:text-sm font-mono text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">
              <span style={{ color: settings.matchColor }}>{matchPercentage}% MATCH</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">{matchChars} MATCH</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline" style={{ color: settings.diffColor }}>{diffCharsCount} DIFF</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
