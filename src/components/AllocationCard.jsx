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
  const displayPoints = Math.floor(points);

  return (
    <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-2">
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
          value={displayPoints}
          onChange={e => onPointsChange(Number(e.target.value))}
          className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <p className="text-gray-400 text-xs">
        Points: {displayPoints.toLocaleString('fr-FR')}
      </p>
    </div>
  );
}
