// PolyReceipts Analysis Engine
// Statistical analysis for whale accountability

/**
 * Calculate Brier Score - measures prediction accuracy
 * Lower is better. 0 = perfect, 0.25 = random guessing
 */
function calculateBrierScore(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length === 0) return null;
    
    let totalScore = 0;
    for (const pos of resolved) {
        const forecast = pos.avgPrice; // Their confidence level
        const outcome = pos.won ? 1 : 0;
        totalScore += Math.pow(forecast - outcome, 2);
    }
    return totalScore / resolved.length;
}

/**
 * Calculate calibration - how well confidence matches outcomes
 * Groups predictions into buckets and checks if X% confident = X% correct
 */
function calculateCalibration(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length < 3) return null;
    
    // Create buckets: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
    const buckets = [
        { min: 0, max: 0.2, label: '0-20%', predictions: [], wins: 0 },
        { min: 0.2, max: 0.4, label: '20-40%', predictions: [], wins: 0 },
        { min: 0.4, max: 0.6, label: '40-60%', predictions: [], wins: 0 },
        { min: 0.6, max: 0.8, label: '60-80%', predictions: [], wins: 0 },
        { min: 0.8, max: 1.01, label: '80-100%', predictions: [], wins: 0 },
    ];
    
    for (const pos of resolved) {
        const bucket = buckets.find(b => pos.avgPrice >= b.min && pos.avgPrice < b.max);
        if (bucket) {
            bucket.predictions.push(pos);
            if (pos.won) bucket.wins++;
        }
    }
    
    // Calculate calibration score (1 - average deviation from perfect calibration)
    let totalDeviation = 0;
    let totalPredictions = 0;
    
    for (const bucket of buckets) {
        if (bucket.predictions.length > 0) {
            const expectedWinRate = (bucket.min + bucket.max) / 2;
            const actualWinRate = bucket.wins / bucket.predictions.length;
            totalDeviation += Math.abs(expectedWinRate - actualWinRate) * bucket.predictions.length;
            totalPredictions += bucket.predictions.length;
        }
    }
    
    const avgDeviation = totalPredictions > 0 ? totalDeviation / totalPredictions : 0;
    const calibrationScore = Math.max(0, 1 - avgDeviation * 2) * 100; // Convert to percentage
    
    return {
        buckets,
        score: calibrationScore
    };
}

/**
 * Calculate total P&L
 */
function calculatePnL(positions) {
    let totalPnL = 0;
    let resolvedPnL = 0;
    let unrealizedPnL = 0;
    
    for (const pos of Object.values(positions)) {
        const cost = pos.size * pos.avgPrice;
        
        if (pos.resolved) {
            // Resolved: won = get size back, lost = get nothing
            const payout = pos.won ? pos.size : 0;
            resolvedPnL += payout - cost;
        } else {
            // Unrealized: estimate based on current price
            const currentValue = pos.size * pos.curPrice;
            unrealizedPnL += currentValue - cost;
        }
    }
    
    totalPnL = resolvedPnL + unrealizedPnL;
    
    return {
        total: totalPnL,
        realized: resolvedPnL,
        unrealized: unrealizedPnL
    };
}

/**
 * Calculate win rate
 */
function calculateWinRate(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length === 0) return null;
    
    const wins = resolved.filter(p => p.won).length;
    return {
        winRate: (wins / resolved.length) * 100,
        wins,
        losses: resolved.length - wins,
        total: resolved.length
    };
}

/**
 * Calculate trades needed for statistical significance
 * Uses binomial proportion confidence interval
 */
function calculateTradesNeeded(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length === 0) return Infinity;
    
    const winRate = resolved.filter(p => p.won).length / resolved.length;
    
    // For p<0.05, we need the 95% CI to not include 0.5 (random)
    // Using normal approximation: n >= (z^2 * p * (1-p)) / e^2
    // where z = 1.96, e = margin we want to be away from 0.5
    
    const z = 1.96;
    const margin = Math.abs(winRate - 0.5);
    
    if (margin < 0.01) return 999999; // Too close to random
    
    const n = Math.ceil((z * z * winRate * (1 - winRate)) / (margin * margin));
    
    // Return additional trades needed
    return Math.max(0, n - resolved.length);
}

