// src/api/mitosis.js

/**
 * Récupère pour chaque asset Expedition :
 *   - points (mitoPoints.total)
 *   - tier (tier.tier)
 * et loggue la réponse brute dans la console.
 */
export async function fetchExpeditionBreakdown(address) {
  const assets = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];
  console.log("🔍 fetchExpeditionBreakdown pour wallet", address);

  const results = await Promise.all(
    assets.map(async (asset) => {
      const normalizedAddress = address.toLowerCase();
      const url = `https://api.expedition.mitosis.org/v1/status/${normalizedAddress}?asset=${asset}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(`— Expedition ${asset}:`, data);

        const points = parseFloat(data?.mitoPoints?.total || 0);
        const tier   = data?.tier?.tier || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error("Error fetching asset", asset, e);
        return { asset, points: 0, tier: 1 };
      }
    })
  );

  console.log("✅ fetchExpeditionBreakdown résultats :", results);
  return results;
}

/**
 * Récupère les mitoPoints de la Theo Vault (maweETH) et loggue la réponse.
 */
export async function fetchTheoPoints(address) {
  const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address.toLowerCase()}`;
  console.log("🔍 fetchTheoPoints URL:", url);
  try {
    const res  = await fetch(url);
    const json = await res.json();
    console.log("— Theo Vault réponse brute:", json);

    const points = parseFloat(json[0]?.mitoPoints || 0);
    console.log("✅ fetchTheoPoints points:", points);
    return { asset: "Theo Vault", points };
  } catch (e) {
    console.error("Theo fetch failed", e);
    return { asset: "Theo Vault", points: 0 };
  }
}

/**
 * Récupère le total_balance du Testnet $MITO et loggue la réponse.
 */
export async function fetchTestnetData(address) {
  const url = `https://mito-api.customrpc.workers.dev/api/wallet/${address.toLowerCase()}`;
  console.log("🔍 fetchTestnetData URL:", url);
  try {
    const res  = await fetch(url);
    const json = await res.json();
    console.log("— Testnet réponse brute:", json);

    const points = parseFloat(json?.data?.total_balance || 0);
    console.log("✅ fetchTestnetData points:", points);
    return { asset: "Testnet $MITO", points };
  } catch (e) {
    console.error("Testnet fetch failed", e);
    return { asset: "Testnet $MITO", points: 0 };
  }
}
