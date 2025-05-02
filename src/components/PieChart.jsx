import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ expeditionUSD, theoUSD, testnetUSD, additionalUSD, showLabels }) {
  const data = {
    labels: showLabels ? ['Expedition', 'Theo Vault', 'Testnet', 'Additional'] : [],
    datasets: [
      {
        data: [expeditionUSD, theoUSD, testnetUSD, additionalUSD],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
        borderWidth: 0,
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        display: showLabels,
        position: 'bottom',
        labels: { color: '#e5e5e5' }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return <Pie data={data} options={options} />;
}