/**
 * Generate the verdict - is this whale skilled or lucky?
 */
function generateVerdict(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length < 5) {
        return {
            verdict: 'insufficient',
            title: '⚠️ VERDICT: Insufficient Data',
            text: `Only ${resolved.length} resolved trades. Need at least 5 to assess.`,
            confident: false
        };
    }
    
    const brier = calculateBrierScore(positions);
    const winRateData = calculateWinRate(positions);
    const calibration = calculateCalibration(positions);
    const tradesNeeded = calculateTradesNeeded(positions);
    const pnl = calculatePnL(positions);
    
    // Skilled criteria:
    // 1. Win rate > 55%
    // 2. Brier score < 0.20 (better than average)
    // 3. Calibration score > 60%
    // 4. Positive P&L
    // 5. Statistically significant (or close)
    
    let skillPoints = 0;
    let reasons = [];
    
    if (winRateData.winRate > 60) {
        skillPoints += 2;
        reasons.push(`High win rate (${winRateData.winRate.toFixed(1)}%)`);
    } else if (winRateData.winRate > 55) {
        skillPoints += 1;
        reasons.push(`Decent win rate (${winRateData.winRate.toFixed(1)}%)`);
    } else {
        reasons.push(`Mediocre win rate (${winRateData.winRate.toFixed(1)}%)`);
    }
    
    if (brier < 0.15) {
        skillPoints += 2;
        reasons.push(`Excellent Brier score (${brier.toFixed(3)})`);
    } else if (brier < 0.22) {
        skillPoints += 1;
        reasons.push(`Good Brier score (${brier.toFixed(3)})`);
    } else {
        reasons.push(`Poor Brier score (${brier.toFixed(3)})`);
    }
    
    if (calibration && calibration.score > 70) {
        skillPoints += 2;
        reasons.push(`Well calibrated (${calibration.score.toFixed(0)}%)`);
    } else if (calibration && calibration.score > 50) {
        skillPoints += 1;
    }
    
    if (pnl.realized > 0) {
        skillPoints += 1;
        reasons.push(`Profitable ($${formatMoney(pnl.realized)} realized)`);
    }
    
    if (tradesNeeded < 50) {
        skillPoints += 2;
        reasons.push('Statistically significant edge');
    } else if (tradesNeeded < 200) {
        skillPoints += 1;
        reasons.push(`Getting close to significance (need ${tradesNeeded} more trades)`);
    } else {
        reasons.push(`Far from significance (need ${tradesNeeded} more trades)`);
    }
    
    // Generate verdict
    if (skillPoints >= 7) {
        return {
            verdict: 'skilled',
            title: '✅ VERDICT: Likely Skilled',
            text: reasons.join('. ') + '. This trader shows consistent edge.',
            confident: tradesNeeded < 100
        };
    } else if (skillPoints >= 4) {
        return {
            verdict: 'maybe',
            title: '🤷 VERDICT: Possibly Skilled, More Data Needed',
            text: reasons.join('. ') + '. Cannot rule out luck yet.',
            confident: false
        };
    } else {
        return {
            verdict: 'lucky',
            title: '🎲 VERDICT: Probably Just Lucky',
            text: reasons.join('. ') + '. No evidence of systematic edge.',
            confident: resolved.length > 20
        };
    }
}

/**
 * Get performance by category
 */
function getPerformanceByCategory(positions) {
    const categories = {};
    
    for (const [key, pos] of Object.entries(positions)) {
        if (!pos.resolved) continue;
        
        const cat = categorizePosition(pos.title);
        if (!categories[cat]) {
            categories[cat] = { wins: 0, losses: 0, pnl: 0, positions: [] };
        }
        
        categories[cat].positions.push(pos);
        if (pos.won) {
            categories[cat].wins++;
            categories[cat].pnl += pos.size * (1 - pos.avgPrice);
        } else {
            categories[cat].losses++;
            categories[cat].pnl -= pos.size * pos.avgPrice;
        }
    }
    
    return categories;
}

// Format money helper
function formatMoney(amount) {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
    } else if (absAmount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    } else {
        return amount.toFixed(0);
    }
}
