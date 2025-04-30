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
  // Props pour slider FDV
  showSlider = false,
  pct = 0,
  onPctChange,
  // Props pour checkbox bonus
  showCheckbox = false,
  selected = false,
  onToggle,
  // Props pour afficher le supply (bonus)
  supply
}) {
  const displayPoints = Math.floor(points);

  return (
    <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 w-full space-y-4">
      <div className="flex items-center justify-between">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={selected}
            onChange={e => onToggle(e.target.checked)}
            className="accent-blue-500"
          />
        )}
        <h2 className="text-xl font-semibold text-gray-200">{asset}</h2>
      </div>

      <p className="text-white">
        Points : {displayPoints.toLocaleString('fr-FR')}
      </p>

      {rank != null && (
        <p className="text-gray-400">
          Rank #{rank}{tier ? ` · Tier : ${TIER_LABELS[tier]}` : ''}
        </p>
      )}

      {showSlider && (
        <>
          <label className="text-gray-400">% of FDV</label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={pct}
            onChange={e => onPctChange(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="text-gray-200">{pct}%</div>
        </>
      )}

      {supply != null && (
        <p className="text-gray-400 text-sm">
          Supply max : {supply.toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
}
