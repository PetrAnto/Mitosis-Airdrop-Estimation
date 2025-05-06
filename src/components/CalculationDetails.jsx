// src/components/CalculationDetails.jsx
import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// (Optional) if you want to pull in a markdown file for the “More details” sections,
// move each section’s extra text into its own MD file under public/ and fetch it here.
export default function CalculationDetails({
  expDenomBase, setExpDenomBase,
  expDenomFactor, setExpDenomFactor,
  testnetPool, setTestnetPool,
  bonuses, setBonuses
}) {
  // Example: fetch a single markdown blob to re-use in each “More details”
  const [mdText, setMdText] = useState('')
  useEffect(() => {
    fetch('/calculationDetails.md')
      .then(r => r.text())
      .then(setMdText)
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-8">
      {/* Expedition */}
      <section className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-xl font-semibold text-gray-200 text-center">Expedition</h3>
        <p className="mt-2 text-gray-200">
          We calculate your share by weighting <em>total points</em> with your <em>tier bonus</em>.<br/> Tier is extracted from weETH campaign to suit most holders.
        </p>
        <img
          src="/public/expedition-basic-formula-1.png"
          alt="Expedition formula"
          className="mx-auto w-2/3 rounded mt-2 shadow-md"
        />

        {/* modify constants drawer */}
        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            Modify Expedition Constants (see "More details" for explanations)
          </summary>
          <div className="p-4 space-y-3">
            <label className="flex items-center space-x-2 text-gray-200">
              <span>Total Supply of Expedition Points:</span>
              <input
                type="number"
                value={expDenomBase}
                onChange={e => setExpDenomBase(+e.target.value)}
                className="ml-2 p-1 rounded bg-gray-600 text-white w-32"
              />
            </label>
            <label className="flex items-center space-x-2 text-gray-200">
              <span>Average Tier factor:</span>
              <input
                type="number"
                step="0.1"
                value={expDenomFactor}
                onChange={e => setExpDenomFactor(+e.target.value)}
                className="ml-2 p-1 rounded bg-gray-600 text-white w-32"
              />
            </label>
          </div>
        </details>

        {/* more details drawer */}
        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            More details
          </summary>
          <div className="p-4 text-gray-200 space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mdText}
            </ReactMarkdown>
          </div>
        </details>
      </section>

      {/* Theo Vault */}
      <section className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-xl font-semibold text-gray-200">Theo Vault</h3>
        <p className="mt-2 text-gray-200">
          Same FDV% formula as Expedition, but using your Theo points and your tier bonus.
        </p>
        <img
          src="/images/theo-flow.png"
          alt="Theo Vault flow"
          className="w-full rounded mt-2 shadow-md"
        />

        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            Modify Theo Constants
          </summary>
          <div className="p-4 text-gray-200">
            {/* no inputs yet, but you can add them here */}
            <p>No editable constants for Theo Vault right now.</p>
          </div>
        </details>

        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            More details
          </summary>
          <div className="p-4 text-gray-200 space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mdText}
            </ReactMarkdown>
          </div>
        </details>
      </section>

      {/* Testnet */}
      <section className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-xl font-semibold text-gray-200">Testnet</h3>
        <p className="mt-2 text-gray-200">
          We convert your Test $MITO balance to USD based on pool size and testnet %
          (see formula image).
        </p>
        <img
          src="/images/testnet-formula.png"
          alt="Testnet formula"
          className="w-full rounded mt-2 shadow-md"
        />

        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            Modify Testnet Constants
          </summary>
          <div className="p-4 space-y-2">
            <label className="flex items-center space-x-2 text-gray-200">
              <span>Pool tokens:</span>
              <input
                type="number"
                step="0.01"
                value={testnetPool}
                onChange={e => setTestnetPool(+e.target.value)}
                className="ml-2 p-1 rounded bg-gray-600 text-white w-32"
              />
            </label>
          </div>
        </details>

        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            More details
          </summary>
          <div className="p-4 text-gray-200 space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mdText}
            </ReactMarkdown>
          </div>
        </details>
      </section>

      {/* Additional Rewards */}
      <section className="bg-gray-800 rounded-2xl p-4">
        <h3 className="text-xl font-semibold text-gray-200">Additional Rewards</h3>
        <p className="mt-2 text-gray-200">
          Each selected bonus adds FDV% based on its supply and your bonus %
          (see formula image).
        </p>
        <img
          src="/images/expedition-tiers-multipliers.png"
          alt="Tier multipliers"
          className="w-full rounded mt-2 shadow-md"
        />

        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            Modify Bonus Supplies
          </summary>
          <div className="p-4 space-y-2">
            {bonuses.map(b => (
              <label key={b.key} className="flex items-center space-x-2 text-gray-200">
                <span>{b.label} supply:</span>
                <input
                  type="number"
                  value={b.supply}
                  onChange={e =>
                    setBonuses(bs =>
                      bs.map(x => x.key === b.key ? { ...x, supply: +e.target.value } : x)
                    )
                  }
                  className="ml-2 p-1 rounded bg-gray-600 text-white w-24"
                />
              </label>
            ))}
          </div>
        </details>

        <details className="mt-4 bg-gray-700 rounded">
          <summary className="cursor-pointer px-4 py-2 text-blue-400">
            More details
          </summary>
          <div className="p-4 text-gray-200 space-y-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mdText}
            </ReactMarkdown>
          </div>
        </details>
      </section>
    </div>
  )
}
