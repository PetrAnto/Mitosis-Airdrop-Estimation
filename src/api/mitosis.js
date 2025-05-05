// src/api/mitosis.js

// Normalize wallet address to lowercase for all API calls
const normalize = (address) => address.trim().toLowerCase();

/**
 * Fetches Expedition breakdown for all assets
 */
export async function fetchExpeditionBreakdown(address) {
  const assets = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];
  const lower = normalize(address);
  const results = await Promise.all(
    assets.map(async (asset) => {
      try {
        const url = `https://api.expedition.mitosis.org/v1/status/${lower}?asset=${asset}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const points = parseFloat(data?.mitoPoints?.total || '0');
        const tier   = data?.tier?.tier || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error("Expedition fetch failed:", asset, e);
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
  const lower = normalize(address);
  try {
    const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${lower}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // assume first entry
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
  const lower = normalize(address);
  try {
    const url = `https://mito-api.customrpc.workers.dev/api/wallet/${lower}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Testnet API returned success=false');
    const points = parseFloat(json.data?.total_balance || '0');
    return { asset: 'Testnet $MITO', points };
  } catch (e) {
    console.error("Testnet fetch failed", e);
    return { asset: 'Testnet $MITO', points: 0 };
  }
}
