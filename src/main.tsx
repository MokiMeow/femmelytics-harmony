
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

// Add timestamp to force reload of resources
const timestamp = new Date().getTime();
console.log(`App initializing, build: ${timestamp}`);

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
