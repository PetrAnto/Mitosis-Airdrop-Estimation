# Calculation Details

## Expedition

### How We Calculate Your Share  
To estimate how much $MITO you might receive, we use a weighted approach that takes into account:

1. **Your points** – the number of points you earned in the game  
2. **Your tier** – how well you performed compared to others (Diamond, Platinum, Gold, etc.)  
3. **Total points generated** by all participants  
4. **Average bonus multiplier** based on tier multipliers

![Expedition Formula Basic](/images/expedition-basic-formula-1.png)

---

### Determining the Variables

1. **Your points** are fetched automatically from your wallet address via the Mitosis API.  
2. **Your tier** is also retrieved from the same API.  
3. **Estimating total points** is more challenging, since there’s no public record. We rely on two clues:

   - **Clue 1: Top player**  
     They deposited about 100 ETH and earned ~2.75 billion points (May 2025).  
     ⇒ On average, 1 ETH ≈ 27 million points at the highest tier.

   - **Clue 2: Total ETH locked**  
     DeFiLlama reports ~13 740 ETH locked in Mitosis (May 2025).  
     If everyone had the top bonus:  
     13 740 ETH × 27 million ≈ 371 billion points → clearly too high.

   To balance high and low performers (based on the top 100 leaderboard distribution), we assume **15 million points per ETH on average**, giving:  
   13 740 ETH × 15 million ≈ 206 billion points.  
   We round up to **225 billion** for a conservative estimate.

4. **Average tier bonus**  
   Typical DeFi/crypto projects use higher multipliers for higher tiers:

   ![Expedition Tier Bonuses](/images/expedition-tiers-multipliers.png)

   We take an average bonus multiplier of **1.5** across all participants.

Putting it all together:

- **Total base points** ≈ 225 billion  
- **Average bonus** ≈ 1.5  
- **Effective total points** ≈ 225 billion × 1.5 = 337.5 billion  

We arrive at:

![Expedition Formula Simplified](/images/expedition-basic-formula-simplified.png)
