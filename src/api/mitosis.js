// src/api/mitosis.js

// Mapping des assets -> baseURL correcte pour l’expedition-rank
const ASSET_ENDPOINTS = {
  weETH:   'https://workermito.mitoapi.workers.dev/expedition-rank',
  ezETH:   'https://workermito.mitov7.workers.dev/expedition-rank',
  weETHs:  'https://workermito.mitoapi.workers.dev/expedition-rank',
  unibtc:  'https://workermito.mitov2.workers.dev/expedition-rank',
  unieth:  'https://workermito.mitov2.workers.dev/expedition-rank',
  cmeth:   'https://workermito.mitov7.workers.dev/expedition-rank',
};

const ASSETS = Object.keys(ASSET_ENDPOINTS);

/**
 * Pour chaque asset, récupère { asset, points, rank } via l’endpoint dédié.
 * Retourne une Promise< Array<{ asset, points, rank }> >
 */
export async function fetchExpeditionBreakdown(address) {
  const promises = ASSETS.map(async (asset) => {
    const baseUrl = ASSET_ENDPOINTS[asset];
    const url = `${baseUrl}?address=${address}&asset=${asset}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Erreur ${res.status} sur ${asset}`);
    }
    const json = await res.json();
    // On suppose la réponse { points: number, rank: number, ... }
    return {
      asset,
      points: json.points ?? 0,
      rank:   json.rank   ?? 0,
    };
  });

  return Promise.all(promises);
}

/**
 * Récupère la partie "Theo - Straddle Vault"
 * Réponse supposée { points: number }
 */
export async function fetchTheoPoints(address) {
  const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erreur ${res.status} sur Theo Vault`);
  }
  const json = await res.json();
  return {
    asset:  'Theo Vault',
    points: json.points ?? 0,
    rank:   1, // on fixe le rank à 1 pour cette source
  };
}
