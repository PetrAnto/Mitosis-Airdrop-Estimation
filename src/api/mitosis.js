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
 * Récupère { asset, points, rank, tier } pour chaque asset Expedition
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
 * Somme de tous les mitoPoints du tableau
 */
export async function fetchTheoPoints(address) {
  const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur ${res.status} sur Theo Vault`);
  const json = await res.json();
  const entries = Array.isArray(json) ? json : [json];
  const totalMitoPoints = entries.reduce((sum, e) => {
    const pts = parseFloat(e.mitoPoints);
    return sum + (isNaN(pts) ? 0 : pts);
  }, 0);
  return {
    asset:  'Theo Vault',
    points: totalMitoPoints,
    rank:   1,
    tier:   null,
  };
}

/**
 * Récupère les données Testnet MITO pour un wallet
 * via https://mito-api.customrpc.workers.dev/api/wallet/{address}
 * et renvoie { points: total_balance, rank }
 */
export async function fetchTestnetData(address) {
  const url = `https://mito-api.customrpc.workers.dev/api/wallet/${address}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur ${res.status} sur Testnet API`);
  const json = await res.json();
  const data = json.data || {};
  return {
    asset:  'Testnet $MITO',
    points: parseFloat(data.total_balance) || 0,
    rank:   data.rank || 0,
    tier:   null,
  };
}
