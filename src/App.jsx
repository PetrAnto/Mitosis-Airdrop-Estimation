// src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PieChart from './components/PieChart';
import { fetchTheoPoints, fetchTestnetData } from './api/mitosis';

// Mapping tiers to names and bonus multipliers
const TIER_BONUS = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 };
const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

// Friendly labels for expedition assets
const ASSET_LABELS = {
  weETH:  'weETH',
  ezETH:  'ezETH',
  weETHs: 'weETHs',
  unibtc: 'uniBTC',
  unieth: 'uniETH',
  cmeth:  'cmETH',
};

// ∑ points × average tier bonus
const EXPEDITION_DENOM = 225_000_000_000 * 1.5;
// Fixed pool of testnet tokens
const TESTNET_POOL_TOKENS = 30_954_838.28;

export default function App() {
  const [address, setAddress]   = useState('');
  const [assets, setAssets]     = useState([]);
  const [expPct, setExpPct]     = useState(10); // default 10%
  const [testPct, setTestPct]   = useState(5);  // default 5%
  const [bonuses, setBonuses]   = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ]);
  const [fdvUsd, setFdvUsd]     = useState(150_000_000);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchExpeditionBreakdown = async (wallet) => {
    const assets = ['weETH', 'ezETH', 'weETHs', 'unibtc', 'unieth', 'cmeth'];
    const lowerWallet = wallet.toLowerCase();
    const results = await Promise.all(
      assets.map(async (asset) => {
        try {
          const url = `https://api.expedition.mitosis.org/v1/status/${lowerWallet}?asset=${asset}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return {
            asset,
            points: parseFloat(data?.mitoPoints?.total || '0'),
            tier: data?.tier?.tier || 1
          };
        } catch (err) {
          console.error(`Expedition fetch failed for ${asset}`, err);
          return { asset, points: 0, tier: 1 };
        }
      })
    );
    return results;
  };

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
      fetchTestnetData(address),
    ])
      .then(([expList, theo, testnet]) =>
        setAssets([...expList, theo, testnet])
      )
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  // Categories
  const expeditionAssets = assets.filter(a =>
    ['weETH','ezETH','weETHs','unibtc','unieth','cmeth'].includes(a.asset)
  );
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault');
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO');

  // 1) Mitosis Expedition
  const totalExpPoints   = expeditionAssets.reduce((s,a) => s + a.points, 0);
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR');
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => TIER_BONUS[a.tier] || 1))
    : 1;
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost / EXPEDITION_DENOM) * 100;
  const expeditionPoolUsd  = (expPct / 100) * fdvUsd;
  const expeditionUSD      = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd);

  // 2) Theo Vault (same FDV% as Expedition)
  const displayTheoPoints = theoAsset
    ? Math.floor(theoAsset.points).toLocaleString('fr-FR')
    : '0';
  const weETH = expeditionAssets.find(a => a.asset === 'weETH');
  const theoTier = weETH ? weETH.tier : 1;
  const theoSharePct  = theoAsset
    ? (theoAsset.points * TIER_BONUS[theoTier] / EXPEDITION_DENOM) * 100
    : 0;
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd);

  // 3) Game of Mito Testnet
  const testnetUSD = testnetAsset
    ? Math.floor(
        (testnetAsset.points / TESTNET_POOL_TOKENS)
        * fdvUsd
        * (testPct / 100)
      )
    : 0;

  // 4) Additional Rewards USD
  const additionalUSD = Math.floor(
    bonuses
      .filter(b => b.selected)
      .reduce((sum,b) => sum + (b.pct / 100) * fdvUsd / b.supply, 0)
  );
  // sum of all bonus % whether checked or not
  const totalBonusPct = bonuses.reduce((s,b) => s + b.pct, 0);

  // Totals
  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD;
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1);

  const toggleBonus = key => {
    setBonuses(bs =>
      bs.map(b => b.key===key ? { ...b, selected: !b.selected } : b)
    );
  };
  const changeBonusPct = (key, pct) => {
    setBonuses(bs =>
      bs.map(b => b.key===key ? { ...b, pct } : b)
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Market Settings */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto space-y-2">
          <h2 className="text-xl font-semibold text-gray-200">
            $MITO Fully Diluted Value (FDV):
          </h2>
          <label className="text-gray-400 text-sm">
            {fdvUsd.toLocaleString('fr-FR')}$
          </label>
          <input
            type="range"
            min={50_000_000}
            max={1_000_000_000}
            step={10_000_000}
            value={fdvUsd}
            onChange={e => setFdvUsd(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* Wallet address */}
        <div>
          <label className="block text-gray-300 mb-2">
            Wallet address
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error && <p className="text-red-500">Erreur : {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            {/* Top cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-items-center">
              {/* Left: Testnet & Additional */}
