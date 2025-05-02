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

// Labels et mappings
const ASSET_LABELS = {
  weETH:  'weETH',
  ezETH:  'ezETH',
  weETHs: 'weETHs',
  uniBTC: 'uniBTC',
  uniETH: 'uniETH',
  cmETH:  'cmETH',
}

// *** DÉBUT App ***
export default function App() {
  // --- États principaux ---
  const [address, setAddress] = useState('')
  const [assets, setAssets]   = useState([])  // tous les assets (expedition + theo + testnet)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // Sliders d'alloc % de FDV
  const [fdvUsd, setFdvUsd]   = useState(150_000_000)
  const [expPct, setExpPct]   = useState(10) // Expedition %
  const [testPct, setTestPct] = useState(5)  // Testnet %

  // Bonus additionnels (avec supplies modifiables)
  const [bonuses, setBonuses] = useState([
    { key:'morse',      label:'Morse NFT',               supply:2924,   selected:false, pct:1   },
    { key:'partner',    label:'NFT Partner Collections', supply:38888,  selected:false, pct:0.5 },
    { key:'discordMi',  label:'Discord Mi-Role',         supply:100,    selected:false, pct:0.5 },
    { key:'discordInt', label:'Discord Intern-Role',     supply:200,    selected:false, pct:0.5 },
    { key:'kaito',      label:'Kaito Yapper',            supply:1000,   selected:false, pct:2   },
  ])

  // --- Nouveaux états pour les constantes modifiables ---
  const [expSumPoints, setExpSumPoints]   = useState(225_000_000_000)  // ∑ P_j
  const [avgTierBonus, setAvgTierBonus]   = useState(1.5)              // moyenne des bonus tiers
  const [tierBonuses, setTierBonuses]     = useState({                 // mapping tier→bonus
    1:1.0, 2:1.2, 3:1.5, 4:2.0, 5:3.0
  })

  // Contrôle du panneau de détails
  const [showDetails, setShowDetails] = useState(false)

  // --- Chargement des données API ---
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

  // --- Séparation des catégories ---
  const expeditionAssets = assets.filter(a =>
    Object.keys(ASSET_LABELS).includes(a.asset)
  )
  const theoAsset    = assets.find(a => a.asset === 'Theo Vault') || {}
  const testnetAsset = assets.find(a => a.asset === 'Testnet $MITO') || {}

  // --- CALCULS ---

  // Total points expedition et boost appliqué
  const totalExpPoints = expeditionAssets.reduce((sum,a) => sum + a.points, 0)
  const expeditionTierBoost = expeditionAssets.length
    ? Math.max(...expeditionAssets.map(a => tierBonuses[a.tier]||1))
    : 1

  // Part Expédition % sur FDV
  const expeditionSharePct = (totalExpPoints * expeditionTierBoost) / (expSumPoints * avgTierBonus) * 100
  const expeditionPoolUsd  = fdvUsd * (expPct/100)
  const expeditionUSD      = Math.floor(expeditionSharePct/100 * expeditionPoolUsd)

  // Theo Vault (même % de FDV que Expedition)
  const theoTier   = expeditionAssets.find(a=>a.asset==='weETH')?.tier || 1
  const theoSharePct = theoAsset.points
    ? (theoAsset.points * tierBonuses[theoTier] / (expSumPoints * avgTierBonus)) * 100
    : 0
  const theoUSD = Math.floor(theoSharePct/100 * expeditionPoolUsd)

  // Testnet
  const TESTNET_POOL = 30_954_838.28
  const testnetUSD = Math.floor(
    (testnetAsset.points/TESTNET_POOL)
    * fdvUsd * (testPct/100)
  )

  // Additional
  const additionalUSD = bonuses
    .filter(b=>b.selected)
    .reduce((sum,b) =>
      sum + (b.pct/100)*fdvUsd / b.supply
    , 0) | 0

  // Totaux
  const totalUSD        = expeditionUSD + theoUSD + testnetUSD + additionalUSD
  const totalAirdropPct = (expPct + testPct + bonuses.reduce((s,b)=>s+b.pct,0)).toFixed(1)

  // --- Rendu ---
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
            type="range" min={50e6} max={1e9} step={1e6}
            value={fdvUsd}
            onChange={e=>setFdvUsd(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <main className="container mx-auto px-6 py-4 space-y-10">
        {/* Wallet input */}
        <div>
          <label className="block text-gray-300 mb-2">Wallet address</label>
          <input
            type="text"
            value={address}
            onChange={e=>setAddress(e.target.value.trim())}
            placeholder="0x…"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-500"
          />
        </div>

        {loading && <p className="text-gray-400">Chargement…</p>}
        {error   && <p className="text-red-500">Erreur : {error}</p>}

        {!loading && !error && assets.length>0 && (
          <>
            {/* Allocation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <AllocationCard
                  title="Game of Mito Testnet"
                  points={testnetAsset.points}
                  usd={testnetUSD}
                  showSlider
                  pct={testPct}
                  onPctChange={setTestPct}
                />

                <AllocationCard
                  title="Additional Rewards"
                  showCheckbox
                >
                  {/* Rendu interne des bonus déjà géré dans AllocationCard */}
                  {bonuses.map(b=>(
                    <div key={b.key} className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox"
                          checked={b.selected}
                          onChange={()=>setBonuses(bs=>
                            bs.map(x=>x.key===b.key?{...x,selected:!x.selected}:x)
                          )}
                          className="accent-blue-500"
                        />
                        <span>{b.label}</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input type="range"
                          min={0} max={5} step={0.1}
                          value={b.pct}
                          onChange={e=>setBonuses(bs=>
                            bs.map(x=>x.key===b.key?{...x,pct:Number(e.target.value)}:x)
                          )}
                          className="w-20 accent-blue-500"
                        />
                        <span className="text-gray-200 text-sm">{b.pct}%</span>
                      </div>
                      <input type="number"
                        className="w-16 bg-gray-700 text-white text-sm p-1 rounded"
                        value={b.supply}
                        onChange={e=>setBonuses(bs=>
                          bs.map(x=>x.key===b.key?{...x,supply:Number(e.target.value)}:x)
                        )}
                      />
                    </div>
                  ))}
                </AllocationCard>
              </div>

              <div className="space-y-6">
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
                        <p className="text-gray-200 font-medium">
                          {ASSET_LABELS[a.asset]}
                        </p>
                        <p className="text-white">
                          {Math.floor(a.points).toLocaleString('fr-FR')}
                        </p>
                        <p className="text-gray-400">
                          Tier: {a.tier}
                        </p>
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

            {/* Pie & Total */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PieChart
                expeditionUSD={expeditionUSD}
                theoUSD={theoUSD}
                testnetUSD={testnetUSD}
                additionalUSD={additionalUSD}
              />
              <AllocationCard title="Total Estimated Airdrop">
                <p className="text-3xl font-semibold">${totalUSD.toLocaleString('fr-FR')}</p>
                <ul className="text-gray-200 text-sm mt-2 space-y-1">
                  <li>Mitosis Expedition: ${expeditionUSD.toLocaleString('fr-FR')}</li>
                  <li>Theo Vault: ${theoUSD.toLocaleString('fr-FR')}</li>
                  <li>Testnet: ${testnetUSD.toLocaleString('fr-FR')}</li>
                  <li>Additional: ${additionalUSD.toLocaleString('fr-FR')}</li>
                </ul>
                <p className="mt-2 text-gray-200 font-medium">
                  Total % FDV for Airdrop: {totalAirdropPct}%
                </p>
              </AllocationCard>
            </div>

            {/* ----- DÉTAILS DES CALCULS ----- */}
            <div className="container mx-auto px-6 py-6">
              <button
                onClick={()=>setShowDetails(s=>!s)}
                className="text-blue-400 underline"
              >
                {showDetails ? 'Cacher détails de calcul' : 'Afficher détails de calcul'}
              </button>

              {showDetails && (
                <div className="mt-4 bg-gray-800 rounded-2xl p-6 space-y-4 text-sm">
                  <h3 className="text-xl font-semibold text-gray-200">
                    Détails des calculs
                  </h3>

                  {/* Expédition */}
                  <div>
                    <label className="text-gray-400">Somme totale des points Expedition (∑P):</label>
                    <input
                      type="number"
                      value={expSumPoints}
                      onChange={e=>setExpSumPoints(Number(e.target.value))}
                      className="ml-2 p-1 bg-gray-700 rounded text-white"
                    />
                    <p className="text-gray-500">Somme des points de tous les utilisateurs for Mitosis Expedition.</p>
                  </div>

                  {/* Bonus moyen */}
                  <div>
                    <label className="text-gray-400">Poids moyen tiers (avgTierBonus):</label>
                    <input
                      type="number" step="0.1"
                      value={avgTierBonus}
                      onChange={e=>setAvgTierBonus(Number(e.target.value))}
                      className="ml-2 p-1 bg-gray-700 rounded text-white"
                    />
                    <p className="text-gray-500">
                      Moyenne des coefficients de tiers (ex: (1+1.2+1.5+2+3)/5).
                    </p>
                  </div>

                  {/* Coefficients tiers */}
                  <div>
                    <p className="text-gray-400 mb-1">Coefficients par Tier:</p>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {Object.entries(tierBonuses).map(([tier,bonus])=>(
                        <div key={tier}>
                          <label className="block text-gray-300">Tier {tier}</label>
                          <input
                            type="number" step="0.1"
                            value={bonus}
                            onChange={e=>setTierBonuses(tb=>({
                              ...tb,
                              [tier]: Number(e.target.value)
                            }))}
                            className="w-16 p-1 bg-gray-700 rounded text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplies bonus */}
                  <div>
                    <p className="text-gray-400 mb-1">Supplies bonus additionnels:</p>
                    {bonuses.map(b=>(
                      <div key={b.key} className="flex items-center space-x-2">
                        <span className="flex-1 text-white">{b.label}:</span>
                        <input
                          type="number"
                          value={b.supply}
                          onChange={e=>setBonuses(bs=>
                            bs.map(x=>x.key===b.key?{...x,supply:Number(e.target.value)}:x)
                          )}
                          className="w-20 p-1 bg-gray-700 rounded text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Formules */}
                  <div>
                    <h4 className="text-gray-200 mb-1">Formules utilisées:</h4>
                    <code className="block bg-gray-700 rounded p-2 mb-1">
                      expeditionUSD = {'((totalExpPoints × expeditionTierBoost) ÷ (expSumPoints × avgTierBonus)) × (expPct% × FDV)'}
                    </code>
                    <code className="block bg-gray-700 rounded p-2 mb-1">
                      theoUSD       = {'((theoAsset.points × tierBonuses[weETH.tier]) ÷ (expSumPoints × avgTierBonus)) × (expPct% × FDV)'}
                    </code>
                    <code className="block bg-gray-700 rounded p-2 mb-1">
                      testnetUSD    = {'(testnetAsset.points ÷ TESTNET_POOL) × (testPct% × FDV)'}
                    </code>
                    <code className="block bg-gray-700 rounded p-2">
                      additionalUSD = {'Σ checkedBonus (bonus.pct% × FDV ÷ bonus.supply)'}
                    </code>
                  </div>
                </div>
              )}
            </div>
            {/* ----- FIN DÉTAILS ----- */}
          </>
        )}
      </main>
    </div>
  )
}
