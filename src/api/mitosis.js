// src/api/mitosis.js

// Mapping des assets → URL de l’endpoint expedition-rank
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
 * Récupère pour chaque asset { asset, points, rank, tier }
 * points = item.totalPoints, rank = item.rank, tier = item.tier
 */
export async function fetchExpeditionBreakdown(address) {
  const promises = ASSETS.map(async (asset) => {
    const baseUrl = ASSET_ENDPOINTS[asset];
    const url = `${baseUrl}?address=${address}&asset=${asset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur ${res.status} sur ${asset}`);
    const json = await res.json();
    const item = json.item || {};
    return {
      asset,
      points: parseFloat(item.totalPoints) || 0,
      rank:   item.rank   || 0,
      tier:   item.tier   || 0,
    };
  });
  return Promise.all(promises);
}

/**
 * Récupère la partie "Theo - Straddle Vault"
 * On n’y a pas de tier, on fixe à null
 */
export async function fetchTheoPoints(address) {
  const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur ${res.status} sur Theo Vault`);
  const json = await res.json();
  return {
    asset:  'Theo Vault',
    points: parseFloat(json.mitoPoints) || 0,
    rank:   1,
    tier:   null,
  };
}
