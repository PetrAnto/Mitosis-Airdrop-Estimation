import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Enregistre une fois pour toutes les composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ expeditionUSD, testnetUSD }) {
  const data = {
    labels: ['Expedition USD', 'Testnet USD'],
    datasets: [
      {
        data: [expeditionUSD, testnetUSD],
        backgroundColor: ['#4ade80', '#60a5fa'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
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
          label: ({ label, parsed, dataset }) => {
            const total = dataset.data.reduce((sum, v) => sum + v, 0);
            const pct = total ? ((parsed / total) * 100).toFixed(2) : 0;
            return `${label}: $${parsed.toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Pie data={data} options={options} />
    </div>
  );
}
