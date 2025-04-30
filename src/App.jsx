// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PieChart from './components/PieChart'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

const TIER_BONUS = {1:1.0,2:1.2,3:1.5,4:2.0,5:3.0}
// Expedition denom simplifié
const EXPEDITION_DENOM = 225_000_000_000 * 1.5
// pool fixe Testnet
const TESTNET_POOL_TOKENS = 30_954_838.28

export default function App() {
  const [address, setAddress] = useState('')
  const [assets, setAssets] = useState([])
  const [expPct, setExpPct]   = useState(10)  // 0–15 step 1
  const [testPct, setTestPct] = useState(5)   // 0–15 step 1
  const [bonuses, setBonuses] = useState([
    { key:'morse',      label:'Morse NFT',                 supply:2924,   selected:true, pct:1   },
    { key:'partner',    label:'NFT Partner Collections',   supply:38888,  selected:true, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',           supply:100,    selected:true, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role Bonus', supply:200,    selected:true, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',              supply:1000,   selected:true, pct:2   },
  ])
  const [fdvUsd, setFdvUsd]   = useState(150_000_000)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!address) return
    setLoading(true); setError(null)
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

  const expeditionAssets = assets.filter(a =>
    ['weETH','ezETH','weETHs','unibtc','unieth','cmeth'].includes(a.asset)
  )
  const theoAsset    = assets.find(a => a.asset==='Theo Vault')
  const testnetAsset = assets.find(a => a.asset==='Testnet $MITO')

  // 1) Expedition
  const totalExpPoints   = expeditionAssets.reduce((s,a)=>s+a.points,0)
  const displayExpPoints = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionTierBonus = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a=>TIER_BONUS[a.tier]||1))
    : 1
  const expeditionSharePct = (totalExpPoints * expeditionTierBonus / EXPEDITION_DENOM) * 100
  const expeditionPoolUsd  = (expPct/100)*fdvUsd
  const expeditionUSD      = Math.floor(expeditionSharePct/100 * expeditionPoolUsd)

  // 2) Theo Vault (même % FDV que Expedition)
  const displayTheoPoints = theoAsset
    ? Math.floor(theoAsset.points).toLocaleString('fr-FR')
    : '0'
  const weETHAsset     = expeditionAssets.find(a=>a.asset==='weETH')
  const theoTierBoost  = weETHAsset ? TIER_BONUS[weETHAsset.tier] : 1
  const theoSharePct   = theoAsset
    ? (theoAsset.points * theoTierBoost / EXPEDITION_DENOM) * 100
    : 0
  const theoPoolUsd    = expeditionPoolUsd
  const theoUSD        = Math.floor(theoSharePct/100 * theoPoolUsd)

  // 3) Testnet
  const testnetUSD = testnetAsset
    ? Math.floor(
        (testnetAsset.points / TESTNET_POOL_TOKENS)
        * fdvUsd
        * (testPct/100)
      )
    : 0

  // 4) Additional Rewards
  const additionalUSD = Math.floor(
    bonuses
      .filter(b=>b.selected)
      .reduce((s,b)=>s + (b.pct/100)*fdvUsd/b.supply, 0)
  )
  const totalBonusPct = bonuses.filter(b=>b.selected).reduce((s,b)=>s+b.pct,0)

  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header/>

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
            onChange={e=>setFdvUsd(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* Wallet */}
        <div>
          <label className="block text-gray-300 mb-2">
            Wallet address
          </label>
          <input
            type="text"
            value={address}
            onChange={e=>setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error   && <p className="text-red-500">Erreur : {error}</p>}

        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Gauche : Testnet + Additional */}
              <div className="flex flex-col space-y-6">
                {/* Game of Mito Testnet */}
                {testnetAsset && (
                  <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2">
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
                        onChange={e=>setTestPct(Number(e.target.value))}
                        className="flex-1 accent-blue-500"
                      />
                      <span className="ml-2 text-gray-200 text-sm">{testPct}%</span>
                    </div>
                  </div>
                )}

                {/* Additional Rewards */}
                <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2">
                  <h2 className="text-xl font-semibold text-gray-200">
                    Additional Rewards
                  </h2>
                  {bonuses.map(b=>{
                    let max=1
                    if(b.key==='morse'||b.key==='kaito') max=2
                    return (
                      <div key={b.key} className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={b.selected}
                            onChange={e=>setBonuses(bs=>bs.map(x=>x.key===b.key?{...x,selected:e.target.checked}:x))}
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
                            onChange={e=>setBonuses(bs=>bs.map(x=>x.key===b.key?{...x,pct:Number(e.target.value)}:x))}
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

              {/* Droite : Expedition + Theo Vault */}
              <div className="flex flex-col space-y-6">
                {/* Expedition */}
                <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4">
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
                      max={15}
                      step={1}
                      value={expPct}
                      onChange={e=>setExpPct(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="ml-2 text-gray-200 text-sm">{expPct}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 text-sm">
                    {expeditionAssets.map(a=>(
                      <div key={a.asset} className="space-y-0.5">
                        <p className="text-gray-200 font-medium">{a.asset}</p>
                        <p className="text-white">
                          {Math.floor(a.points).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theo Vault */}
                <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 space-y-2">
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
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 h-[420px] w-full mx-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  Allocation Breakdown (USD)
                </h2>
                <PieChart
                  expeditionUSD={expeditionUSD}
                  theoUSD={theoUSD}
                  testnetUSD={testnetUSD}
                  additionalUSD={additionalUSD}
                  showLabels // affiche les % sur chaque secteur
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
