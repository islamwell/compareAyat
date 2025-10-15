# Compare Ayat

A modern web application for comparing two Quranic ayahs side-by-side with visual difference highlighting.

## Features

- **Side-by-side Comparison**: Compare any two ayahs from the Quran
- **Bold, High-Contrast Design**: Dark theme with gold text, thick 3-4px borders, and dramatic shadows
- **Difference Highlighting**: Automatically highlights differences between ayahs in red
- **Vowel-Insensitive Search**: Option to ignore Arabic diacritics (fatha, kasra, damma)
- **Offline Mode**: Download entire Quran for offline usage
- **Adjustable Font Size**: 16-48px slider for comfortable reading
- **Comparison History**: Saves your last 50 comparisons
- **Bismillah Handling**: Ayah 0 correctly shows bismillah (except in Surah Al-Fatiha and At-Tawbah)
- **English UI**: All interface text in English with Arabic Quranic text

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

Production files will be in the `dist` folder.

## Usage

1. **Select Ayahs**: Use the dropdown menus to select surah and ayah numbers for both sides
2. **Download Quran**: Click "Show Settings" → "Download Quran for Offline" to enable full functionality (sample data included for demo)
3. **Adjust Settings**: 
   - Change font size with the slider
   - Toggle difference highlighting
   - Toggle vowel-insensitive comparison
4. **View History**: Click "Show History" to see and reload previous comparisons

## Technology Stack

- React 19 with TypeScript
- Vite (build tool)
- Tanzil.net API for Quranic text
- localStorage for offline storage and settings
- Custom CSS with modern design

## License

MIT
