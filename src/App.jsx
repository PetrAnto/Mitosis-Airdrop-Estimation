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

// Tier mappings
const TIER_BONUS_DEFAULT = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 }
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

export default function App() {
  // Address & Data
  const [address, setAddress] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // FDV & Alloc %
  const [fdvUsd, setFdvUsd] = useState(150_000_000)
  const [expPct, setExpPct] = useState(10)
  const [testPct, setTestPct] = useState(5)

  // Tier bonuses editable
  const [tierBonuses, setTierBonuses] = useState({ ...TIER_BONUS_DEFAULT })
  const [expDenomBase, setExpDenomBase] = useState(225_000_000_000)
  const [expDenomFactor, setExpDenomFactor] = useState(1.5)
  const [testnetPool, setTestnetPool] = useState(30_954_838.28)

  // Additional rewards
  const [bonuses, setBonuses] = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ])

  const [showDetails, setShowDetails] = useState(false)

  // Fetch data
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

  // Categorize
  const expeditionAssets = assets.filter(a => Object.keys(ASSET_LABELS).includes(a.asset))
  const theoAsset = assets.find(a => a.asset === 'Theo Vault') || {}
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || {}

  // ========== CALCULATIONS ==========
  // Expedition denominator
  const EXPEDITION_DENOM = expDenomBase * expDenomFactor

  // Expedition points & boost
  const totalExpPoints = expeditionAssets.reduce((sum,a) => sum + a.points, 0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => tierBonuses[a.tier] || 1))
    : 1

  // Expedition USD
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost / EXPEDITION_DENOM) * 100
  const expeditionPoolUsd = (expPct / 100) * fdvUsd
  const expeditionUSD = Math.floor((expeditionSharePct / 100) * expeditionPoolUsd)

  // Theo Vault
  const theoTier = expeditionAssets.find(a=>a.asset==='weETH')?.tier || 1
  const theoSharePct = theoAsset.points
    ? (theoAsset.points * (tierBonuses[theoTier]||1) / EXPEDITION_DENOM) * 100
    : 0
  const theoUSD = Math.floor((theoSharePct / 100) * expeditionPoolUsd)

  // Testnet USD
  const testnetUSD = testnetAsset.points
    ? Math.floor((testnetAsset.points / testnetPool) * fdvUsd * (testPct / 100))
    : 0

  // Additional Rewards USD
  const additionalUSD = Math.floor(
    bonuses.filter(b=>b.selected)
      .reduce((sum,b) => sum + (b.pct/100)*fdvUsd/b.supply, 0)
  )

  // Totals
  const totalUSD = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalBonusPct = bonuses.reduce((s,b)=>s+b.pct,0)
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  // Handlers
  const toggleBonus = key => setBonuses(bs=>bs.map(b=>b.key===key?{...b,selected:!b.selected}:b))
  const changeBonusPct = (key,pct) => setBonuses(bs=>bs.map(b=>b.key===key?{...b,pct}:b))

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      {/* Market Settings */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto space-y-2">
          <h2 className="text-xl font-semibold text-gray-200">$MITO Fully Diluted Value (FDV):</h2>
          <label className="text-gray-400 text-sm">{fdvUsd.toLocaleString('fr-FR')}$</label>
          <input
            type="range"
            min={50_000_000}
            max={1_000_000_000}
            step={10_000_000}
            value={fdvUsd}
            onChange={e=>setFdvUsd(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* Wallet */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={e=>setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Loading…</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && assets.length>0 && (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {expeditionAssets.map(a=>(
                    <div key={a.asset}>
                      <p className="text-gray-200 font-medium">{ASSET_LABELS[a.asset]}</p>
                      <p className="text-white">{Math.floor(a.points).toLocaleString('fr-FR')}</p>
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

              <AllocationCard title="Additional Rewards" showCheckbox>
                {bonuses.map(b=>(
                  <div key={b.key} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={b.selected} onChange={()=>toggleBonus(b.key)} className="accent-blue-500" />
                      <span>{b.label}</span>
                    </label>
                    <div className="flex items-center space-x-1">
                      <input type="range" min={0} max={(b.key==='morse'||b.key==='kaito')?2:1} step={0.1} value={b.pct} onChange={e=>changeBonusPct(b.key, Number(e.target.value))} className="w-20 accent-blue-500" />
                      <span className="text-gray-200 text-sm">{b.pct}%</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-600 pt-2">
                  <p className="text-gray-200 text-sm">Total Bonus % FDV: {totalBonusPct.toFixed(1)}%</p>
                </div>
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

            {/* ========== DETAILS PANEL ========== */}
            <div className="container mx-auto px-6 py-4">
              <button onClick={()=>setShowDetails(d=>!d)} className="text-blue-400 underline mb-3">
                {showDetails? 'Hide calculation & constants':'Show calculation & constants'}
              </button>

              {showDetails && (
                <div className="bg-gray-800 rounded-2xl p-6 space-y-6 text-sm">
                  {/* Expedition constants */}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Expedition</h4>
                    <p>Formula: <code>(Σ points × max tier bonus) / (expDenomBase × expDenomFactor)</code></p>
                    <div className="flex items-center space-x-2">
                      <label>expDenomBase:</label>
                      <input type="number" value={expDenomBase} onChange={e=>setExpDenomBase(+e.target.value)} className="bg-gray-700 p-1 rounded w-32 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label>expDenomFactor:</label>
                      <input type="number" step="0.1" value={expDenomFactor} onChange={e=>setExpDenomFactor(+e.target.value)} className="bg-gray-700 p-1 rounded w-32 text-white" />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(tierBonuses).map(([tier,bonus])=> (
                        <div key={tier} className="flex flex-col items-center">
                          <label>Tier {tier}</label>
                          <input type="number" step="0.1" value={bonus} onChange={e=>setTierBonuses(tb=>({...tb,[tier]:+e.target.value}))} className="bg-gray-700 p-1 rounded w-16 text-white text-center" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Theo constants */}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Theo Vault</h4>
                    <p>Uses same denominator as Expedition and expedition % slider.</p>
                  </div>

                  {/* Testnet constants */}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Testnet</h4>
                    <div className="flex items-center space-x-2">
                      <label>testnetPool:</label>
                      <input type="number" value={testnetPool} onChange={e=>setTestnetPool(+e.target.value)} className="bg-gray-700 p-1 rounded w-32 text-white" />
                    </div>
                  </div>

                  {/* Additional rewards descriptions */}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Additional Rewards</h4>
                    <p>Each bonus uses <code>(pct% × FDV) ÷ supply</code>.</p>
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
