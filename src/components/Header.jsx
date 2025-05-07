import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-gray-900 shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <img
          src="/petrantocalculator.png"
          alt="Logo MITO"
          className="h-16 md:h-20 w-auto"
        />
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Try to estimate your airdrop value
        </h1>
      </div>
      <div className="bg-red-500 p-4">
  🔥 If you see this red box, Tailwind saw your file!
</div>

    </header>
  );
}
