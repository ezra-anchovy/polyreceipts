# PolyReceipts Pivot: Show THEIR Receipts

## Original Concept (wrong)
Users log their own predictions to track calibration.

## Pivoted Concept (right)
Analyze WHALES' public trade history and prove they don't have an edge.

## The Insight
Everyone follows whales blindly. Nobody asks: "Is this whale actually skilled, or just lucky?"

With public trade data, we can calculate:
1. **Brier Score** - How calibrated are their predictions?
2. **Confidence Intervals** - With N trades, can we distinguish skill from luck?
3. **Category Breakdown** - Maybe they're good at politics, terrible at sports
4. **Win Rate vs Expected** - Are they beating random?

## The Product

### Landing Page Hook
"That whale with $10M in profits? Here's why it's probably luck."

### Features
1. **Whale Lookup** - Enter any Polymarket wallet address
2. **Trade History Import** - Pull from Polygonscan/Polymarket API
3. **Statistical Analysis** - Brier, calibration curve, confidence intervals
4. **"Luck vs Skill" Score** - How many more trades until we know they're skilled?
5. **Leaderboard of CALIBRATED Traders** - Not just profit, but consistent edge

### Killer Insight
Show that famous whales like Théo ($85M profit) would need 500+ more predictions before we could distinguish their skill from variance at p<0.05.

## Competitive Moat
- Everyone tracks whale OUTCOMES
- Nobody tracks whale CALIBRATION
- We're the only tool asking "should you trust this whale?"

## MVP Scope
1. Wallet address input
2. Fetch trade history (mock first, then real API)
3. Calculate Brier score
4. Show calibration curve
5. Display "Luck vs Skill" confidence interval

## Target User
- Skeptical traders who don't want to blindly copy
- Content creators debunking "whale alpha"
- Rationalists who understand epistemics
