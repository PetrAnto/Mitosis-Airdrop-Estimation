import React from 'react';

// Mapping numérique → libellé
const TIER_LABELS = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

export default function AllocationCard({
  asset,
  points,
  rank,
  tier,
  onPointsChange
}) {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-gray-200">{asset}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Rank #{rank}</span>
          {tier ? (
            <span className="text-sm text-gray-400">
              Tier: {TIER_LABELS[tier] || tier}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={points}
          onChange={e => onPointsChange(Number(e.target.value))}
          className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => navigator.clipboard.writeText(points)}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded-md"
        >
          Copy
        </button>
      </div>

      <p className="text-gray-400 text-xs">
        (Points affichés &amp; modifiables pour simuler)
      </p>
    </div>
  );
}
