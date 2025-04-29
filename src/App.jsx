import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  const [fdv, setFdv] = useState(150);
  const [expeditionPoints, setExpeditionPoints] = useState(0);
  const [testnetPoints, setTestnetPoints] = useState(0);

  const [expeditionPct, setExpeditionPct] = useState(15);
  const [testnetPct, setTestnetPct] = useState(10);

  const expeditionTotalPoints = 194_000_000_000;
  const testnetTotalPoints = 1_000_000;

  const expeditionAllocation = (expeditionPoints / expeditionTotalPoints) * (fdv * 1_000_000 * (expeditionPct / 100));
  const testnetAllocation = (testnetPoints / testnetTotalPoints) * (fdv * 1_000_000 * (testnetPct / 100));

  const totalAllocation = expeditionAllocation + testnetAllocation;

  const pieData = {
    labels: ['Expedition', 'Testnet'],
    datasets: [
      {
        data: [expeditionAllocation, testnetAllocation],
        backgroundColor: ['#3b82f6', '#10b981'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8 space-y-8">
      <img src="/petrantocalculator.png" alt="PetrAnto Logo" className="w-32 h-32" />

      <h1 className="text-3xl font-bold">PetrAnto Mitosis Airdrop Estimator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Expedition Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Expedition Campaign</h2>

          <label>Estimated Expedition Points:</label>
          <input
            type="number"
            value={expeditionPoints}
            onChange={(e) => setExpeditionPoints(Number(e.target.value))}
            className="w-full p-2 rounded text-black mb-4"
          />

          <label>Expedition % of FDV:</label>
          <input
            type="range"
            min="0"
            max="20"
            value={expeditionPct}
            onChange={(e) => setExpeditionPct(Number(e.target.value))}
            className="w-full mb-4"
          />
          <div>{expeditionPct}% of FDV</div>
        </div>

        {/* Testnet Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Game of Mito Testnet</h2>

          <label>Testnet $MITO earned:</label>
          <input
            type="number"
            value={testnetPoints}
            onChange={(e) => setTestnetPoints(Number(e.target.value))}
            className="w-full p-2 rounded text-black mb-4"
          />

          <label>Testnet % of FDV:</label>
          <input
            type="range"
            min="0"
            max="20"
            value={testnetPct}
            onChange={(e) => setTestnetPct(Number(e.target.value))}
            className="w-full mb-4"
          />
          <div>{testnetPct}% of FDV</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl h-[400px]">
        <h2 className="text-xl font-semibold mb-4">Allocation Breakdown</h2>
        <Pie data={pieData} options={pieOptions} />
      </div>

      {/* Total */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-md text-center w-full max-w-md">
        <h2 className="text-lg font-bold mb-2">Total Estimated Airdrop</h2>
        <p className="text-2xl">${totalAllocation.toFixed(2)} USD</p>
      </div>

      <footer className="pt-8 text-xs text-gray-400">
        Built by <a href="https://x.com/PetrAnto12" target="_blank" className="underline text-blue-400">@PetrAnto12</a>
      </footer>
    </div>
  );
}
