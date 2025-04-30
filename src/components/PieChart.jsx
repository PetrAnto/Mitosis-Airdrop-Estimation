import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, options }) {
  return (
    <div className="w-full h-full">
      <Pie
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
