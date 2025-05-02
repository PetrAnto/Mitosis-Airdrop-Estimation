// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PieChart from './components/PieChart'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

// Mapping tiers to names and bonus multipliers
const TIER_BONUS = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 }
const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
}

// Friendly labels for expedition assets
const ASSET_LABELS = {
  weETH:  'weETH',
  ezETH:  'ezETH',
  weETHs: 'weETHs',
  uniBTC: 'uniBTC',
  uniETH: 'uniETH',
  cmETH:  'cmETH',
}

// ∑ points × average tier bonus
const EXPEDITION_DENOM = 225_000_000_000 * 1.5
// Fixed pool of testnet tokens
const TESTNET_POOL_TOKENS = 30_954_838.28

export default function App() {
  const [address, setAddress]   = useState('')
  const [assets, setAssets]     = useState([])
  const [expPct, setExpPct]     = useState(10) // default 10%
  const [testPct, setTestPct]   = useState(5)  // default 5%
  const [bonuses, setBonuses]   = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ])
  const [fdvUsd, setFdvUsd]     = useState(150_000_000)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
      fetchTestnetData(address),
    ])
      .then(([expList, theo, testnet]) =>
        setAssets([...expList, theo, testnet])
      )
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [address])

  // Categories
  const expeditionAssets = assets.filter(a =>
    ['weETH','ezETH','weETHs','uniBTC','uniETH','cmETH'].includes(a.asset)
  )
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault')
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO')

  // 1) Mitosis Expedition
  const totalExpPoints   = expeditionAssets.reduce((s,a) => s + a.points, 0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => TIER_BONUS[a.tier] || 1))
    : 1
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost / EXPEDITION_DENOM) * 100
  const expeditionPoolUsd  = (expPct / 100) * fdvUsd
  const expeditionUSD      = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd)

  // 2) Theo Vault (same FDV% as Expedition)
  const displayTheoPoints = theoAsset
    ? Math.floor(theoAsset.points).toLocaleString('fr-FR')
    : '0'
  const weETH = expeditionAssets.find(a => a.asset === 'weETH')
  const theoTier = weETH ? weETH.tier : 1
  const theoSharePct  = theoAsset
    ? (theoAsset.points * TIER_BONUS[theoTier] / EXPEDITION_DENOM) * 100
    : 0
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd)

  // 3) Game of Mito Testnet
  const testnetUSD = testnetAsset
    ? Math.floor(
        (testnetAsset.points / TESTNET_POOL_TOKENS)
        * fdvUsd
        * (testPct / 100)
      )
    : 0

  // 4) Additional Rewards USD
  const additionalUSD = Math.floor(
    bonuses
      .filter(b => b.selected)
      .reduce((sum,b) => sum + (b.pct / 100) * fdvUsd / b.supply, 0)
  )
  // sum of all bonus % whether checked or not
  const totalBonusPct = bonuses.reduce((s,b) => s + b.pct, 0)

  // Totals
  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  const toggleBonus = key => {
    setBonuses(bs =>
      bs.map(b => b.key===key ? { ...b, selected: !b.selected } : b)
    )
  }
  const changeBonusPct = (key, pct) => {
    setBonuses(bs =>
      bs.map(b => b.key===key ? { ...b, pct } : b)
    )
  }

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
              <div className="flex flex-col space-y-6 w-full max-w-md">
                {/* Game of Mito Testnet */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2 w-full">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Game of Mito Testnet
                  </h2>
                  <p className="text-white">
                    Total Test $MITO: {Math.floor(testnetAsset.points).toLocaleString('fr-FR')}
                  </p>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={1}
                      value={testPct}
                      onChange={e => setTestPct(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="ml-2 text-gray-200 text-sm">{testPct}%</span>
                  </div>
                </div>

                {/* Additional Rewards */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2 w-full">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Additional Rewards
                  </h2>
                  {bonuses.map(b => {
                    const max = (b.key==='morse'||b.key==='kaito') ? 2 : 1
                    return (
                      <div key={b.key} className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={b.selected}
                            onChange={() => toggleBonus(b.key)}
                            className="accent-blue-500"
                          />
                          <span>{b.label}</span>
                        </label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="range"
                            min={0}
                            max={max}
                            step={0.1}
                            value={b.pct}
                            onChange={e => changeBonusPct(b.key, Number(e.target.value))}
                            className="w-20 accent-blue-500"
                          />
                          <span className="text-gray-200 text-sm">{b.pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                  <div className="border-t border-gray-600 pt-2">
                    <p className="text-gray-200 text-sm">
                      Total Bonus % FDV: {totalBonusPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Expedition & Theo Vault */}
              <div className="flex flex-col space-y-6 w-full max-w-md">
                {/* Mitosis Expedition */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4 w-full">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Mitosis Expedition
                  </h2>
                  <p className="text-white font-bold mb-2">
                    Total Expedition Points: {displayExpPoints}
                  </p>
                  <div className="flex items-center mb-4">
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={expPct}
                      onChange={e => setExpPct(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="ml-2 text-gray-200 text-sm">{expPct}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {expeditionAssets.map(a => (
                      <div key={a.asset} className="space-y-0.5">
                        <p className="text-gray-200 font-medium">
                          {ASSET_LABELS[a.asset]}
                        </p>
                        <p className="text-white">
                          {Math.floor(a.points).toLocaleString('fr-FR')}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Tier: {TIER_NAMES[a.tier]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theo Vault */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4 w-full">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Theo Vault
                  </h2>
                  <p className="text-white">
                    Points: {displayTheoPoints}
                  </p>
                </div>
              </div>
            </div>

            {/* PieChart & Total Estimated Airdrop */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-[360px] w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  Allocation Breakdown (USD)
                </h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  theoUSD={theoUSD}
                  testnetUSD={testnetUSD}
                  additionalUSD={additionalUSD}
                  showLabels
                />
              </div>
              <div className="bg-gray-700 rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold text-gray-200 mb-2">
                  Total Estimated Airdrop
                </h2>
                <p className="text-3xl font-semibold mb-2">
                  ${totalUSD.toLocaleString('fr-FR')}
                </p>
                <div className="space-y-1 text-gray-200 text-sm">
                  <p>• Mitosis Expedition: ${expeditionUSD.toLocaleString('fr-FR')}</p>
                  <p>• Theo Vault: ${theoUSD.toLocaleString('fr-FR')}</p>
                  <p>• Testnet: ${testnetUSD.toLocaleString('fr-FR')}</p>
                  <p>• Additional Rewards: ${additionalUSD.toLocaleString('fr-FR')}</p>
                  <p className="pt-2 font-medium">
                    Total % FDV for Airdrop: {totalAirdropPct}%  
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
