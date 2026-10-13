import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { OnboardingProvider } from './context/OnboardingContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { FontScaleProvider } from './context/FontScaleContext.jsx';
import { SamplePreferencesProvider } from './context/SamplePreferencesContext.jsx';
import { NotesProvider } from './context/NotesContext.jsx';
import { ProgressProvider } from './context/ProgressContext.jsx';
import { HardPointsProvider } from './context/HardPointsContext.jsx';
import { ReviewProvider } from './context/ReviewContext.jsx';
import './styles/index.css';

import * as __loaders from './data/loaders.js';
import * as __sampleLoaders from './data/sampleQuestionsLoader.js';

if (import.meta.env.DEV) {
  window.__loaders = __loaders;
  window.__sampleLoaders = __sampleLoaders;
}

// Capture the install prompt event as early as possible.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
});

// Register the service worker with a base-aware path.
// Using import.meta.env.BASE_URL ensures it works on GitHub Pages
// (base: '/hematology-course/') and locally.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker
      .register(`${base}sw.js`)
      .catch(() => {
        /* non-fatal */
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OnboardingProvider>
      <ThemeProvider>
        <FontScaleProvider>
          <SamplePreferencesProvider>
            <NotesProvider>
              <ProgressProvider>
                <HardPointsProvider>
                  <ReviewProvider>
                    <App />
                  </ReviewProvider>
                </HardPointsProvider>
              </ProgressProvider>
            </NotesProvider>
          </SamplePreferencesProvider>
        </FontScaleProvider>
      </ThemeProvider>
    </OnboardingProvider>
  </React.StrictMode>
);