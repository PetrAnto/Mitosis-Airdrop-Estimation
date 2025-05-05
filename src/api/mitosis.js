// src/api/mitosis.js

// Helper function to normalize wallet addresses: lowercase and trim
const normalizeAddress = (address) => address.trim().toLowerCase();

/**
 * Fetches Expedition breakdown for all assets (via proxy to avoid CORS)
 */
export async function fetchExpeditionBreakdown(address) {
  const assets = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];
  const lower = normalizeAddress(address);
  const results = await Promise.all(
    assets.map(async (asset) => {
      try {
        const url = `https://workermito.mitoapi.workers.dev/expedition-rank?address=${lower}&asset=${asset}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Expedition proxy HTTP ${res.status}`);
        const data = await res.json();
        // proxy returns data.item.totalPoints and data.item.rank
        const points = parseFloat(data?.item?.totalPoints || '0');
        const tier   = parseInt(data?.item?.rank, 10) || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error("Expedition fetch failed for asset", asset, e);
        return { asset, points: 0, tier: 1 };
      }
    })
  );
  return results;
}

/**
 * Fetches Theo Vault points
 */
export async function fetchTheoPoints(address) {
  const lower = normalizeAddress(address);
  try {
    const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${lower}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Theo HTTP ${res.status}`);
    const json = await res.json();
    const entry = Array.isArray(json) ? json[0] : {};
    const points = parseFloat(entry.mitoPoints || '0');
    return { asset: 'Theo Vault', points };
  } catch (e) {
    console.error("Theo fetch failed", e);
    return { asset: 'Theo Vault', points: 0 };
  }
}

/**
 * Fetches Testnet $MITO data
 */
export async function fetchTestnetData(address) {
  const lower = normalizeAddress(address);
  try {
    const url = `https://mito-api.customrpc.workers.dev/api/wallet/${lower}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Testnet HTTP ${res.status}`);
    const json = await res.json();
    if (json.success !== true) throw new Error('Testnet API returned success=false');
    const points = parseFloat(json.data?.total_balance || '0');
    return { asset: 'Testnet $MITO', points };
  } catch (e) {
    console.error("Testnet fetch failed", e);
    return { asset: 'Testnet $MITO', points: 0 };
  }
}
