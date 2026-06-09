import React from 'react';
import type { Settings } from '../utils';

import { SkeuomorphicToggle } from './SkeuomorphicToggle';

interface SettingsProps {
  settings: Settings;
  onChange: (settings: Settings) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({ settings, onChange }) => {
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="border border-cyan-300 dark:border-cyan-500 rounded-lg p-6 shadow-sm dark:shadow-[0_0_15px_rgba(0,255,255,0.15)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mb-6 transition-colors duration-300">
      <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-4 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 pb-2">System Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Core Settings Column */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-700 uppercase tracking-widest font-bold">Display</h4>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Font Size: <span className="text-cyan-600 dark:text-cyan-400">{settings.fontSize}px</span>
            </label>
            <input
              type="range"
              min="16"
              max="64"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors mt-2">
            <input
              type="checkbox"
              checked={settings.hideDiacritics}
              onChange={(e) => updateSetting('hideDiacritics', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 bg-gray-100 dark:bg-gray-800 border-cyan-500 cursor-pointer"
            />
            <span>Hide Harakat</span>
          </label>
        </div>

        {/* Global Theming & Layout */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-700 uppercase tracking-widest font-bold">View Mode</h4>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Layout</label>
            <SkeuomorphicToggle 
              leftLabel="Vert" 
              rightLabel="Horiz" 
              isRight={settings.layout === 'horizontal'}
              onToggle={() => updateSetting('layout', settings.layout === 'vertical' ? 'horizontal' : 'vertical')}
            />
          </div>
        </div>

        {/* Diffing Engine Settings Column */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-700 uppercase tracking-widest font-bold">Analysis Engine</h4>
          
          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            <input
              type="checkbox"
              checked={settings.vowelInsensitive}
              onChange={(e) => updateSetting('vowelInsensitive', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 bg-gray-100 dark:bg-gray-800 border-cyan-500 cursor-pointer"
            />
            <span>Ignore Harakat</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors mt-2">
            <input
              type="checkbox"
              checked={settings.ignoreWhiteSpace}
              onChange={(e) => updateSetting('ignoreWhiteSpace', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 bg-gray-100 dark:bg-gray-800 border-cyan-500 cursor-pointer"
            />
            <span>Ignore White Space</span>
          </label>
          
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Comparison</label>
            <SkeuomorphicToggle 
              leftLabel="Word" 
              rightLabel="Letter" 
              isRight={settings.comparisonMode === 'letter'}
              onToggle={() => updateSetting('comparisonMode', settings.comparisonMode === 'word' ? 'letter' : 'word')}
            />
          </div>
        </div>

        {/* Highlights Visibility */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-700 uppercase tracking-widest font-bold">Visibility</h4>
          
          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            <input
              type="checkbox"
              checked={settings.highlightDifferences}
              onChange={(e) => updateSetting('highlightDifferences', e.target.checked)}
              className="w-5 h-5 accent-pink-500 bg-gray-100 dark:bg-gray-800 border-pink-500 cursor-pointer"
            />
            <span>Show Diff</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors mt-2">
            <input
              type="checkbox"
              checked={!settings.hideMatchColor}
              onChange={(e) => updateSetting('hideMatchColor', !e.target.checked)}
              className="w-5 h-5 accent-green-500 bg-gray-100 dark:bg-gray-800 border-green-500 cursor-pointer"
            />
            <span>Show Matches</span>
          </label>
        </div>

        {/* Colors Selection */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-700 uppercase tracking-widest font-bold">Colors</h4>
          
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Diff</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-700">{settings.diffColor}</span>
              <input 
                type="color" 
                value={settings.diffColor}
                onChange={(e) => updateSetting('diffColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Match</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-700">{settings.matchColor}</span>
              <input 
                type="color" 
                value={settings.matchColor}
                onChange={(e) => updateSetting('matchColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>
          <button 
             onClick={() => { updateSetting('diffColor', '#ec4899'); updateSetting('matchColor', '#06b6d4'); }}
             className="text-xs text-gray-700 hover:text-gray-800 dark:hover:text-white uppercase tracking-widest text-right transition-colors"
          >
            Reset Colors
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsComponent;
