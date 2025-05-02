// src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PieChart from './components/PieChart';
import AllocationCard from './components/AllocationCard';
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis';

// Asset labels
const ASSET_LABELS = {
  weETH:  'weETH',
  ezETH:  'ezETH',
  weETHs: 'weETHs',
  uniBTC: 'uniBTC',
  uniETH: 'uniETH',
  cmETH:  'cmETH',
};

export default function App() {
  // Main state
  const [address, setAddress] = useState('');
  const [assets, setAssets]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // FDV slider and percentages
  const [fdvUsd, setFdvUsd] = useState(150_000_000);
  const [expPct, setExpPct] = useState(10);
  const [testPct, setTestPct] = useState(5);

  // Additional rewards
  const [bonuses, setBonuses] = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ]);

  // Load data from APIs
  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
      fetchTestnetData(address),
    ])
      .then(([expList, theo, testnet]) => setAssets([...expList, theo, testnet]))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  // Separate categories
  const expeditionAssets = assets.filter(a => Object.keys(ASSET_LABELS).includes(a.asset));
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault') || {};
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || {};

  // Expedition calculations
  const totalExpPoints = expeditionAssets.reduce((sum,a) => sum + a.points, 0);
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => a.tier || 1))
    : 1;
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost) / (225_000_000_000 * 1.5) * 100;
  const expeditionPoolUsd  = fdvUsd * (expPct / 100);
  const expeditionUSD      = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd);

  // Theo Vault (same FDV%)
  const theoTier = expeditionAssets.find(a => a.asset==='weETH')?.tier || 1;
  const theoSharePct = theoAsset.points
    ? (theoAsset.points * theoTier / (225_000_000_000 * 1.5)) * 100
    : 0;
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd);

  // Testnet calculations
  const TESTNET_POOL = 30_954_838.28;
  const testnetUSD = Math.floor(
    (testnetAsset.points / TESTNET_POOL)
    * fdvUsd * (testPct / 100)
  );

  // Additional Rewards USD
  const additionalUSD = Math.floor(
    bonuses.filter(b => b.selected)
      .reduce((sum, b) => sum + (b.pct / 100) * fdvUsd / b.supply, 0)
  );

  // Totals
  const totalUSD = expeditionUSD + theoUSD + testnetUSD + additionalUSD;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header title="Try to estimate your airdrop value" />

      {/* FDV slider */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl p-4 mx-auto">
          <h2 className="text-xl font-semibold">$MITO Fully Diluted Value (FDV):</h2>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={50e6}
              max={1e9}
              step={1e6}
              value={fdvUsd}
              onChange={e => setFdvUsd(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span>{fdvUsd.toLocaleString('en-US')}$</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 space-y-8">
        {/* Wallet input */}
        <div>
          <label className="block text-gray-300 mb-1">Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error   && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AllocationCard
                title="Game of Mito Testnet"
                points={testnetAsset.points}
                usd={testnetUSD}
                showSlider
                pct={testPct}
                onPctChange={setTestPct}
              />

              <AllocationCard
                title="Mitosis Expedition"
                points={totalExpPoints}
                usd={expeditionUSD}
                showSlider
                pct={expPct}
                onPctChange={setExpPct}
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {expeditionAssets.map(a => (
                    <div key={a.asset}>
                      <p className="font-medium">{ASSET_LABELS[a.asset]}</p>
                      <p>{Math.floor(a.points).toLocaleString('en-US')}</p>
                      <p className="text-gray-400">Tier: {a.tier}</p>
                    </div>
                  ))}
                </div>
              </AllocationCard>

              <AllocationCard
                title="Theo Vault"
                points={theoAsset.points}
                usd={theoUSD}
              />

              <AllocationCard
                title="Additional Rewards"
                showCheckbox
              >
                {bonuses.map(b => (
                  <div key={b.key} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={b.selected}
                        onChange={() => setBonuses(bs => bs.map(x => x.key===b.key ? {...x,selected:!x.selected} : x))}
                        className="accent-blue-500"
                      />
                      <span>{b.label}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min={0} max={5} step={0.1}
                        value={b.pct}
                        onChange={e => setBonuses(bs => bs.map(x=>x.key===b.key?{...x,pct:Number(e.target.value)}:x))}
                        className="w-24 accent-blue-500"
                      />
                      <span>{b.pct}%</span>
                      <span>({b.supply.toLocaleString('en-US')})</span>
                    </div>
                  </div>
                ))}
              </AllocationCard>
            </div>

            {/* PieChart & Total */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-semibold mb-2">Allocation Breakdown (USD)</h3>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  theoUSD={theoUSD}
                  testnetUSD={testnetUSD}
                  additionalUSD={additionalUSD}
                />
              </div>

              <div className="bg-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-semibold">Total Estimated Airdrop</h3>
                <p className="text-2xl font-bold my-2">
                  ${totalUSD.toLocaleString('en-US')}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-200">
                  <li>Expedition: ${expeditionUSD.toLocaleString('en-US')}</li>
                  <li>Theo Vault: ${theoUSD.toLocaleString('en-US')}</li>
                  <li>Testnet: ${testnetUSD.toLocaleString('en-US')}</li>
                  <li>Additional: ${additionalUSD.toLocaleString('en-US')}</li>
                </ul>
                <p className="mt-2 font-medium">
                  Total % FDV for Airdrop: {(expPct + testPct + bonuses.reduce((s,b)=>s+b.pct,0)).toFixed(1)}%
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
