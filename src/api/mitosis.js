// src/api/mitosis.js

const ASSETS = ['weETH', 'ezETH', 'weETHs', 'unibtc', 'unieth', 'cmeth'];

/**
 * Pour chaque asset, récupère { asset, points, rank }
 */
export async function fetchExpeditionBreakdown(address) {
  const promises = ASSETS.map(async asset => {
    // endpoint GLS
    const url = `https://workermito.mitoapi.workers.dev/expedition-rank?address=${address}&asset=${asset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error fetching ${asset}: ${res.status}`);
    const json = await res.json();
    // on suppose la réponse { points: number, rank: number, ... }
    return {
      asset,
      points: json.points,
      rank: json.rank,
    };
  });
  return Promise.all(promises);
}

/**
 * Récupère la partie "Theo - Straddle Vault"
 */
export async function fetchTheoPoints(address) {
  const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error fetching Theo: ${res.status}`);
  const json = await res.json();
  // on suppose la réponse { points: number }
  return { asset: 'Theo Vault', points: json.points, rank: 1 };
}
