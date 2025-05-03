// src/App.jsx
import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import PieChart from './components/PieChart'
import {
  fetchExpeditionBreakdown,
  fetchTheoPoints,
  fetchTestnetData,
} from './api/mitosis'

// Default tier bonuses
const DEFAULT_TIER_BONUS = { 1:1.0, 2:1.2, 3:1.5, 4:2.0, 5:3.0 }
// Friendly names
const TIER_NAMES = {
  1:'Bronze',2:'Silver',3:'Gold',4:'Platinum',5:'Diamond',
}
// Assets
const ASSET_LABELS = {
  weETH:'weETH', ezETH:'ezETH', weETHs:'weETHs',
  uniBTC:'uniBTC', uniETH:'uniETH', cmETH:'cmETH',
}

export default function App() {
  // ——— UI state —————————————————————
  const [address, setAddress] = useState('')
  const [assets, setAssets]     = useState([])
  const [expPct, setExpPct]     = useState(10)
  const [testPct, setTestPct]   = useState(5)
  const [bonuses, setBonuses]   = useState([
    { key:'morse',    label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',  label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt',label:'Discord Intern-Role',    supply:200,    selected:false, pct:0.5 },
    { key:'kaito',    label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ])
  const [fdvUsd, setFdvUsd]     = useState(150_000_000)
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // ——— Editable constants —————————————————
  const [expDenomBase, setExpDenomBase]     = useState(225_000_000_000)
  const [expDenomFactor, setExpDenomFactor] = useState(1.5)
  const [testnetPool, setTestnetPool]       = useState(30_954_838.28)
  const [tierBonus, setTierBonus]           = useState({...DEFAULT_TIER_BONUS})

  // ——— Fetching —————————————————————
  useEffect(() => {
    if (!address) return
    setLoading(true); setError(null)
    Promise.all([
      fetchExpeditionBreakdown(address),
      fetchTheoPoints(address),
      fetchTestnetData(address),
    ])
    .then(([expList, theo, testnet]) => setAssets([...expList, theo, testnet]))
    .catch(e => setError(e.message))
    .finally(() => setLoading(false))
  }, [address])

  // ——— Categorize —————————————————————
  const expeditionAssets = assets.filter(a =>
    Object.keys(ASSET_LABELS).includes(a.asset)
  )
  const theoAsset    = assets.find(a=>a.asset==='Theo Vault')    || { points:0 }
  const testnetAsset = assets.find(a=>a.asset==='Testnet $MITO') || { points:0 }

  // ——— 1) Expedition calculations —————————————————
  const totalExpPoints     = expeditionAssets.reduce((s,a)=>s+a.points,0)
  const displayExpPoints   = Math.floor(totalExpPoints).toLocaleString('fr-FR')
  const expeditionBoost    = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a=>tierBonus[a.tier]||1))
    : 1
  const expDenom           = expDenomBase * expDenomFactor
  const expeditionSharePct = (totalExpPoints * expeditionBoost / expDenom)*100
  const expeditionPoolUsd  = (expPct/100)*fdvUsd
  const expeditionUSD      = Math.floor((expeditionSharePct/100)*expeditionPoolUsd)

  // ——— 2) Theo Vault —————————————————
  const displayTheoPoints  = Math.floor(theoAsset.points).toLocaleString('fr-FR')
  const mainWeETH          = expeditionAssets.find(a=>a.asset==='weETH')
  const theoTb             = mainWeETH ? tierBonus[mainWeETH.tier] : 1
  const theoSharePct       = (theoAsset.points * theoTb / expDenom)*100
  const theoUSD            = Math.floor((theoSharePct/100)*expeditionPoolUsd)

  // ——— 3) Testnet —————————————————
  const testnetUSD = Math.floor(
    (testnetAsset.points / testnetPool)
    * fdvUsd
    * (testPct/100)
  )

  // ——— 4) Additional Rewards —————————————————
  const additionalUSD = Math.floor(
    bonuses.filter(b=>b.selected)
      .reduce((sum,b)=>sum + (b.pct/100)*fdvUsd/b.supply, 0)
  )
  const totalBonusPct = bonuses.reduce((s,b)=>s+b.pct,0)

  // ——— Totals —————————————————————
  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + totalBonusPct).toFixed(1)

  // ——— Handlers —————————————————————
  const toggleBonus   = key => setBonuses(bs=>bs.map(b=>b.key===key?{...b,selected:!b.selected}:b))
  const changeBonusPct= (key,p)=> setBonuses(bs=>bs.map(b=>b.key===key?{...b,pct:p}:b))

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header/>

      {/* — Market Settings — */}
      <div className="container mx-auto px-6 py-6">
        <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 mx-auto space-y-2">
          <h2 className="text-xl font-semibold">\$MITO Fully Diluted Value (FDV):</h2>
          <p className="text-gray-400">{fdvUsd.toLocaleString('fr-FR')}$</p>
          <input type="range"
            min={50_000_000} max={1_000_000_000} step={10_000_000}
            value={fdvUsd} onChange={e=>setFdvUsd(+e.target.value)}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* — Wallet — */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input type="text"
            value={address}
            onChange={e=>setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700"
          />
        </div>

        {loading && <p className="text-gray-400">Loading…</p>}
        {error   && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && assets.length>0 && (
        <>
          {/* … your existing cards & pie here … */}

          {/* — Show / Hide Calculation Details — */}
          <div className="container mx-auto px-6">
            <button
              onClick={()=>setShowDetails(d=>!d)}
              className="text-blue-400 underline mb-2"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {showDetails && (
              <div className="bg-gray-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-200">
                  Calculation Details
                </h3>

                {/* Expedition constants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400">Expedition Base</label>
                    <input type="number"
                      value={expDenomBase}
                      onChange={e=>setExpDenomBase(+e.target.value)}
                      className="mt-1 w-full p-1 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400">Expedition Factor</label>
                    <input type="number" step="0.1"
                      value={expDenomFactor}
                      onChange={e=>setExpDenomFactor(+e.target.value)}
                      className="mt-1 w-full p-1 bg-gray-700 rounded"
                    />
                  </div>
                </div>

                {/* Fraction UI for Expedition % */}
                <div>
                  <h4 className="font-semibold text-gray-200">Expedition %</h4>
                  <div className="w-full max-w-xs mx-auto">
                    <div className="bg-gray-700 px-4 py-2 text-center text-white">
                      {totalExpPoints} × {expeditionBoost}
                    </div>
                    <div className="border-t border-gray-600"></div>
                    <div className="bg-gray-700 px-4 py-2 text-center text-white">
                      {expDenomBase} × {expDenomFactor}
                    </div>
                  </div>
                  <p className="text-gray-400 mt-1">× 100 = {expeditionSharePct.toFixed(4)}%</p>
                </div>

                {/* Theo constants & formula */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-200">Theo Vault %</h4>
                  <div className="w-full max-w-xs mx-auto">
                    <div className="bg-gray-700 px-4 py-2 text-center text-white">
                      {theoAsset.points} × {theoTb}
                    </div>
                    <div className="border-t border-gray-600"></div>
                    <div className="bg-gray-700 px-4 py-2 text-center text-white">
                      {expDenomBase} × {expDenomFactor}
                    </div>
                  </div>
                  <p className="text-gray-400 mt-1">× 100 = {theoSharePct.toFixed(4)}%</p>
                </div>

                {/* Testnet constants & formula */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-gray-400">Testnet Pool</label>
                    <input type="number"
                      value={testnetPool}
                      onChange={e=>setTestnetPool(+e.target.value)}
                      className="mt-1 w-full p-1 bg-gray-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400">Testnet % slider</label>
                    <input type="number" step="1"
                      value={testPct}
                      onChange={e=>setTestPct(+e.target.value)}
                      className="mt-1 w-full p-1 bg-gray-700 rounded"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold text-gray-200">Testnet USD</h4>
                  <div className="w-full max-w-xs mx-auto">
                    <div className="bg-gray-700 px-4 py-2 text-center text-white">
                      {testnetAsset.points} ÷ {testnetPool}
                    </div>
                    <div className="border-t border-gray-600"></div>
                    <div className="bg-gray-700 px-4 py-2 text-center text-white">
                      FDV × {testPct}%
                    </div>
                  </div>
                  <p className="text-gray-400 mt-1">= ${testnetUSD.toLocaleString('fr-FR')}</p>
                </div>

                {/* Additional‐Rewards constants & formula */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-200">Bonus Supplies</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {bonuses.map(b => (
                      <div key={b.key}>
                        <label className="block text-gray-400">{b.label}</label>
                        <input type="number"
                          value={b.supply}
                          onChange={e=>{
                            const val = +e.target.value
                            setBonuses(bs=>bs.map(x=>x.key===b.key?{...x,supply:val}:x))
                          }}
                          className="mt-1 w-full p-1 bg-gray-700 rounded"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-200">
                      Additional USD formula
                    </h4>
                    <div className="w-full max-w-xs mx-auto">
                      <div className="bg-gray-700 px-4 py-2 text-center text-white">
                        Σ (bonusPct% × FDV)
                      </div>
                      <div className="border-t border-gray-600"></div>
                      <div className="bg-gray-700 px-4 py-2 text-center text-white">
                        bonusSupply
                      </div>
                    </div>
                    <p className="text-gray-400 mt-1">
                      = ${additionalUSD.toLocaleString('fr-FR')}
                    </p>
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
