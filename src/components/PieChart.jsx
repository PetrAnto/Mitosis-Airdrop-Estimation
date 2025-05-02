// src/components/PieChart.jsx

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ expeditionUSD, theoUSD, testnetUSD, additionalUSD, showLabels }) {
  const data = {
    labels: showLabels ? ['Expedition', 'Theo Vault', 'Testnet', 'Additional'] : undefined,
    datasets: [
      {
        data: [expeditionUSD, theoUSD, testnetUSD, additionalUSD],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!showLabels,
        position: 'bottom',
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.chart._metasets[0].total;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toLocaleString('fr-FR')} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
}
