// src/api/mitosis.js

export async function fetchExpeditionBreakdown(address) {
  const assets = ['weETH', 'ezETH', 'weETHs', 'uniBTC', 'uniETH', 'cmETH']
  const normalized = address.toLowerCase()

  const promises = assets.map(async (asset) => {
    try {
      const url = `https://api.expedition.mitosis.org/v1/status/${normalized}?asset=${asset}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Expedition ${asset} HTTP ${res.status}`)
      const json = await res.json()

      return {
        asset,
        points: parseFloat(json.mitoPoints?.total || '0'),
        tier: json.tier?.tier || 1
      }
    } catch (err) {
      console.error(`fetchExpeditionBreakdown ${asset} failed`, err)
      return {
        asset,
        points: 0,
        tier: 1
      }
    }
  })

  return Promise.all(promises)
}

// Fetches the Theo Vault points
export async function fetchTheoPoints(address) {
  try {
    const res = await fetch(`https://matrix-proxy.mitomat.workers.dev/theo/portfolio/${address}`)
    if (!res.ok) throw new Error(`Theo HTTP ${res.status}`)
    const json = await res.json()
    return {
      asset: 'Theo Vault',
      points: parseFloat(json.mitoPoints || json.mito_points || 0)
    }
  } catch (err) {
    console.error('fetchTheoPoints error', err)
    return { asset: 'Theo Vault', points: 0 }
  }
}

// Fetches the Testnet $MITO data, with 404 and network-fallback handling
export async function fetchTestnetData(address) {
  try {
    const res = await fetch(
      `https://mito-api.customrpc.workers.dev/api/wallet/${address}`
    )
    if (res.status === 404) {
      // If not found, return zeroed object
      return { asset: 'Testnet $MITO', points: 0, rank: 0 }
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const json = await res.json()
    return {
      asset: 'Testnet $MITO',
      points: json.data.total_balance || 0,
      rank: json.data.rank || 0
    }
  } catch (err) {
    console.error('fetchTestnetData error', err)
    return { asset: 'Testnet $MITO', points: 0, rank: 0 }
  }
}
