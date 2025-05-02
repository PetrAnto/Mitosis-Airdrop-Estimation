// src/api/mitosis.js

/**
 * Récupère pour chaque asset Expedition via le proxy Vite :
 *   GET /api/expedition/:address?asset=<asset>
 * Retourne [{ asset, points, tier }, …]
 */
export async function fetchExpeditionBreakdown(address) {
  const normalized = address.toLowerCase();
  const assets     = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];

  const results = await Promise.all(
    assets.map(async (asset) => {
      const url = `/api/expedition/${normalized}?asset=${asset}`;
      try {
        const res  = await fetch(url);
        const data = await res.json();
        const points = parseFloat(data?.mitoPoints?.total || 0);
        const tier   = data?.tier?.tier || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error("Error fetching Expedition", asset, e);
        return { asset, points: 0, tier: 1 };
      }
    })
  );

  return results;
}

/**
 * Récupère les points Theo Vault (maweETH) via le proxy Vite :
 *   GET /api/theo/:address
 * Retourne { asset: "Theo Vault", points }
 */
export async function fetchTheoPoints(address) {
  const normalized = address.toLowerCase();
  const url        = `/api/theo/${normalized}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();
    const points = parseFloat(json[0]?.mitoPoints || 0);
    return { asset: "Theo Vault", points };
  } catch (e) {
    console.error("Error fetching Theo Vault", e);
    return { asset: "Theo Vault", points: 0 };
  }
}

/**
 * Récupère le total_balance du Testnet $MITO via le proxy Vite :
 *   GET /api/testnet/:address
 * Retourne { asset: "Testnet $MITO", points }
 */
export async function fetchTestnetData(address) {
  const normalized = address.toLowerCase();
  const url        = `/api/testnet/${normalized}`;

  try {
    const res  = await fetch(url);
    const json = await res.json();
    const points = parseFloat(json?.data?.total_balance || 0);
    return { asset: "Testnet $MITO", points };
  } catch (e) {
    console.error("Error fetching Testnet data", e);
    return { asset: "Testnet $MITO", points: 0 };
  }
}
