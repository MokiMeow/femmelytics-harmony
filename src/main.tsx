
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'

// Force a hard refresh if the application has been updated
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Add version timestamp to force reload of resources
const BUILD_TIMESTAMP = new Date().getTime();
// Set a cache busting value in localStorage to detect changes
const CACHE_KEY = 'femmelytics-cache-version';
const lastVersion = localStorage.getItem(CACHE_KEY);
const currentVersion = BUILD_TIMESTAMP.toString();

// Check if the version has changed and reload if needed
if (lastVersion && lastVersion !== currentVersion) {
  localStorage.setItem(CACHE_KEY, currentVersion);
  window.location.reload(); // Remove the 'true' argument here
} else {
  localStorage.setItem(CACHE_KEY, currentVersion);
}

console.log(`App initializing, build: ${BUILD_TIMESTAMP}`);

// Handle initial theme to prevent theme flashing
const setInitialTheme = () => {
  const storageKey = "femmelytics-ui-theme";
  const storedTheme = localStorage.getItem(storageKey);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  if (storedTheme === "light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  } else if (storedTheme === "dark") {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  } else {
    // System preference
    if (mediaQuery.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  }
};

// Execute theme setting before render to prevent flash
setInitialTheme();

// Add meta tags to prevent caching
const addCacheControlMetaTags = () => {
  const metaTags = [
    { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
    { httpEquiv: 'Pragma', content: 'no-cache' },
    { httpEquiv: 'Expires', content: '0' }
  ];

  metaTags.forEach(tag => {
    const meta = document.createElement('meta');
    meta.httpEquiv = tag.httpEquiv;
    meta.content = tag.content;
    document.head.appendChild(meta);
  });
};

// Add the cache control meta tags
addCacheControlMetaTags();

// Ensure CSS is loaded before rendering the app
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    );
  } else {
    console.error("Root element not found");
  }
});
