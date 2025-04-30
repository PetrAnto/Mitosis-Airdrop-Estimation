import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Enregistrement des éléments Chart.js
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
                font: { size: 12 },
              },
            },
            tooltip: {
              callbacks: {
                label: context => {
                  const { dataset, parsed, label } = context;
                  const total = dataset.data.reduce((sum, val) => sum + val, 0);
                  const pct = ((parsed / total) * 100).toFixed(2);
                  return `${label}: ${pct}%`;
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
