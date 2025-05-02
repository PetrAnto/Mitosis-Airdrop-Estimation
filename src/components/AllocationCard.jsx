import React from 'react';

// Mapping numérique → libellé Tier
const TIER_LABELS = {
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

// Slugs renvoyés par votre API → libellés “jolis”
const ASSET_LABELS = {
  weETH:  'weETH',
  weETHs: 'weETHs',
  uniETH: 'uniETH',
  ezETH:  'ezETH',
  uniBTC: 'uniBTC',
  cmETH:  'cmETH',
};

export default function AllocationCard({
  asset,               // slug, ex: "weETH", "uniBTC", …
  points = 0,          // nombre de points bruts
  tier = 1,            // niveau 1–5 suivant TIER_LABELS
  // Slider “Points”
  showSlider = false,  
  sliderLabel = 'Points',  
  maxPoints = 100,     // borne max du slider
  // Checkbox (pour les bonus)
  showCheckbox = false,
  selected = false,
  onToggle,
  // Autres
  pointsLabel = 'Points :',
  supply,              // pour l’affichage “Supply max”
}) {
  const displayPoints = Math.floor(points);
  const label = ASSET_LABELS[asset] || asset;

  return (
    <div className="max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 w-full space-y-4">
      {/* Entête */}
      <div className="flex items-center justify-between">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={selected}
            onChange={e => onToggle(e.target.checked)}
            className="accent-blue-500"
          />
        )}
        <h2 className="text-xl font-semibold text-gray-200">{label}</h2>
      </div>

      {/* Slider “Points” ou simple affichage */}
      {showSlider ? (
        <>
          <label className="text-gray-400">{sliderLabel}</label>
          <input
            type="range"
            min="0"
            max={maxPoints}
            step="1"
            value={displayPoints}
            readOnly
            className="w-full accent-blue-500"
          />
          <div className="text-gray-200">
            {displayPoints.toLocaleString('fr-FR')}
          </div>
        </>
      ) : (
        <p className="text-white">
          {pointsLabel} {displayPoints.toLocaleString('fr-FR')}
        </p>
      )}

      {/* Affichage du tier */}
      <p className="text-gray-400">Tier : {TIER_LABELS[tier]}</p>

      {/* Supply max (uniquement pour les bonus) */}
      {supply != null && showCheckbox && (
        <p className="text-gray-400 text-sm">
          Supply max : {supply.toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  );
}
