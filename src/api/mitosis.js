// src/api/mitosis.js

// Fetches the breakdown of expedition points by asset
export async function fetchExpeditionBreakdown(address) {
  const assets = ['weETH', 'ezETH', 'weETHs', 'uniBTC', 'uniETH', 'cmETH']
  const promises = assets.map(asset =>
    fetch(`https://workermito.mitoapi.workers.dev/expedition-rank?address=${address}&asset=${asset}`)
      .then(res => {
        if (!res.ok) throw new Error(`Expedition ${asset} HTTP ${res.status}`)
        return res.json()
      })
      .then(json => ({
        asset,
        points: parseFloat(json.item.totalPoints),
        tier: json.item.tier
      }))
      .catch(err => {
        console.error(`fetchExpeditionBreakdown ${asset} failed`, err)
        return { asset, points: 0, tier: 1 }
      })
  )

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
