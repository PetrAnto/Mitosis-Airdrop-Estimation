import React from 'react';

const Header = () => {
  return (
    <header className="w-full flex flex-col items-center py-4 mb-6 border-b border-gray-300">
      <img src="/petrantocalculator.png" alt="PetrAnto Logo" className="h-20 mb-2" />
      <h1 className="text-2xl font-bold text-gray-800">🩸 PetrAnto Mitosis Airdrop Calculator</h1>
      <p className="text-sm text-gray-500 mt-1">Estimate your airdrop allocation based on MITO Points, NFTs, Discord Roles and Testnet rewards.</p>
    </header>
  );
};

export default Header;
