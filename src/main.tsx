
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure CSS is loaded before rendering the app
document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById("root")!).render(<App />);
});
