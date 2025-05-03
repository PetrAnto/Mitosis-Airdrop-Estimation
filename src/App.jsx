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

export default function App() {
  const [address, setAddress]   = useState('')
  const [assets, setAssets]     = useState([])
  const [expPct, setExpPct]     = useState(10)
  const [testPct, setTestPct]   = useState(5)
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
  const [showDetails, setShowDetails] = useState(false)

  // Constants (editable in details)
  const [expDenomBase, setExpDenomBase]       = useState(225_000_000_000)
  const [expDenomFactor, setExpDenomFactor]   = useState(1.5)
  const [testnetPool, setTestnetPool]         = useState(30_954_838.28)

  // Fetch APIs
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

  // Categorize
  const expeditionAssets = assets.filter(a =>
    Object.keys(ASSET_LABELS).includes(a.asset)
  )
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault') || {}
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || {}

  // 1) Expedition
  const totalExpPoints = expeditionAssets.reduce((sum,a) => sum + a.points, 0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => TIER_BONUS[a.tier] || 1))
    : 1
  const expeditionDenom = expDenomBase * expDenomFactor
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost / expeditionDenom) * 100
  const expeditionPoolUsd = (expPct / 100) * fdvUsd
  const expeditionUSD = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd)

  // 2) Theo Vault (same FDV% as Expedition)
  const displayTheoPoints = theoAsset.points
    ? Math.floor(theoAsset.points).toLocaleString('fr-FR')
    : '0'
  const weETH = expeditionAssets.find(a => a.asset === 'weETH')
  const theoTier = weETH ? weETH.tier : 1
  const theoSharePct = theoAsset.points
    ? (theoAsset.points * TIER_BONUS[theoTier] / expeditionDenom) * 100
    : 0
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd)

  // 3) Testnet
  const testnetUSD = testnetAsset.points
    ? Math.floor((testnetAsset.points / testnetPool) * fdvUsd * (testPct / 100))
    : 0

  // 4) Additional Rewards
  const additionalUSD = Math.floor(
    bonuses
      .filter(b => b.selected)
      .reduce((sum,b) => sum + (b.pct / 100) * fdvUsd / b.supply, 0)
  )
  const totalBonusPct = bonuses.reduce((s,b) => s + b.pct, 0)

  // Totals
  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  // Handlers
  const toggleBonus = key =>
    setBonuses(bs => bs.map(b => b.key===key ? { ...b, selected: !b.selected } : b))
  const changeBonusPct = (key,pct) =>
    setBonuses(bs => bs.map(b => b.key===key ? { ...b,pct } : b))

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Market Settings */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto">
          <h2 className="text-xl font-semibold text-gray-200">$MITO Fully Diluted Value (FDV):</h2>
          <div className="flex items-center space-x-3 mt-1">
            <input
              type="range"
              min={50_000_000}
              max={1_000_000_000}
              step={10_000_000}
              value={fdvUsd}
              onChange={e => setFdvUsd(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-gray-200">{fdvUsd.toLocaleString('fr-FR')}$</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* Wallet */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Loading…</p>}
        {error   && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            {/* Top cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 justify-items-center">
              {/* Left: Testnet & Additional */}
              <div className="flex flex-col space-y-6 w-full max-w-md">
                {/* Testnet */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">Game of Mito Testnet</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <input
                      type="range"
                      min={0} max={15} step={1}
                      value={testPct}
                      onChange={e => setTestPct(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-gray-200">{testPct}%</span>
                  </div>
                  <p className="mt-1 text-white">
                    Total Test $MITO: {Math.floor(testnetAsset.points).toLocaleString('fr-FR')}
                  </p>
                </div>

                {/* Additional Rewards */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">Additional Rewards</h2>
                  {bonuses.map(b => {
                    const max = ['morse','kaito'].includes(b.key) ? 2 : 1
                    return (
                      <div key={b.key} className="flex items-center justify-between mt-2">
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
                            min={0} max={max} step={0.1}
                            value={b.pct}
                            onChange={e => changeBonusPct(b.key, Number(e.target.value))}
                            className="w-20 accent-blue-500"
                          />
                          <span className="text-gray-200 text-sm">{b.pct}%</span>
                        </div>
                      </div>
                    )
                  })}
                  <p className="text-gray-200 text-sm mt-3">
                    Total Bonus % FDV: {totalBonusPct.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Right: Expedition & Theo Vault */}
              <div className="flex flex-col space-y-6 w-full max-w-md">
                {/* Expedition */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">Mitosis Expedition</h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <input
                      type="range"
                      min={0} max={20} step={1}
                      value={expPct}
                      onChange={e => setExpPct(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-gray-200">{expPct}%</span>
                  </div>
                  <p className="mt-1 text-white font-bold">
                    Total Expedition Points: {displayExpPoints}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    {expeditionAssets.map(a => (
                      <div key={a.asset} className="space-y-1">
                        <p className="text-gray-200 font-medium">{ASSET_LABELS[a.asset]}</p>
                        <p className="text-white">{Math.floor(a.points).toLocaleString('fr-FR')}</p>
                        <p className="text-gray-400">Tier: {TIER_NAMES[a.tier]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theo Vault */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">Theo Vault</h2>
                  <p className="mt-2 text-white">
                    Points: {displayTheoPoints}
                  </p>
                </div>
              </div>
            </div>

            {/* PieChart & Total Estimated Airdrop */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 justify-items-center">
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md h-[360px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Allocation Breakdown (USD)</h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  theoUSD={theoUSD}
                  testnetUSD={testnetUSD}
                  additionalUSD={additionalUSD}
                  showLabels
                />
              </div>
              <div className="bg-gray-700 rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold text-gray-200 mb-2">Total Estimated Airdrop</h2>
                <p className="text-3xl font-semibold mb-2">${totalUSD.toLocaleString('fr-FR')}</p>
                <ul className="list-disc list-inside text-gray-200 text-sm">
                  <li>Expedition: ${expeditionUSD.toLocaleString('fr-FR')}</li>
                  <li>Theo Vault: ${theoUSD.toLocaleString('fr-FR')}</li>
                  <li>Testnet: ${testnetUSD.toLocaleString('fr-FR')}</li>
                  <li>Additional Rewards: ${additionalUSD.toLocaleString('fr-FR')}</li>
                </ul>
                <p className="pt-2 font-medium text-gray-200">
                  Total % FDV for Airdrop: {totalAirdropPct}%  
                </p>
              </div>
            </div>

            {/* Show/Hide calculation details */}
            <div className="container mx-auto px-6 py-4">
              <button
                onClick={() => setShowDetails(v => !v)}
                className="text-blue-400 underline mb-2"
              >
                {showDetails ? 'Hide calculation details' : 'Show calculation details'}
              </button>

              {showDetails && (
                <div className="bg-gray-800 rounded-2xl p-4 text-sm space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Calculation Details</h3>
                  
                  {/* Expedition */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Expedition</h4>
                    <p>
                      <code>
                        share% = (totalExpPoints × expeditionTierBoost) / (expDenomBase × expDenomFactor) × 100
                      </code>
                    </p>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mt-2">
                      <label className="flex-1">
                        Base denom ∑P:
                        <input 
                          type="number"
                          value={expDenomBase}
                          onChange={e => setExpDenomBase(Number(e.target.value))}
                          className="ml-2 p-1 rounded bg-gray-700"
                        />
                      </label>
                      <label className="flex-1">
                        Tier factor:
                        <input 
                          type="number"
                          step="0.1"
                          value={expDenomFactor}
                          onChange={e => setExpDenomFactor(Number(e.target.value))}
                          className="ml-2 p-1 rounded bg-gray-700"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Theo Vault */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Theo Vault</h4>
                    <p>
                      <code>
                        share% = (theoPoints × tierBonus) / (expDenomBase × expDenomFactor) × 100
                      </code>
                    </p>
                  </div>

                  {/* Testnet */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Testnet</h4>
                    <p>
                      <code>
                        USD = (testnetPoints / testnetPool) × FDV × testPct%
                      </code>
                    </p>
                    <label>
                      Pool tokens:
                      <input
                        type="number"
                        step="0.01"
                        value={testnetPool}
                        onChange={e => setTestnetPool(Number(e.target.value))}
                        className="ml-2 p-1 rounded bg-gray-700"
                      />
                    </label>
                  </div>

                  {/* Additional Rewards */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Additional Rewards</h4>
                    <p>
                      <code>
                        USD = Σ (bonus.pct% × FDV ÷ bonus.supply)
                      </code>
                    </p>
                    <div className="mt-2 space-y-2">
                      {bonuses.map(b => (
                        <label key={b.key} className="flex items-center space-x-2 text-sm">
                          {b.label} supply:
                          <input
                            type="number"
                            value={b.supply}
                            onChange={e => {
                              const v = Number(e.target.value)
                              setBonuses(bs => bs.map(x => x.key===b.key ? { ...x, supply:v } : x))
                            }}
                            className="ml-2 p-1 rounded bg-gray-700"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
