// src/api/mitosis.js

// Normalise pour les appels Expédition (adresse en minuscules, conserve le 0x)
const normalizeExpAddress = (address) =>
  address.trim().toLowerCase();

// Ne pas normaliser pour Testnet (l’API attend parser l’adresse littérale)
const keepAddress = (address) => address.trim();

/**
 * Fetches Expedition breakdown for all assets
 * via le proxy (pas de CORS)
 */
export async function fetchExpeditionBreakdown(address) {
  const assetsRaw = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];
  const lower = normalizeExpAddress(address);
  const results = await Promise.all(
    assetsRaw.map(async (assetRaw) => {
      try {
        const url = `https://workermito.mitoapi.workers.dev/expedition-rank?address=${lower}&asset=${assetRaw}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Expedition proxy HTTP ${res.status}`);
        const json = await res.json();
        // proxy renvoie dans json.item.totalPoints et json.item.rank
        const points = parseFloat(json.item?.totalPoints || "0");
        const tier   = parseInt(json.item?.rank, 10) || 1;
        // le champ asset en lowercase pour matcher App.jsx
        return { asset: assetRaw.toLowerCase(), points, tier };
      } catch (e) {
        console.error("Expedition fetch failed:", assetRaw, e);
        return { asset: assetRaw.toLowerCase(), points: 0, tier: 1 };
      }
    })
  );
  return results;
}

/**
 * Fetches Theo Vault points
 */
export async function fetchTheoPoints(address) {
  const addr = normalizeExpAddress(address); // accepte lowercase
  try {
    const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${addr}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Theo HTTP ${res.status}`);
    const json = await res.json();
    const entry = Array.isArray(json) ? json[0] : {};
    const points = parseFloat(entry.mitoPoints || "0");
    return { asset: "theo vault", points };
  } catch (e) {
    console.error("Theo fetch failed", e);
    return { asset: "theo vault", points: 0 };
  }
}

/**
 * Fetches Testnet $MITO data
 */
export async function fetchTestnetData(address) {
  const addr = keepAddress(address); // adresse brute
  try {
    const url = `https://mito-api.customrpc.workers.dev/api/wallet/${addr}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Testnet HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error("Testnet API success=false");
    const points = parseFloat(json.data?.total_balance || "0");
    return { asset: "testnet $mito", points };
  } catch (e) {
    console.error("Testnet fetch failed", e);
    return { asset: "testnet $mito", points: 0 };
  }
}
