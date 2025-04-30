import React from 'react';

export default function AllocationCard({
  asset,
  points,
  rank,
  onPointsChange,
}) {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-200">{asset}</h2>
        <span className="text-sm text-gray-400">Rank #{rank}</span>
      </div>
      <input
        type="number"
        value={points}
        onChange={e => onPointsChange(Number(e.target.value))}
        className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={() => navigator.clipboard.writeText(points)}
        className="self-end px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded-md"
      >
        Copy
      </button>
    </div>
  );
}
