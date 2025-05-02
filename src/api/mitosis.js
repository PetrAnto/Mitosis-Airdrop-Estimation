export async function fetchTheoPoints(address) {
  try {
    const res = await fetch(`https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`);
    const json = await res.json();
    const entry = json.find(i => i.asset === 'maweETH') || {};
    return {
      asset: 'Theo Vault',
      points: parseFloat(entry.mitoPoints || 0),
    };
  } catch (err) {
    console.error('Theo Vault fetch error', err);
    return { asset: 'Theo Vault', points: 0 };
  }
}

export async function fetchTestnetData(address) {
  try {
    const res = await fetch(`https://mito-api.customrpc.workers.dev/api/wallet/${address}`);
    const json = await res.json();
    return {
      asset: 'Testnet $MITO',
      points: parseFloat(json?.data?.total_balance || 0),
    };
  } catch (err) {
    console.error('Testnet fetch error', err);
    return { asset: 'Testnet $MITO', points: 0 };
  }
}
