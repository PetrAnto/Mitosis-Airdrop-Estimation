// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PieChart from './components/PieChart'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

// Pondérations et libellés des tiers
const TIER_BONUS = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 }
const TIER_NAMES = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
}

// Libellés « user-friendly » pour les assets d’expédition
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
  const [expPct, setExpPct]     = useState(10)   // % FDV pour Expedition
  const [testPct, setTestPct]   = useState(5)    // % FDV pour Testnet
  const [bonuses, setBonuses]   = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ])
  const [fdvUsd, setFdvUsd]     = useState(150_000_000) // FDV en USD
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  // Constantes de calcul
  const EXP_BASE   = 225_000_000_000  // ∑ P_j
  const EXP_FACTOR = 1.5              // moyenne bonus tiers
  const TEST_POOL  = 30_954_838.28    // total testnet MITO

  // -------------- Appel des APIs --------------
  useEffect(() => {
    if (!address) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
      fetchTestnetData(address),
    ])
      .then(([expList, theo, testnet]) => {
        setAssets([
          ...expList,
          { asset: 'Theo Vault',    points: theo.points,    tier: theo.tier || 1 },
          { asset: 'Testnet $MITO', points: testnet.points, tier: null },
        ])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [address])

  // -------------- Séparation des catégories --------------
  const expeditionAssets = assets.filter(a => ASSET_LABELS[a.asset])
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault')    || { points:0, tier:1 }
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || { points:0 }

  // -------------- CALCULS --------------

  // 1) Expedition
  const totalExpPoints     = expeditionAssets.reduce((sum, a) => sum + a.points, 0)
  const displayExpPoints   = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionBoost    = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => TIER_BONUS[a.tier] || 1))
    : 1
  const expeditionSharePct = (totalExpPoints * expeditionBoost / (EXP_BASE * EXP_FACTOR)) * 100
  const expeditionUSD      = Math.floor((expeditionSharePct / 100) * (expPct / 100) * fdvUsd)

  // 2) Theo Vault
  const displayTheoPoints  = Math.floor(theoAsset.points).toLocaleString('fr-FR')
  const theoSharePct       = (theoAsset.points * (TIER_BONUS[theoAsset.tier]||1) / (EXP_BASE * EXP_FACTOR)) * 100
  const theoUSD            = Math.floor((theoSharePct / 100) * (expPct / 100) * fdvUsd)

  // 3) Testnet
  const testnetUSD = Math.floor(
    (testnetAsset.points / TEST_POOL)
    * (testPct / 100)
    * fdvUsd
  )

  // 4) Additional Rewards
  const additionalUSD = Math.floor(
    bonuses
      .filter(b => b.selected)
      .reduce((sum, b) => sum + (b.pct/100)*fdvUsd/b.supply, 0)
  )
  const totalBonusPct = bonuses.reduce((sum,b) => sum + b.pct, 0)

  // Totaux globaux
  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      {/* === Market Settings === */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto">
          <h2 className="text-xl font-semibold text-gray-200">
            $MITO Fully Diluted Value (FDV):
          </h2>
          <div className="flex items-center space-x-3 mt-2">
            <input
              type="range"
              min={50_000_000}
              max={1_000_000_000}
              step={10_000_000}
              value={fdvUsd}
              onChange={e => setFdvUsd(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-gray-200">
              {fdvUsd.toLocaleString('fr-FR') }$
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* === Wallet Input === */}
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

        {(!loading && !error && assets.length > 0) && (
          <>
            {/* === Top Cards === */}
            <div className="grid lg:grid-cols-2 gap-10 justify-items-center">

              {/* -- Left Column: Testnet + Additional -- */}
              <div className="space-y-6 w-full max-w-md">
                {/* Testnet */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Game of Mito Testnet
                  </h2>
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
                  <p className="mt-2 text-white">
                    Total Test $MITO: {Math.floor(testnetAsset.points).toLocaleString('fr-FR')}
                  </p>
                </div>

                {/* Additional Rewards */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Additional Rewards
                  </h2>
                  <div className="space-y-2 mt-2">
                    {bonuses.map(b => {
                      const max = ['morse','kaito'].includes(b.key) ? 2 : 1
                      return (
                        <div key={b.key} className="flex justify-between items-center">
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={b.selected}
                              onChange={() => setBonuses(bs => bs.map(x => x.key===b.key
                                ? { ...x, selected: !x.selected }
                                : x
                              ))}
                              className="accent-blue-500"
                            />
                            <span>{b.label}</span>
                          </label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="range"
                              min={0} max={max} step={0.1}
                              value={b.pct}
                              onChange={e => setBonuses(bs => bs.map(x => x.key===b.key
                                ? { ...x, pct: Number(e.target.value) }
                                : x
                              ))}
                              className="w-20 accent-blue-500"
                            />
                            <span className="text-gray-200 text-sm">{b.pct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-gray-200 text-sm">
                    Total Bonus % FDV: {totalBonusPct.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* -- Right Column: Expedition + Theo Vault -- */}
              <div className="space-y-6 w-full max-w-md">
                {/* Expedition */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Mitosis Expedition
                  </h2>
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
                  <p className="mt-2 text-white font-bold">
                    Total Expedition Points: {displayExpPoints}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    {expeditionAssets.map(a => (
                      <div key={a.asset} className="space-y-1">
                        <p className="text-gray-200 font-medium">
                          {ASSET_LABELS[a.asset]}
                        </p>
                        <p className="text-white">
                          {Math.floor(a.points).toLocaleString('fr-FR')}
                        </p>
                        <p className="text-gray-400">
                          Tier: {TIER_NAMES[a.tier]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theo Vault */}
                <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Theo Vault
                  </h2>
                  <p className="mt-2 text-white">
                    Points: {displayTheoPoints}
                  </p>
                </div>
              </div>
            </div>

            {/* === PieChart & Total Airdrop === */}
            <div className="mt-8 grid lg:grid-cols-2 gap-8 justify-items-center">
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md h-[360px]">
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

            {/* === Détails de calcul (optionnel) === */}
            {showDetails && (
              <div className="container mx-auto px-6 py-4">
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-blue-400 underline mb-2"
                >
                  Hide calculation details
                </button>
                <div className="bg-gray-800 rounded-2xl p-4 text-sm space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">
                    Calculation Details
                  </h3>
                  {/* Détails Expedition */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Expedition</h4>
                    <code>
                      share% = (totalPoints × tierBoost) / (baseDenom × factor) × 100
                    </code>
                  </div>
                  {/* Détails Theo Vault */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Theo Vault</h4>
                    <code>
                      share% = (theoPoints × tierBoost) / (baseDenom × factor) × 100
                    </code>
                  </div>
                  {/* Détails Testnet */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Testnet</h4>
                    <code>
                      USD = (testnetPoints / poolTokens) × FDV × testPct%
                    </code>
                  </div>
                  {/* Détails Additional */}
                  <div>
                    <h4 className="font-semibold text-gray-200">Additional Rewards</h4>
                    <code>
                      USD = Σ (pct% × FDV ÷ supply)
                    </code>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
