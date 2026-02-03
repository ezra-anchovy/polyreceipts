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
 * Calculate total P&L with detailed breakdown
 */
function calculatePnL(positions) {
    let totalPnL = 0;
    let resolvedPnL = 0;
    let unrealizedPnL = 0;
    let totalWagered = 0;
    let winPnL = 0;
    let lossPnL = 0;
    let biggestWin = { pnl: 0, title: '' };
    let biggestLoss = { pnl: 0, title: '' };
    
    for (const pos of Object.values(positions)) {
        const cost = pos.size * pos.avgPrice;
        totalWagered += cost;
        
        if (pos.resolved) {
            // Resolved: won = get size back, lost = get nothing
            const payout = pos.won ? pos.size : 0;
            const pnl = payout - cost;
            resolvedPnL += pnl;
            
            if (pos.won) {
                winPnL += pnl;
                if (pnl > biggestWin.pnl) {
                    biggestWin = { pnl, title: pos.title };
                }
            } else {
                lossPnL += pnl;
                if (pnl < biggestLoss.pnl) {
                    biggestLoss = { pnl, title: pos.title };
                }
            }
        } else {
            // Unrealized: estimate based on current price
            const currentValue = pos.size * pos.curPrice;
            unrealizedPnL += currentValue - cost;
        }
    }
    
    totalPnL = resolvedPnL + unrealizedPnL;
    
    // Calculate ROI
    const roi = totalWagered > 0 ? (resolvedPnL / totalWagered) * 100 : 0;
    
    return {
        total: totalPnL,
        realized: resolvedPnL,
        unrealized: unrealizedPnL,
        totalWagered,
        winPnL,
        lossPnL,
        roi,
        biggestWin,
        biggestLoss
    };
}

/**
 * Calculate detailed P&L breakdown by category
 */
function calculateCategoryPnL(positions) {
    const categories = {};
    
    for (const pos of Object.values(positions)) {
        const cat = categorizePosition(pos.title);
        if (!categories[cat]) {
            categories[cat] = {
                name: cat,
                totalPnL: 0,
                wagered: 0,
                wins: 0,
                losses: 0,
                pending: 0
            };
        }
        
        const cost = pos.size * pos.avgPrice;
        categories[cat].wagered += cost;
        
        if (pos.resolved) {
            const payout = pos.won ? pos.size : 0;
            categories[cat].totalPnL += payout - cost;
            if (pos.won) {
                categories[cat].wins++;
            } else {
                categories[cat].losses++;
            }
        } else {
            categories[cat].pending++;
        }
    }
    
    // Calculate ROI per category
    for (const cat of Object.values(categories)) {
        cat.roi = cat.wagered > 0 ? (cat.totalPnL / cat.wagered) * 100 : 0;
        cat.winRate = (cat.wins + cat.losses) > 0 
            ? (cat.wins / (cat.wins + cat.losses)) * 100 
            : 0;
    }
    
    return categories;
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
 * Calculate confidence interval for skill assessment
 * Uses Wilson score interval for binomial proportion
 */
function calculateSkillConfidence(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length < 5) return null;
    
    const n = resolved.length;
    const wins = resolved.filter(p => p.won).length;
    const p = wins / n;
    
    // Wilson score interval (more accurate than normal approximation for small n)
    const z = 1.96; // 95% confidence
    const denominator = 1 + z*z/n;
    const center = (p + z*z/(2*n)) / denominator;
    const spread = z * Math.sqrt((p*(1-p) + z*z/(4*n)) / n) / denominator;
    
    const lowerBound = center - spread;
    const upperBound = center + spread;
    
    // Check if 50% (random) is outside the confidence interval
    const isSignificant = lowerBound > 0.5 || upperBound < 0.5;
    const edgeDirection = p > 0.5 ? 'positive' : (p < 0.5 ? 'negative' : 'neutral');
    
    return {
        winRate: p * 100,
        lowerBound: lowerBound * 100,
        upperBound: upperBound * 100,
        isSignificant,
        edgeDirection,
        sampleSize: n,
        // How many more trades needed for significance at current win rate
        tradesForSignificance: calculateMinTradesForSignificance(p)
    };
}

/**
 * Calculate minimum trades needed to achieve statistical significance
 * at the current observed win rate
 */
function calculateMinTradesForSignificance(observedWinRate) {
    if (Math.abs(observedWinRate - 0.5) < 0.01) return 99999; // Too close to 50%
    
    // Binary search for minimum n where CI doesn't include 0.5
    let low = 1, high = 10000;
    const z = 1.96;
    
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const n = mid;
        const p = observedWinRate;
        
        const denominator = 1 + z*z/n;
        const center = (p + z*z/(2*n)) / denominator;
        const spread = z * Math.sqrt((p*(1-p) + z*z/(4*n)) / n) / denominator;
        
        const lowerBound = center - spread;
        const upperBound = center + spread;
        
        // Check if 0.5 is outside the interval
        if ((p > 0.5 && lowerBound > 0.5) || (p < 0.5 && upperBound < 0.5)) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }
    
    return low;
}

/**
 * Calculate expected value per trade (edge)
 */
