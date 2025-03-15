
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

// Ensure CSS is loaded before rendering the app
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error("Root element not found");
  }
});
