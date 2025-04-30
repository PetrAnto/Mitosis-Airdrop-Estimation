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
  const [assets, setAssets] = useState([]); // { asset, points, rank, tier }[]
  const [testnetPoints, setTestnetPoints] = useState(0);
  const [expPct, setExpPct] = useState(15);
  const [testPct, setTestPct] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const FDV_USD = 150 * 1_000_000;
  const testnetTotalPoints = 1_000_000;

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

  // Séparer les catégories
  const expeditionAssets = assets.filter(a => a.asset !== 'Theo Vault');
  const theoAsset       = assets.find(a => a.asset === 'Theo Vault');

  // Total des points expedition
  const totalExpPoints = expeditionAssets.reduce(
    (sum, a) => sum + a.points,
    0
  );

  // Calcul USD
  const weights = assets.map(a => a.points / (a.rank || 1));
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

  const displayTestnet = Math.floor(testnetPoints);

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
            onChange={e => setAddress(e.target.value.trim())}
            placeholder="0x1234...abcd"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error   && <p className="text-red-500">Erreur : {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            {/* Carte unique Mitosis Expedition */}
            <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-200">
                Mitosis Expedition
              </h2>
              <p className="text-white font-bold">
                Total Expedition Points: {Math.floor(totalExpPoints).toLocaleString('fr-FR')}
              </p>
              <div className="space-y-4">
                {expeditionAssets.map(a => (
                  <div key={a.asset} className="space-y-1">
                    <p className="text-gray-200 font-medium">{a.asset}</p>
                    <p className="text-white">
                      Points: {Math.floor(a.points).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Rank #{a.rank} · Tier: {a.tier && ['Bronze','Silver','Gold','Platinum','Diamond'][a.tier-1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte Theo Vault */}
            {theoAsset && (
              <AllocationCard
                asset={theoAsset.asset}
                points={theoAsset.points}
                rank={theoAsset.rank}
                tier={null}
                onPointsChange={pts =>
                  setAssets(prev =>
                    prev.map(x =>
                      x.asset === theoAsset.asset ? { ...x, points: pts } : x
                    )
                  )
                }
              />
            )}

            {/* Carte Testnet */}
            <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-200">
                Testnet $MITO
              </h2>
              <input
                type="number"
                value={displayTestnet}
                onChange={e => setTestnetPoints(Number(e.target.value))}
                className="w-full p-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-gray-400">Points: {displayTestnet.toLocaleString('fr-FR')}</p>
              <label className="text-gray-400">% of FDV</label>
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

            {/* PieChart & Total USD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 h-[400px]">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                  Allocation Breakdown (USD)
                </h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  testnetUSD={testnetUSD}
                />
              </div>
              <div className="max-w-md bg-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center">
                <h2 className="text-lg font-bold text-gray-200 mb-2">
                  Total Estimated Airdrop
                </h2>
                <p className="text-3xl font-semibold">
                  ${totalUSD.toFixed(2).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
