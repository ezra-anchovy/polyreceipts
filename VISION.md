# PolyReceipts: A Philosophy-First Calibration Tool

*"The only calibration is one that changes your future predictions."*

---

## The Philosophical Core

Every prediction market tool asks: **"What should I bet?"**

We ask: **"Am I the kind of reasoner who should trust their own judgment?"**

This is not a whale tracker. This is an epistemological mirror.

---

## Why This Matters (The de Finetti Connection)

Bruno de Finetti's 1937 theorem established that probability is *subjective* — your degrees of belief, not properties of the world. But subjective doesn't mean arbitrary. A rational agent's beliefs must be **coherent** (no Dutch books) and **calibrated** (70% confidence should hit 70% of the time).

Polymarket traders have the first. The AMM prevents Dutch books. But nobody tracks the second.

**The result:** Traders have no idea if they're skilled or lucky. Leaderboards celebrate outcomes. Théo made $85M on the 2024 election — but was his 95% confidence in Trump actually calibrated, or did he just happen to be right?

We'll never know. He didn't log his reasoning. Nobody does.

---

## The Product: Three Philosophical Commitments

### 1. Pre-Registration or It Didn't Happen

Inspired by scientific pre-registration (OSF, AsPredicted), we require traders to log:
- Their probability estimate
- Their confidence interval on that estimate (second-order uncertainty)
- Their reasoning (max 280 characters — forces clarity)

**Before** the market resolves. No retroactive edits. Timestamped on-chain if they want credibility.

This isn't just a feature. It's a stance: **predictions without documentation are unfalsifiable claims.**

### 2. Brier Scores Are Not Enough

Standard calibration metrics (Brier, log loss) are necessary but insufficient. They tell you *how wrong* you were, not *why*.

We decompose performance into:
- **Calibration**: Did your 70% estimates hit 70%?
- **Resolution**: Did you have confident beliefs (near 0% or 100%)? Confident and calibrated beats uncertain and calibrated.
- **Skill vs. Luck**: Given N predictions, what's the confidence interval on your true win rate? (Spoiler: most traders need 500+ bets before we can distinguish skill from noise.)

The third is the killer feature. We show traders the uncomfortable truth: **you probably don't have enough data to know if you're good.**

### 3. Counterfactual Selves

Every bet you make is also a bet you *don't* make. We track:
- What if you'd bet against yourself on every trade?
- What if you'd sized by Kelly criterion?
- What if you'd only bet on categories where you're calibrated?

These "counterfactual selves" reveal systematic biases. Maybe you're great at politics but terrible at crypto. The current you doesn't know this. The counterfactual you makes it obvious.

---

## The Audience

Not everyone. Deliberately.

**Primary**: Self-improving traders who value process over outcomes. Rationalists. Superforecasters. People who read Tetlock.

**Secondary**: Content creators who want verifiable track records. "Trust me bro" doesn't scale; "here are my receipts" does.

**Anti-audience**: Copy traders. Whale followers. Anyone who wants to outsource their judgment. We don't serve them and we don't want them.

---

## The Moat

Whale trackers are commoditized. Anyone can watch Gamma's wallet.

But calibration data is:
1. **Personal** — your Brier scores are yours
2. **Longitudinal** — value compounds over time (can't fake 2 years of logged predictions)
3. **Network-effected** — if the rationalist community adopts this as the standard for verified predictions, we become the credential layer

The data moat is the user's own history. We're not tracking whales; we're building each user's epistemic autobiography.

---

## The Name

**PolyReceipts** — because talk is cheap, but receipts don't lie.

Alternative: **Calibrate** (verb as product), **Brier** (nerdy), **Thesis** (too generic).

---

## MVP Scope

1. **Prediction Journal**: Log prediction + confidence + reasoning before resolution
2. **Personal Dashboard**: Brier score, calibration curve, skill/luck decomposition
3. **Public Profiles** (opt-in): Shareable receipts for creators/forecasters
4. **Polymarket Import**: Bootstrap with historical data (calibration-blind, but establishes baseline)

---

## What We Don't Build

- Whale tracking (saturated)
- AI predictions (170+ exist, we'd be 171st)
- Copy trading (antithetical to our philosophy)
- Trading execution (Betmoar owns this)

We are opinionated. That's the point.

---

## The Ask

This isn't a business plan. It's a provocation.

If calibration matters — and as someone with a PhD in philosophy of probability, you know it does — then the current Polymarket ecosystem is epistemically bankrupt. $44B in volume, zero tools for actually improving your reasoning.

We fix that.

---

*"Everyone wants to know what the whales are doing. Nobody asks whether the whales know what they're doing."*

— Ezra, 2026-02-02 06:15 EST
