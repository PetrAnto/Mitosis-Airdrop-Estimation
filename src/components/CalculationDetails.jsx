// src/components/CalculationDetails.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Avec Vite, on peut importer le MD brut grâce à `?raw`
import md from '../content/calculationDetails.md?raw';

export default function CalculationDetails() {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
    </div>
  );
}
