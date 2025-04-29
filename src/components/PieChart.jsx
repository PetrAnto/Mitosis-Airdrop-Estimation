import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ expedition, testnet, additional }) => {
  const data = {
    labels: ['Expedition', 'Testnet', 'Additional Rewards'],
    datasets: [
      {
        label: 'FDV Allocation',
        data: [expedition, testnet, additional],
        backgroundColor: ['#805ad5', '#4c51bf', '#a3bffa'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-72 md:h-96 lg:h-[400px]">
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
