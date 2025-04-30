import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AllocationCard from './components/AllocationCard';
import PieChart from './components/PieChart';
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
} from './api/mitosis';

export default function App() {
  // Adresse wallet
  const [address, setAddress] = useState('');

  // Détail des assets expedition + theo
  const [assets, setAssets] = useState([]); 
  // [{ asset, points, rank }, …]

  // % FDV pour expedition et testnet (slider)
  const [expPct, setExpPct] = useState(15);
  const [testPct, setTestPct] = useState(10);

  // Points Testnet (simples, sans détail)
  const [testnetPoints, setTestnetPoints] = useState(0);

  // États d’API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Constantes FDV
  const FDV_USD = 150 * 1_000_000;

  // Dès que l'adresse change, on recharge tout
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
    ])
      .then(([expList, theo]) => {
        setAssets([...expList, theo]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  // Met à jour les points d’un asset saisi manuellement
  const handlePointsChange = (assetName, newPts) => {
    setAssets(prev =>
      prev.map(a =>
        a.asset === assetName ? { ...a, points: newPts } : a
      )
    );
  };

  // Calcul des poids : on utilise weight = points / rank
  const weights = assets.map(a => a.points / (a.rank || 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // USD alloué à l’expedition
  const expeditionUSD =
    (totalWeight > 0
      ? (weights.reduce((sum, w) => sum + w, 0) / totalWeight)
      : 0) *
    (expPct / 100) *
    FDV_USD;

  // USD alloué au testnet
  const testnetUSD =
    (testnetPoints / (1_000_000) /* total testnet points fixés */) *
    (testPct / 100) *
    FDV_USD;

  // Total USD
  const totalUSD = expeditionUSD + testnetUSD;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        Erreur API : {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Wallet input */}
        <div className="mb-8">
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x1234...abcd"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Chargement…</p>
        ) : (
          <>
            {/* Expedition & Theo cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {assets.map(a => (
                <AllocationCard
                  key={a.asset}
                  asset={a.asset}
                  points={a.points}
                  rank={a.rank}
                  onPointsChange={newPts =>
                    handlePointsChange(a.asset, newPts)
                  }
                />
              ))}

              {/* Testnet card isolée */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-2">
                <h2 className="text-lg font-semibold text-gray-200">
                  Testnet $MITO
                </h2>
                <input
                  type="number"
                  value={testnetPoints}
                  onChange={e =>
                    setTestnetPoints(Number(e.target.value))
                  }
                  className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(testnetPoints)
                  }
                  className="self-end px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded-md"
                >
                  Copy
                </button>

                <label className="text-gray-400 mt-4 mb-2">
                  % of FDV
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testPct}
                  onChange={e => setTestPct(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="text-gray-200">{testPct}%</div>
              </div>
            </div>

            {/* Chart + Total */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-[400px]">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  Allocation Breakdown (USD)
                </h2>
                <PieChart
                  expeditionAllocation={expeditionUSD}
                  testnetAllocation={testnetUSD}
                />
              </div>

              <div className="bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center">
                <h2 className="text-lg font-bold text-gray-200 mb-2">
                  Total Estimated Airdrop
                </h2>
                <p className="text-3xl font-semibold">
                  ${totalUSD.toFixed(2)}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
