// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import AllocationCard from './components/AllocationCard'
import PieChart from './components/PieChart'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

const TIER_BONUS = { 1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0 }
// pour Expedition : total points × bonus moyen
const EXPEDITION_DENOM = 225_000_000_000 * 1.5
// total fixe des tokens MITO à distribuer en Testnet
const TESTNET_POOL_TOKENS = 30_954_838.28

export default function App() {
  const [address, setAddress] = useState('')
  const [assets, setAssets] = useState([])
  const [expPct, setExpPct] = useState(15)
  const [theoPct, setTheoPct] = useState(10)
  const [testPct, setTestPct] = useState(10)
  const [bonuses, setBonuses] = useState([
    { key: 'morse',      label: 'Morse NFT',                 supply: 2924,  selected: false, pct: 1   },
    { key: 'partner',    label: 'NFT Partner Collections',   supply: 38888, selected: false, pct: 0.5 },
    { key: 'discordMi',  label: 'Discord Mi-Role',           supply: 100,   selected: false, pct: 0.5 },
    { key: 'discordInt', label: 'Discord Intern-Role Bonus', supply: 200,   selected: false, pct: 0.5 },
    { key: 'kaito',      label: 'Kaito Yapper',              supply: 1000,  selected: false, pct: 0.5 },
  ])
  const [fdvUsd, setFdvUsd] = useState(150_000_000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const FDV_USD = fdvUsd

  const handleBonusToggle = (key, sel) =>
    setBonuses(bs => bs.map(b => b.key === key ? { ...b, selected: sel } : b))
  const handleBonusPct = (key, pct) =>
    setBonuses(bs => bs.map(b => b.key === key ? { ...b, pct } : b))

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

  const expeditionAssets = assets.filter(a =>
    ['weETH','ezETH','weETHs','unibtc','unieth','cmeth'].includes(a.asset)
  )
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault')
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO')

  // 1) Expedition points total & affichage
  const totalExpPoints   = expeditionAssets.reduce((s,a) => s + a.points, 0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR')

  // 2) Bonus de tier pour Expedition (max des assets)
  const expeditionTierBonus = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => TIER_BONUS[a.tier] || 1))
    : 1

  // 3) % de part Expedition
  const expeditionSharePct =
    (totalExpPoints * expeditionTierBonus / EXPEDITION_DENOM) * 100

  // 4) USD pool Expedition & allocation
  const expeditionPoolUsd = (expPct / 100) * FDV_USD
  const expeditionUSD     = Math.floor(expeditionSharePct / 100 * expeditionPoolUsd)

  // === NOUVEAU pour Theo Vault ===
  // 5) boost de tier basé sur weETH
  const weETHAsset    = expeditionAssets.find(a => a.asset === 'weETH')
  const theoTierBoost = weETHAsset ? TIER_BONUS[weETHAsset.tier] : 1

  // 6) % de part Theo Vault
  const theoSharePct = theoAsset
    ? (theoAsset.points * theoTierBoost / EXPEDITION_DENOM) * 100
    : 0

  // 7) USD pool Theo Vault & allocation
  const theoPoolUsd = (theoPct / 100) * FDV_USD
  const theoUSD     = Math.floor(theoSharePct / 100 * theoPoolUsd)

  // === Testnet ===
  // 8) USD Testnet selon votre formule demandée
  const testnetUSD = testnetAsset
    ? Math.floor(
        (testnetAsset.points / TESTNET_POOL_TOKENS)
        * FDV_USD
        * (testPct / 100)
      )
    : 0

  // === Additional Rewards ===
  const additionalUSD = Math.floor(
    bonuses
      .filter(b => b.selected)
      .reduce((s,b) => s + (b.pct/100) * FDV_USD / b.supply, 0)
  )

  // Totaux finaux
  const totalUSD       = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalBonusPct  = bonuses.filter(b => b.selected).reduce((s,b) => s + b.pct, 0)
  const totalAirdropPct = (expPct + theoPct + testPct + totalBonusPct).toFixed(1)

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header/>

      {/* Market Settings */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto space-y-2">
          <h2 className="text-xl font-semibold text-gray-200">
            Market Settings
          </h2>
          <label className="text-gray-400 text-sm">
            FDV (USD): {fdvUsd.toLocaleString('fr-FR')}$
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
            placeholder="0x1234...abcd"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error && <p className="text-red-500">Erreur : {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Theo Vault, Testnet, Additional */}
              <div className="flex flex-col space-y-6">
                {theoAsset && (
                  <AllocationCard
                    asset={theoAsset.asset}
                    points={theoAsset.points}
                    showSlider
                    pct={theoPct}
                    onPctChange={setTheoPct}
                  />
                )}

                {testnetAsset && (
                  <AllocationCard
                    asset="Testnet $MITO"
                    points={Math.floor(testnetAsset.points).toLocaleString('fr-FR')}
                    showSlider
                    pct={testPct}
                    onPctChange={setTestPct}
                    pointsLabel="Total Test $MITO :"
                  />
                )}

                <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Additional Rewards
                  </h2>
                  {bonuses.map(b => (
                    <div key={b.key} className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={b.selected}
                          onChange={e => handleBonusToggle(b.key, e.target.checked)}
                          className="accent-blue-500"
                        />
                        <span>{b.label}</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={b.pct}
                          onChange={e => handleBonusPct(b.key, Number(e.target.value))}
                          className="w-20 accent-blue-500"
                        />
                        <span className="text-gray-200 text-sm">
                          {b.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-2">
                    <p className="text-gray-200 text-sm">
                      Total Bonus % FDV: {totalBonusPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Mitosis Expedition */}
              <div className="flex flex-col space-y-6">
                <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 space-y-3">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Mitosis Expedition
                  </h2>
                  <p className="text-white font-bold mb-2">
                    Total Expedition Points: {displayExpPoints}
                  </p>
                  <label className="text-gray-400 text-sm">
                    % of FDV
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={expPct}
                    onChange={e => setExpPct(Number(e.target.value))}
                    className="w-full accent-blue-500 mb-2"
                  />
                  <div className="text-gray-200 text-sm mb-2">
                    {expPct}%
                  </div>
                  <p className="text-gray-400 text-sm">
                    Tier Bonus: {expeditionTierBonus.toFixed(1)}×
                  </p>
                  <div className="space-y-1">
                    {expeditionAssets.map(a => (
                      <div key={a.asset}>
                        <p className="text-gray-200 text-sm font-medium">
                          {a.asset}
                        </p>
                        <p className="text-white text-xs">
                          Points: {Math.floor(a.points).toLocaleString('fr-FR')}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Tier: {a.tier === 1
                            ? 'Bronze'
                            : a.tier === 2
                            ? 'Silver'
                            : a.tier === 3
                            ? 'Gold'
                            : a.tier === 4
                            ? 'Platinum'
                            : 'Diamond'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PieChart & Total Estimated Airdrop */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 h-[360px] w-full mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  Allocation Breakdown (USD)
                </h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  theoUSD={theoUSD}
                  testnetUSD={testnetUSD}
                  additionalUSD={additionalUSD}
                />
              </div>
              <div className="max-w-md bg-gray-700 rounded-2xl shadow-lg p-6 w-full mx-auto">
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
                    Total % FDV of Airdrop: {totalAirdropPct}%  
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
