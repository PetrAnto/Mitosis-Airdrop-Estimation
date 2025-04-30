// src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AllocationCard from './components/AllocationCard';
import PieChart from './components/PieChart';
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
} from './api/mitosis';

export default function App() {
  const [address, setAddress] = useState('');
  const [assets, setAssets] = useState([]); // [{ asset, points, rank }]
  const [testnetPoints, setTestnetPoints] = useState(0);
  const [expPct, setExpPct] = useState(15);
  const [testPct, setTestPct] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const FDV_USD = 150 * 1_000_000;
  const testnetTotalPoints = 1_000_000;

  useEffect(() => {
    if (!address) return;
    console.log('▶️ Fetching breakdown for', address);
    setLoading(true);
    setError(null);
    fetchExpeditionBreakdown(address)
      .then((expList) =>
        fetchTheoPoints(address).then((theo) => {
          const all = [...expList, theo];
          console.log('✅ Received assets:', all);
          setAssets(all);
        })
      )
      .catch((err) => {
        console.error('❌ API error', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [address]);

  // Calculs d’USD
  const weights = assets.map((a) => a.points / (a.rank || 1));
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  const expeditionUSD =
    totalWeight > 0
      ? (weights.reduce((s, w) => s + w, 0) / totalWeight) *
        (expPct / 100) *
        FDV_USD
      : 0;
  const testnetUSD =
    (testnetPoints / testnetTotalPoints) * (testPct / 100) * FDV_USD;
  const totalUSD = expeditionUSD + testnetUSD;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-10">
        {/* Wallet input */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            placeholder="0x1234...abcd"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error && <p className="text-red-500">Erreur : {error}</p>}

        {/* Affichez les cartes quand on a des assets */}
        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((a) => (
                <AllocationCard
                  key={a.asset}
                  asset={a.asset}
                  points={a.points}
                  rank={a.rank}
                  onPointsChange={(pts) =>
                    setAssets((prev) =>
                      prev.map((x) =>
                        x.asset === a.asset ? { ...x, points: pts } : x
                      )
                    )
                  }
                />
              ))}
            </div>

            {/* Debug JSON brut */}
            <pre className="text-xs text-gray-500 bg-gray-800 rounded p-4 overflow-auto">
              {JSON.stringify(assets, null, 2)}
            </pre>

            {/* PieChart & Total */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-[400px]">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  Allocation Breakdown (USD)
                </h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  testnetUSD={testnetUSD}
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
