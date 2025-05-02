// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PieChart from './components/PieChart'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

// Tier mappings
const TIER_BONUS = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 }
const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
}

// Asset labels
const ASSET_LABELS = {
  weETH:  'weETH',
  ezETH:  'ezETH',
  weETHs: 'weETHs',
  uniBTC: 'uniBTC',
  uniETH: 'uniETH',
  cmETH:  'cmETH',
}

// Denominators
const EXPEDITION_DENOM = 225_000_000_000 * 1.5
const TESTNET_POOL = 30_954_838.28

export default function App() {
  const [address, setAddress] = useState('')
  const [assets, setAssets] = useState([])
  const [expPct, setExpPct] = useState(10)
  const [testPct, setTestPct] = useState(5)
  const [bonuses, setBonuses] = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ])
  const [fdvUsd, setFdvUsd] = useState(150_000_000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
      fetchTestnetData(address),
    ])
      .then(([expList, theo, testnet]) => setAssets([...expList, theo, testnet]))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [address])

  // Categorize assets
  const expeditionAssets = assets.filter(a => Object.keys(ASSET_LABELS).includes(a.asset))
  const theoAsset = assets.find(a => a.asset === 'Theo Vault') || {}
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || {}

  // Expedition calculations
  const totalExpPoints = expeditionAssets.reduce((sum, a) => sum + a.points, 0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('en-US')
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => TIER_BONUS[a.tier] || 1))
    : 1
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost / EXPEDITION_DENOM) * 100
  const expeditionPoolUsd = (expPct / 100) * fdvUsd
  const expeditionUSD = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd)

  // Theo Vault calculations
  const displayTheoPoints = theoAsset.points
    ? Math.floor(theoAsset.points).toLocaleString('en-US')
    : '0'
  const weETH = expeditionAssets.find(a => a.asset === 'weETH')
  const theoTier = weETH ? weETH.tier : 1
  const theoSharePct = theoAsset.points
    ? (theoAsset.points * TIER_BONUS[theoTier] / EXPEDITION_DENOM) * 100
    : 0
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd)

  // Testnet calculations
  const testnetUSD = testnetAsset.points
    ? Math.floor((testnetAsset.points / TESTNET_POOL) * fdvUsd * (testPct / 100))
    : 0

  // Additional Rewards calculations
  const additionalUSD = Math.floor(
    bonuses.filter(b => b.selected)
      .reduce((sum, b) => sum + (b.pct / 100) * fdvUsd / b.supply, 0)
  )
  const totalBonusPct = bonuses.reduce((sum, b) => sum + b.pct, 0)

  // Totals
  const totalUSD = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  const toggleBonus = key => setBonuses(bs =>
    bs.map(b => b.key === key ? { ...b, selected: !b.selected } : b)
  )
  const changeBonusPct = (key, pct) => setBonuses(bs =>
    bs.map(b => b.key === key ? { ...b, pct } : b)
  )

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header title="Try to estimate your airdrop value" />

      {/* FDV slider */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto space-y-2">
          <h2 className="text-xl font-semibold">$MITO Fully Diluted Value (FDV):</h2>
          <label className="text-gray-400 text-sm">{fdvUsd.toLocaleString('en-US')}$</label>
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
          <label className="block text-gray-300 mb-2">Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value.trim())}
            placeholder="0x..."
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            {/* Top cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-items-center">
              {/* Left column: Testnet & Additional */}
              <div className="flex flex-col space-y-6 w-full max-w-md">
                <AllocationCard
                  title="Game of Mito Testnet"
                  points={testnetAsset.points}
                  usd={testnetUSD}
                  showSlider
                  pct={testPct}
                  onPctChange={setTestPct}
                />

                <AllocationCard title="Additional Rewards" showCheckbox>
                  {bonuses.map(b => (
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
                          max={(b.key==='morse'||b.key==='kaito') ? 2 : 1}
                          step={0.1}
                          value={b.pct}
                          onChange={e => changeBonusPct(b.key, Number(e.target.value))}
                          className="w-20 accent-blue-500"
                        />
                        <span className="text-gray-200 text-sm">{b.pct}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-2">
                    <p className="text-gray-200 text-sm">Total Bonus % FDV: {totalBonusPct.toFixed(1)}%</p>
                  </div>
                </AllocationCard>
              </div>

              {/* Right column: Expedition & Theo */}
              <div className="flex flex-col space-y-6 w-full max-w-md">
                <AllocationCard
                  title="Mitosis Expedition"
                  points={displayExpPoints}
                  usd={expeditionUSD}
                  showSlider
                  pct={expPct}
                  onPctChange={setExpPct}
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {expeditionAssets.map(a => (
                      <div key={a.asset}>
                        <p className="text-gray-200 font-medium">{ASSET_LABELS[a.asset]}</p>
                        <p className="text-white">{Math.floor(a.points).toLocaleString('en-US')}</p>
                        <p className="text-gray-400">Tier: {TIER_NAMES[a.tier]}</p>
                      </div>
                    ))}
                  </div>
                </AllocationCard>

                <AllocationCard
                  title="Theo Vault"
                  points={theoAsset.points}
                  usd={theoUSD}
                />
              </div>
            </div>

            {/* PieChart & Total Estimated Airdrop */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 h-[360px] w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Allocation Breakdown (USD)</h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  theoUSD={theoUSD}
                  testnetUSD={testnetUSD}
                  additionalUSD={additionalUSD}
                />
              </div>

              <div className="bg-gray-700 rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold text-gray-200 mb-2">Total Estimated Airdrop</h2>
                <p className="text-3xl font-semibold mb-2">${totalUSD.toLocaleString('en-US')}</p>
                <div className="space-y-1 text-gray-200 text-sm">
                  <p>• Expedition: ${expeditionUSD.toLocaleString('en-US')}</p>
                  <p>• Theo Vault: ${theoUSD.toLocaleString('en-US')}</p>
                  <p>• Testnet: ${testnetUSD.toLocaleString('en-US')}</p>
                  <p>• Additional Rewards: ${additionalUSD.toLocaleString('en-US')}</p>
                </div>
                <p className="pt-2 font-medium">Total % FDV for Airdrop: {totalAirdropPct}%</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
