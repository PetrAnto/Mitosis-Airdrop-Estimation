// src/api/mitosis.js

export async function fetchExpeditionBreakdown(address) {
  const assets = ["weETH", "ezETH", "weETHs", "unibtc", "unieth", "cmeth"];
  const results = await Promise.all(
    assets.map(async (asset) => {
      try {
        const url = `https://api.expedition.mitosis.org/v1/status/${address}?asset=${asset}`;
        const res = await fetch(url);
        const data = await res.json();
        const points = parseFloat(data?.mitoPoints?.total || 0);
        const tier = data?.tier?.tier || 1;
        return { asset, points, tier };
      } catch (e) {
        console.error("Error fetching asset", asset, e);
        return { asset, points: 0, tier: 1 };
      }
    })
  );
  return results;
}

export async function fetchTheoPoints(address) {
  try {
    const url = `https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`;
    const res = await fetch(url);
    const json = await res.json();
    const points = parseFloat(json[0]?.mitoPoints || 0);
    return { asset: "Theo Vault", points };
  } catch (e) {
    console.error("Theo fetch failed", e);
    return { asset: "Theo Vault", points: 0 };
  }
}

export async function fetchTestnetData(address) {
  try {
    const url = `https://mito-api.customrpc.workers.dev/api/wallet/${address}`;
    const res = await fetch(url);
    const json = await res.json();
    const points = parseFloat(json?.data?.total_balance || 0);
    return { asset: "Testnet $MITO", points };
  } catch (e) {
    console.error("Testnet fetch failed", e);
    return { asset: "Testnet $MITO", points: 0 };
  }
}
