import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global styles (Tailwind, etc.)
import './styles/global.css';
// KaTeX styles (math rendering)
import '~katex/dist/katex.min.css';

// Chart.js registration
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
