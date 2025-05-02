// src/api/mitosis.js

/**
 * Récupère pour chaque asset Expedition via le proxy Vite :
 *   GET /api/expedition/:address?asset=<asset>
 * Retourne un tableau [{ asset, points, tier }, …]
 */
export async function fetchExpeditionBreakdown(address) {
  const normalized = address.toLowerCase();
  const assets     = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];

  console.log("🔍 [fetchExpeditionBreakdown] address =", normalized);

  const results = await Promise.all(
    assets.map(async (asset) => {
      const url = `/api/expedition/${normalized}?asset=${asset}`;
      console.log(`→ Fetch Expedition ${asset} via`, url);
      try {
        const res  = await fetch(url);
        const data = await res.json();
        console.log(`← Expedition ${asset} response:`, data);

        const points = parseFloat(data?.mitoPoints?.total  || 0);
        const tier   = data?.tier?.tier || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error(`✖ Expense fetch failed for ${asset}`, e);
        return { asset, points: 0, tier: 1 };
      }
    })
  );

  console.log("✅ [fetchExpeditionBreakdown] results:", results);
  return results;
}

/**
 * Récupère les points Theo Vault via le proxy Vite :
 *   GET /api/theo/:address
 * Retourne { asset: "Theo Vault", points }
 */
export async function fetchTheoPoints(address) {
  const normalized = address.toLowerCase();
  const url        = `/api/theo/${normalized}`;

  console.log("🔍 [fetchTheoPoints] URL =", url);
  try {
    const res  = await fetch(url);
    const json = await res.json();
    console.log("← Theo Vault response:", json);

    const points = parseFloat(json[0]?.mitoPoints || 0);
    console.log("✅ [fetchTheoPoints] points =", points);
    return { asset: "Theo Vault", points };
  } catch (e) {
    console.error("✖ [fetchTheoPoints] failed", e);
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

  console.log("🔍 [fetchTestnetData] URL =", url);
  try {
    const res  = await fetch(url);
    const json = await res.json();
    console.log("← Testnet raw response:", json);

    // Selon la réponse, total_balance peut être dans json.data.total_balance
    const points = parseFloat(json?.data?.total_balance || 0);
    console.log("✅ [fetchTestnetData] points =", points);
    return { asset: "Testnet $MITO", points };
  } catch (e) {
    console.error("✖ [fetchTestnetData] failed", e);
    return { asset: "Testnet $MITO", points: 0 };
  }
}
