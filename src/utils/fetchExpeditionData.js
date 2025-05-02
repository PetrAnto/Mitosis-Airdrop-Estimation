const assetList = ["weETH", "ezETH", "weETHs", "uniBTC", "uniETH", "cmETH"];

export const tierMap = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
  5: "Diamond"
};

export async function fetchExpeditionData(wallet) {
  const lowerWallet = wallet.toLowerCase();

  const fetches = assetList.map(async (asset) => {
    const url = `https://api.expedition.mitosis.org/v1/status/${lowerWallet}?asset=${asset}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();

      return {
        asset,
        points: Math.floor(parseFloat(data?.mitoPoints?.total || "0")),
        tier: data?.tier?.tier || 1
      };
    } catch (err) {
      console.error(`Failed to fetch data for ${asset}:`, err);
      return {
        asset,
        points: 0,
        tier: 1
      };
    }
  });

  const results = await Promise.all(fetches);
  return results;
}
