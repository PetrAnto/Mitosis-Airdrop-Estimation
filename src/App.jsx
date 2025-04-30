import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AllocationCard from './components/AllocationCard';
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
} from './api/mitosis';

export default function App() {
  const [address, setAddress] = useState('');
  const [assets, setAssets] = useState([]); // [{ asset, points, rank }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main className="container mx-auto px-6 py-10 space-y-6">
        {/* Saisie du wallet */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x1234...abcd"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error && <p className="text-red-500">Erreur : {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(a => (
              <AllocationCard
                key={a.asset}
                asset={a.asset}
                points={a.points}
                rank={a.rank}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
