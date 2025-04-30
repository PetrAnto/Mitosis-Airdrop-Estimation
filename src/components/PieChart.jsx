import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, options }) {
  return (
    <div className="w-full h-full">
      <Pie
        // La clé forcera React à recréer le composant à chaque changement de data
        key={JSON.stringify(data)}
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#FFFFFF',
                font: {
                  size: 12,
                },
              },
            },
          },
          ...options,
        }}
      />
    </div>
  );
}