function calculateExpectedValue(positions) {
    const resolved = Object.values(positions).filter(p => p.resolved);
    if (resolved.length === 0) return null;
    
    let totalEV = 0;
    for (const pos of resolved) {
        // EV = (win probability * payout) - (loss probability * stake)
        // If they bet at avgPrice, and won, payout = size * (1 - avgPrice)
        // If they lost, they lost size * avgPrice
        const implied = pos.avgPrice; // market's implied probability
        const actual = pos.won ? 1 : 0;
        const edge = actual - implied; // positive = they had edge
        totalEV += edge * pos.size * pos.avgPrice; // weighted by stake
    }
    
    const avgEdge = totalEV / resolved.reduce((sum, p) => sum + p.size * p.avgPrice, 0);
    return {
        totalEV,
        avgEdgePercent: avgEdge * 100, // as percentage of stake
        perTradeEV: totalEV / resolved.length
    };
}

/**
 * Generate the verdict - is this whale skilled or lucky?
 * Uses rigorous statistical analysis
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
    const confidence = calculateSkillConfidence(positions);
    const ev = calculateExpectedValue(positions);
    const pnl = calculatePnL(positions);
    
    let skillPoints = 0;
    let reasons = [];
    let keyInsight = '';
    
    // Statistical significance is the gold standard
    if (confidence && confidence.isSignificant) {
        skillPoints += 4;
        keyInsight = `Statistically significant ${confidence.edgeDirection} edge detected!`;
        reasons.push(`95% CI: [${confidence.lowerBound.toFixed(1)}%, ${confidence.upperBound.toFixed(1)}%] (doesn't include 50%)`);
    } else if (confidence) {
        const needed = confidence.tradesForSignificance - resolved.length;
        if (needed > 0 && needed < 100) {
            reasons.push(`Need ${needed} more trades to confirm edge (95% CI includes 50%)`);
        } else {
            reasons.push(`Current evidence insufficient - variance too high`);
        }
    }
    
    // Win rate analysis
    if (winRateData.winRate > 60) {
        skillPoints += 2;
        reasons.push(`Strong win rate: ${winRateData.winRate.toFixed(1)}%`);
    } else if (winRateData.winRate > 55) {
        skillPoints += 1;
        reasons.push(`Above-average win rate: ${winRateData.winRate.toFixed(1)}%`);
    } else if (winRateData.winRate < 45) {
        skillPoints -= 1;
        reasons.push(`Below-average win rate: ${winRateData.winRate.toFixed(1)}%`);
    } else {
        reasons.push(`Win rate near random: ${winRateData.winRate.toFixed(1)}%`);
    }
    
    // Brier score (prediction quality)
    if (brier < 0.15) {
        skillPoints += 2;
        reasons.push(`Excellent Brier score: ${brier.toFixed(3)}`);
    } else if (brier < 0.20) {
        skillPoints += 1;
        reasons.push(`Good Brier score: ${brier.toFixed(3)}`);
    } else if (brier > 0.25) {
        skillPoints -= 1;
        reasons.push(`Poor Brier score: ${brier.toFixed(3)} (worse than random)`);
    }
    
    // Calibration
    if (calibration && calibration.score > 70) {
        skillPoints += 1;
        reasons.push(`Well calibrated: ${calibration.score.toFixed(0)}%`);
    }
    
    // Expected value per trade
    if (ev && ev.avgEdgePercent > 5) {
        skillPoints += 2;
        reasons.push(`Positive edge: +${ev.avgEdgePercent.toFixed(1)}% per dollar wagered`);
    } else if (ev && ev.avgEdgePercent < -5) {
        skillPoints -= 1;
        reasons.push(`Negative edge: ${ev.avgEdgePercent.toFixed(1)}% per dollar wagered`);
    }
    
    // P&L as sanity check
    if (pnl.realized > 0 && pnl.roi > 10) {
        skillPoints += 1;
        reasons.push(`Profitable: +$${formatMoney(pnl.realized)} (${pnl.roi.toFixed(0)}% ROI)`);
    } else if (pnl.roi < -20) {
        skillPoints -= 1;
        reasons.push(`Significant losses: ${pnl.roi.toFixed(0)}% ROI`);
    }
    
    // Generate verdict based on total skill points
    if (skillPoints >= 6 && confidence && confidence.isSignificant) {
        return {
            verdict: 'skilled',
            title: '✅ VERDICT: Likely Skilled Trader',
            text: keyInsight + ' ' + reasons.join('. ') + '.',
            confident: true
        };
    } else if (skillPoints >= 4) {
        return {
            verdict: 'maybe',
            title: '🤷 VERDICT: Possibly Skilled, Not Proven',
            text: reasons.join('. ') + '. More data needed to rule out luck.',
            confident: false
        };
    } else if (skillPoints <= 0) {
        return {
            verdict: 'lucky',
            title: '🎲 VERDICT: No Evidence of Skill',
            text: reasons.join('. ') + '. Performance consistent with random chance.',
            confident: resolved.length > 30
        };
    } else {
        return {
            verdict: 'inconclusive',
            title: '❓ VERDICT: Inconclusive',
            text: reasons.join('. ') + '. Mixed signals - could be skill or luck.',
            confident: false
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
