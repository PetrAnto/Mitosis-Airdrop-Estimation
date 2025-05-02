// src/components/PieChart.jsx

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({
  expeditionUSD = 0,
  theoUSD = 0,
  testnetUSD = 0,
  additionalUSD = 0,
}) {
  // Data for the Pie Chart including Additional Rewards
  const data = {
    labels: ['Expedition USD', 'Theo Vault USD', 'Testnet USD', 'Additional USD'],
    datasets: [
      {
        data: [expeditionUSD, theoUSD, testnetUSD, additionalUSD],
        backgroundColor: [
          'rgba(52, 211, 153, 0.8)',   // green
          'rgba(251, 146, 60, 0.8)',    // orange
          'rgba(96, 165, 250, 0.8)',    // blue
          'rgba(250, 204, 21, 0.8)',    // yellow
        ],
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
          boxWidth: 20,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.chart._metasets[context.datasetIndex].total;
            const pct = total ? ((value / total) * 100).toFixed(2) : '0.00';
            return `${label}: $${value.toLocaleString('fr-FR')} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Pie data={data} options={options} />
    </div>
  );
}
