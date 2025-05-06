// src/components/CalculationDetails.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Avec Vite, on peut importer le MD brut grâce à `?raw`
import md from '../content/calculationDetails.md?raw';

export default function CalculationDetails({
  expDenomBase, setExpDenomBase,
  expDenomFactor, setExpDenomFactor,
  testnetPool, setTestnetPool,
  bonuses, setBonuses
}) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 text-sm space-y-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {md}
      </ReactMarkdown>

      {/* SECTION EXPEDITION */}
      <details className="bg-gray-700 rounded p-3">
        <summary className="cursor-pointer font-semibold text-gray-200">
          Modifier les constantes Expedition
        </summary>
        <div className="mt-2 space-y-2">
          <label className="flex items-center space-x-2">
            <span>Base ∑P:</span>
            <input
              type="number"
              value={expDenomBase}
              onChange={e => setExpDenomBase(+e.target.value)}
              className="ml-2 p-1 rounded bg-gray-600 text-white"
            />
          </label>
          <label className="flex items-center space-x-2">
            <span>Tier factor:</span>
            <input
              type="number"
              step="0.1"
              value={expDenomFactor}
              onChange={e => setExpDenomFactor(+e.target.value)}
              className="ml-2 p-1 rounded bg-gray-600 text-white"
            />
          </label>
        </div>
      </details>

      {/* SECTION THEO */}
      <details className="bg-gray-700 rounded p-3">
        <summary className="cursor-pointer font-semibold text-gray-200">
          Modifier les constantes Theo Vault
        </summary>
        <div className="mt-2">
          {/* Tu n’as pas de variable à changer ici, 
              mais tu peux y ajouter des explications ou inputs */}
          <p className="text-gray-200">Aucun paramètre modifiable pour l’instant.</p>
        </div>
      </details>

      {/* SECTION TESTNET */}
      <details className="bg-gray-700 rounded p-3">
        <summary className="cursor-pointer font-semibold text-gray-200">
          Modifier les constantes Testnet
        </summary>
        <div className="mt-2 space-y-2">
          <label className="flex items-center space-x-2">
            <span>Pool tokens:</span>
            <input
              type="number"
              step="0.01"
              value={testnetPool}
              onChange={e => setTestnetPool(+e.target.value)}
              className="ml-2 p-1 rounded bg-gray-600 text-white"
            />
          </label>
        </div>
      </details>

      {/* SECTION ADDITIONAL */}
      <details className="bg-gray-700 rounded p-3">
        <summary className="cursor-pointer font-semibold text-gray-200">
          Modifier les Additional Rewards
        </summary>
        <div className="mt-2 space-y-2">
          {bonuses.map(b => (
            <label key={b.key} className="flex items-center space-x-2 text-gray-200">
              <span>{b.label} supply:</span>
              <input
                type="number"
                value={b.supply}
                onChange={e => {
                  const v = +e.target.value;
                  setBonuses(bs =>
                    bs.map(x => x.key === b.key ? { ...x, supply: v } : x)
                  );
                }}
                className="ml-2 p-1 rounded bg-gray-600 text-white"
              />
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}

