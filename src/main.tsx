import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ViewOnlyApp from './ViewOnlyApp.tsx';
import './index.css';

// Check if we're in view-only mode
const isViewOnly = new URLSearchParams(window.location.search).has('data');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isViewOnly ? <ViewOnlyApp /> : <App />}
  </StrictMode>
);