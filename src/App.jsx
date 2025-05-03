// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PieChart from './components/PieChart'
import AllocationCard from './components/AllocationCard'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

// Default tier bonuses and names
const DEFAULT_TIER_BONUS = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 }
const TIER_NAMES = {
  1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Diamond',
}

// Asset labels
const ASSET_LABELS = {
  weETH:  'weETH', ezETH:  'ezETH', weETHs: 'weETHs',
  uniBTC: 'uniBTC', uniETH: 'uniETH', cmETH:  'cmETH',
}

export default function App() {
  const [address, setAddress] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // FDV and allocation percentages
  const [fdvUsd, setFdvUsd] = useState(150_000_000)
  const [expPct, setExpPct] = useState(10)
  const [testPct, setTestPct] = useState(5)

  // Expedition constants editable
  const [expDenomBase, setExpDenomBase] = useState(225_000_000_000)
  const [expDenomFactor, setExpDenomFactor] = useState(1.5)
  const [tierBonuses, setTierBonuses] = useState({ ...DEFAULT_TIER_BONUS })

  // Testnet constant
  const [testnetPool, setTestnetPool] = useState(30_954_838.28)

  // Additional reward constants are inside bonuses state
  const [bonuses, setBonuses] = useState([
    { key: 'morse',   label: 'Morse NFT',               supply: 2924, selected: false, pct: 1   },
    { key: 'partner', label: 'NFT Partner Collections', supply: 38888, selected: false, pct: 0.5 },
    { key: 'discordMi', label: 'Discord Mi-Role',       supply: 100, selected: false, pct: 0.5 },
    { key: 'discordInt', label: 'Discord Intern-Role',   supply: 200, selected: false, pct: 0.5 },
    { key: 'kaito',    label: 'Kaito Yapper',            supply: 1000, selected: false, pct: 2   },
  ])

  // Toggle details panel
  const [showDetails, setShowDetails] = useState(false)

  // Fetch data when address changes
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
  const expeditionAssets = assets.filter(a => ASSET_LABELS[a.asset])
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault') || {}
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || {}

  // === EXPEDITION CALCULATIONS ===
  const EXPEDITION_DENOM = expDenomBase * expDenomFactor
  const totalExpPoints = expeditionAssets.reduce((sum, a) => sum + a.points, 0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => tierBonuses[a.tier] || 1))
    : 1
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost / EXPEDITION_DENOM) * 100
  const expeditionPoolUsd = (expPct / 100) * fdvUsd
  const expeditionUSD = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd)

  // === THEO VAULT CALCULATIONS ===
  const theoTier = expeditionAssets.find(a => a.asset === 'weETH')?.tier || 1
  const theoSharePct = theoAsset.points
    ? (theoAsset.points * (tierBonuses[theoTier] || 1) / EXPEDITION_DENOM) * 100
    : 0
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd)

  // === TESTNET CALCULATIONS ===
  const testnetUSD = testnetAsset.points
    ? Math.floor((testnetAsset.points / testnetPool) * fdvUsd * (testPct / 100))
    : 0

  // === ADDITIONAL REWARDS CALCULATIONS ===
  const additionalUSD = Math.floor(
    bonuses.filter(b => b.selected)
      .reduce((sum, b) => sum + (b.pct / 100) * fdvUsd / b.supply, 0)
  )
  const totalBonusPct = bonuses.reduce((sum, b) => sum + b.pct, 0)

  // Total Airdrop
  const totalUSD = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  // Handlers
  const toggleBonus = key =>
    setBonuses(bs => bs.map(b => b.key === key ? { ...b, selected: !b.selected } : b))
  const changeBonusPct = (key, pct) =>
    setBonuses(bs => bs.map(b => b.key === key ? { ...b, pct } : b))

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Market Settings */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto space-y-2">
          <h2 className="text-xl font-semibold text-gray-200">
            $MITO Fully Diluted Value (FDV):
          </h2>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={50_000_000}
              max={1_000_000_000}
              step={10_000_000}
              value={fdvUsd}
              onChange={e => setFdvUsd(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-gray-400 text-sm">
              {fdvUsd.toLocaleString('fr-FR')}$
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* Wallet input */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>  {/* Cards grid */}
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
                      <p className="text-gray-200 font-medium">{ASSET_LABELS[a.asset]}</p>
                      <p className="text-white">{Math.floor(a.points).toLocaleString('fr-FR')}</p>
                      <p className="text-gray-400">Tier: {TIER_NAMES[a.tier]}</p>
                    </div>
                  ))}
                </div>
              </AllocationCard>

              <AllocationCard title="Theo Vault" points={theoAsset.points} usd={theoUSD} />

              <AllocationCard title="Additional Rewards" showCheckbox>
                {bonuses.map(b => (
                  <div key={b.key} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={b.selected} onChange={() => toggleBonus(b.key)} className="accent-blue-500" />
                      <span>{b.label}</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="range"
                        min={0}
                        max={['morse','kaito'].includes(b.key) ? 2 : 1}
                        step={0.1}
                        value={b.pct}
                        onChange={e => changeBonusPct(b.key, Number(e.target.value))}
                        className="w-20 accent-blue-500"
                      />
                      <span className="text-gray-200 text-sm">{b.pct}%</span>
                    </div>
                  </div>
                ))}
              </AllocationCard>
            </div>

            {/* Pie & Total */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div className="bg-gray-800 rounded-2xl p-6 h-64">
                <h3 className="text-lg font-semibold mb-4">Allocation Breakdown (USD)</h3>
                <PieChart expeditionUSD={expeditionUSD} theoUSD={theoUSD} testnetUSD={testnetUSD} additionalUSD={additionalUSD} />
              </div>
              <div className="bg-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-2">Total Estimated Airdrop</h3>
                <p className="text-2xl font-bold mb-2">${totalUSD.toLocaleString('fr-FR')}</p>
                <ul className="list-disc list-inside text-gray-200 text-sm space-y-1">
                  <li>Expedition: ${expeditionUSD.toLocaleString('fr-FR')}</li>
                  <li>Theo Vault: ${theoUSD.toLocaleString('fr-FR')}</li>
                  <li>Testnet: ${testnetUSD.toLocaleString('fr-FR')}</li>
                  <li>Additional: ${additionalUSD.toLocaleString('fr-FR')}</li>
                </ul>
                <p className="mt-2 font-medium">Total % FDV for Airdrop: {totalAirdropPct}%</p>
              </div>
            </div>

            {/* Details panel */}
            <div className="container mx-auto px-6 py-4">
              <button onClick={() => setShowDetails(d => !d)} className="text-blue-400 underline mb-3">
                {showDetails ? 'Hide details & constants' : 'Show details & constants'}
              </button>
              {showDetails && (
                <div className="bg-gray-800 rounded-2xl p-6 space-y-6 text-sm">
                  {/* Expedition section */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Expedition</h4>
                    <p>
                      <code>
                        (Σ userPoints × maxTierBonus)
                        <br/>
                        —————————————————————
                        <br/>
                        (expDenomBase × expDenomFactor)
                      </code>
                    </p>
                    <p className="text-gray-400">Points weighted by highest tier bonus, divided by total system points × average tier factor.</p>
                    <div className="flex space-x-4">
                      <div>
                        <label>expDenomBase:</label>
                        <input type="number" value={expDenomBase} onChange={e => setExpDenomBase(+e.target.value)} className="bg-gray-700 p-1 rounded w-32 text-white" />
                      </div>
                      <div>
                        <label>expDenomFactor:</label>
                        <input type="number" step="0.1" value={expDenomFactor} onChange={e => setExpDenomFactor(+e.target.value)} className="bg-gray-700 p-1 rounded w-32 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {Object.entries(tierBonuses).map(([tier,bonus]) => (
                        <div key={tier} className="flex flex-col items-center">
                          <label>Tier {tier}</label>
                          <input type="number" step="0.1" value={bonus} onChange={e=>setTierBonuses(tb=>({...tb,[tier]:+e.target.value}))} className="bg-gray-700 p-1 rounded w-16 text-white text-center" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theo Vault section */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Theo Vault</h4>
                    <p className="text-gray-400">Uses same denominator and expedition % slider as Expedition.</p>
                  </div>

                  {/* Testnet section */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Testnet</br></h4>
                    <p><code>(userTestnetPoints ÷ testnetPool) × FDV × testPct%</code></p>
                    <div className="mt-2">
                      <label>testnetPool:</label>
                      <input type="number" value={testnetPool} onChange={e=>setTestnetPool(+e.target.value)} className="bg-gray-700 p-1 rounded w-32 text-white ml-2" />
                    </div>
                  </div>

                  {/* Additional section */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Additional Rewards</h4>
                    <p className="text-gray-400">Allocation = Σ (bonusPct% × FDV ÷ supply)</p>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                      {bonuses.map(b => (
                        <div key={b.key} className="flex flex-col">
                          <label className="flex-1">{b.label} supply:</label>
                          <input type="number" value={b.supply} onChange={e=>setBonuses(bs=>bs.map(x=>x.key===b.key?{...x,supply:+e.target.value}:x))} className="bg-gray-700 p-1 rounded w-full text-white" />
                        </div>
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
