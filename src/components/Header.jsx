import React from 'react';

export default function Header() {
  return (
    <header className="text-center py-6 border-b border-gray-700 mb-6">
      <img src="/petrantocalculator.png" alt="PetrAnto Logo" className="h-20 mx-auto mb-2" />
      <h1 className="text-2xl font-bold text-gray-200">🩸 PetrAnto Mitosis Airdrop Calculator</h1>
      <p className="text-sm text-gray-400 mt-1">
        Estimate your airdrop allocation based on MITO Expedition Points, Theo Vault, Testnet rewards and Additional bonuses.
      </p>
    </header>
  );
}
