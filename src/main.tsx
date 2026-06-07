import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA auto-update
registerSW({
  onNeedRefresh() {
    // We configured autoUpdate, so this shouldn't strictly be needed
    // but having it ensures the service worker is properly registered.
  },
  onOfflineReady() {
    console.log('PWA is offline ready');
  },
})

// Invalidate cache and settings on version change to ensure database and vowel engine match
const currentVersion = typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : '0.0.0';
const storedVersion = localStorage.getItem('app_build_version');
if (storedVersion !== currentVersion) {
  localStorage.removeItem('quran_data');
  localStorage.removeItem('quran_download_status');
  localStorage.removeItem('app_settings');
  localStorage.setItem('app_build_version', currentVersion);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
