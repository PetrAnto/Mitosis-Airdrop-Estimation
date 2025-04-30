import React, { useState } from 'react';
import Header from './components/Header';
import PieChart from './components/PieChart';

export default function App() {
  const [expeditionPoints, setExpeditionPoints] = useState(0);
  const [testnetPoints, setTestnetPoints] = useState(0);
  const [expeditionPct, setExpeditionPct] = useState(15);
  const [testnetPct, setTestnetPct] = useState(10);

  // On utilise directement les % pour le graphique
  const additionalPct = Math.max(0, 100 - expeditionPct - testnetPct);

  const pieData = {
    labels: ['Expedition', 'Testnet', 'Additional'],
    datasets: [
      {
        data: [expeditionPct, testnetPct, additionalPct],
        backgroundColor: ['#4ade80', '#60a5fa', '#facc15'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Inputs Expedition / Testnet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Expedition Card */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Expedition Campaign
            </h2>

            <label className="text-gray-400 mb-2">Expedition Points</label>
            <input
              type="number"
              value={expeditionPoints}
              onChange={e => setExpeditionPoints(Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="text-gray-400 mb-2">% of FDV</label>
            <input
              type="range"
              min="0"
              max="100"
              value={expeditionPct}
              onChange={e => setExpeditionPct(Number(e.target.value))}
              className="w-full mb-2 accent-blue-500"
            />
            <div className="text-gray-200">{expeditionPct}%</div>
          </div>

          {/* Testnet Card */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Game of Mito Testnet
            </h2>

            <label className="text-gray-400 mb-2">Testnet $MITO Earned</label>
            <input
              type="number"
              value={testnetPoints}
              onChange={e => setTestnetPoints(Number(e.target.value))}
              placeholder="0"
              className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="text-gray-400 mb-2">% of FDV</label>
            <input
              type="range"
              min="0"
              max="100"
              value={testnetPct}
              onChange={e => setTestnetPct(Number(e.target.value))}
              className="w-full mb-2 accent-blue-500"
            />
            <div className="text-gray-200">{testnetPct}%</div>
          </div>
        </div>

        {/* Chart + Total */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-[400px]">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">
              Allocation Breakdown
            </h2>
            <PieChart data={pieData} options={{}} />
          </div>

          {/* Total Allocation */}
          <div className="bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center">
            <h2 className="text-lg font-bold text-gray-200 mb-2">
              Total % of FDV Allocated
            </h2>
            <p className="text-3xl font-semibold">
              { (expeditionPct + testnetPct).toFixed(2) }%
            </p>
          </div>
        </div>
      </main>
    </div>
);
}
