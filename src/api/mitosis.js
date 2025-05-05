// src/api/mitosis.js

/**
 * Récupère pour chaque asset Expedition via le proxy Vite :
 *   GET /api/expedition/:address?asset=<asset>
 * Retourne un tableau [{ asset, points, tier }, …]
 */
import { API_EXPEDITION, API_THEO, API_TESTNET } from '../config';

export async function fetchExpeditionBreakdown(address) {
  const normalized = address.toLowerCase();
  const assets     = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];

  console.log("🔍 [fetchExpedition] address =", normalized);

  const results = await Promise.all(
    assets.map(async (asset) => {
      const url = `${API_EXPEDITION}/${normalized}?asset=${asset}`;
      console.log(`→ Fetch Expedition ${asset}:`, url);
      try {
        const res  = await fetch(url);
        const data = await res.json();
        console.log(`← Expedition ${asset} response:`, data);

        const points = parseFloat(data?.mitoPoints?.total || 0);
        const tier   = data?.tier?.tier || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error(`✖ Expedition fetch failed for ${asset}`, e);
        return { asset, points: 0, tier: 1 };
      }
    })
  );

  console.log("✅ [fetchExpedition] results:", results);
  return results;
}

/**
 * Récupère les points Theo Vault via le proxy Vite :
 *   GET /api/theo/:address
 * Retourne { asset: "Theo Vault", points }
 */
export async function fetchTheoPoints(address) {
  // On peut lowercase ici car l'API Theo n'est pas case-sensitive
  const normalized = address.toLowerCase();
  const url        = `/api/theo/${normalized}`;

  console.log("🔍 [fetchTheo] URL =", url);
  try {
    const res  = await fetch(url);
    const json = await res.json();
    console.log("← Theo Vault response:", json);

    const points = parseFloat(json[0]?.mitoPoints || 0);
    console.log("✅ [fetchTheo] points =", points);
    return { asset: "Theo Vault", points };
  } catch (e) {
    console.error("✖ Theo fetch failed", e);
    return { asset: "Theo Vault", points: 0 };
  }
}

/**
 * Récupère le total_balance du Testnet $MITO via le proxy Vite :
 *   GET /api/testnet/:address
 * Retourne { asset: "Testnet $MITO", points }
 */
export async function fetchTestnetData(address) {
  // Ici on garde la casse fournie (ex: "0xF11B04D926A5Ca738Dc893684986BaD799AF941F")
  const url = `/api/testnet/${address}`;

  console.log("🔍 [fetchTestnet] URL =", url);
  try {
    const res  = await fetch(url);
    const json = await res.json();
    console.log("← Testnet raw response:", json);

    // On vérifie success avant d'extraire le total_balance
    if (!json.success) {
      console.warn("⚠ Testnet API returned success=false:", json.error);
      return { asset: "Testnet $MITO", points: 0 };
    }

    const points = parseFloat(json.data?.total_balance || 0);
    console.log("✅ [fetchTestnet] points =", points);
    return { asset: "Testnet $MITO", points };
  } catch (e) {
    console.error("✖ Testnet fetch failed", e);
    return { asset: "Testnet $MITO", points: 0 };
  }
}
