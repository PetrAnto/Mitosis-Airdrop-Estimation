// src/components/AllocationCard.jsx

import React from 'react';

// Mapping numérique → libellé Tier
const TIER_LABELS = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

export default function AllocationCard({
  asset,
  points = 0,
  rank,
  tier,
  showSlider = false,
  pct = 0,
  onPctChange,
  showCheckbox = false,
  selected = false,
  onToggle,
  supply,
  pointsLabel = 'Points :'
}) {
  const displayPoints = Math.floor(parseFloat(points));

  return (
    <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 w-full space-y-4">
      {/* Entête : checkbox + titre */}
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

      {/* Ligne Points, masquée pour les bonus */}
      {!showCheckbox && (
        <p className="text-white">
          {pointsLabel} {displayPoints.toLocaleString('fr-FR')}
        </p>
      )}

      {/* Rank & Tier, masqués pour les bonus */}
      {rank != null && !showCheckbox && (
        <p className="text-gray-400">
          Rank #{rank}
          {tier ? ` · Tier : ${TIER_LABELS[tier]}` : ''}
        </p>
      )}

      {/* Slider %FDV */}
      {showSlider && (
        <>
          <label className="text-gray-400">% of FDV</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={pct}
              onChange={e => onPctChange(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <span className="text-gray-200 text-sm">{pct}%</span>
          </div>
        </>
      )}

      {/* Supply, seulement pour les bonus */}
      {supply != null && showCheckbox && (
        <p className="text-gray-400 text-sm">
          Supply max : {supply.toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
}
