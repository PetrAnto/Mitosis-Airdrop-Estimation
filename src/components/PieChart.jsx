import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Enregistrement global des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * PieChart component renders a Chart.js Pie chart.
 *
 * @param {{data: object, options: object}} props
 * @param {object} props.data    - Chart.js data object (labels + datasets)
 * @param {object} props.options - Chart.js options object
 */
export default function PieChart({ data, options }) {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full h-72 md:h-96 lg:h-[400px]">
      <Pie data={data} options={{
        ...options,
        plugins: {
          // override legend colors for dark mode
          legend: {
            labels: { color: '#e5e7eb' }, 
            ...(options.plugins?.legend || {}),
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed || 0;
                return `${ctx.label}: ${val.toLocaleString()}`;
              }
            },
            ...(options.plugins?.tooltip || {}),
          },
          ...options.plugins,
        }
      }} />
    </div>
  );
}