// PolyReceipts App - Main Application Logic

let currentWhale = null;
let charts = {};

// Select a known whale
function selectWhale(whaleId) {
    const whale = KNOWN_WHALES[whaleId];
    if (!whale) {
        alert('Whale not found!');
        return;
    }
    
    document.getElementById('walletInput').value = whale.wallet;
    
    // Update button states
    document.querySelectorAll('.whale-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    analyzeWhale(whale);
}

// Analyze from wallet input
function analyzeWallet() {
    const wallet = document.getElementById('walletInput').value.trim();
    if (!wallet) {
        alert('Please enter a wallet address');
        return;
    }
    
    // Check if it's a known whale
    for (const [id, whale] of Object.entries(KNOWN_WHALES)) {
        if (whale.wallet.toLowerCase() === wallet.toLowerCase()) {
            analyzeWhale(whale);
            return;
        }
    }
    
    // Unknown wallet - show loading then mock data
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        alert('Wallet not in our database yet. Try one of the known whales!');
    }, 1500);
}

// Main analysis function
function analyzeWhale(whale) {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    setTimeout(() => {
        currentWhale = whale;
        
        // Calculate all stats
        const pnl = calculatePnL(whale.positions);
        const winRateData = calculateWinRate(whale.positions);
        const brier = calculateBrierScore(whale.positions);
        const calibration = calculateCalibration(whale.positions);
        const tradesNeeded = calculateTradesNeeded(whale.positions);
        const verdict = generateVerdict(whale.positions);
        
        // Update UI
        updateStats(pnl, winRateData, brier, calibration, tradesNeeded);
        updateVerdict(verdict);
        updateCharts(whale.positions, calibration);
        updateReceipts(whale.positions);
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');
    }, 800);
}

// Update stat cards
function updateStats(pnl, winRate, brier, calibration, tradesNeeded) {
    // P&L
    const pnlEl = document.getElementById('totalPnL');
    pnlEl.textContent = (pnl.total >= 0 ? '+$' : '-$') + formatMoney(Math.abs(pnl.total));
    pnlEl.className = 'stat-value ' + (pnl.total >= 0 ? 'positive' : 'negative');
    
    // Win Rate
    const wrEl = document.getElementById('winRate');
    if (winRate) {
        wrEl.textContent = winRate.winRate.toFixed(1) + '%';
        wrEl.className = 'stat-value ' + (winRate.winRate >= 50 ? 'positive' : 'negative');
    } else {
        wrEl.textContent = 'N/A';
        wrEl.className = 'stat-value neutral';
    }
    
    // Brier Score
    const brierEl = document.getElementById('brierScore');
    if (brier !== null) {
        brierEl.textContent = brier.toFixed(3);
        brierEl.className = 'stat-value ' + (brier < 0.20 ? 'positive' : brier < 0.25 ? 'neutral' : 'negative');
    } else {
        brierEl.textContent = 'N/A';
        brierEl.className = 'stat-value neutral';
    }
    
    // Calibration
    const calEl = document.getElementById('calibrationScore');
    if (calibration) {
        calEl.textContent = calibration.score.toFixed(0) + '%';
        calEl.className = 'stat-value ' + (calibration.score >= 60 ? 'positive' : calibration.score >= 40 ? 'neutral' : 'negative');
    } else {
        calEl.textContent = 'N/A';
        calEl.className = 'stat-value neutral';
    }
    
    // Total Trades
    document.getElementById('totalTrades').textContent = Object.keys(currentWhale.positions).length;
    
    // Trades Needed
    const tnEl = document.getElementById('tradesNeeded');
    if (tradesNeeded === Infinity || tradesNeeded > 9999) {
        tnEl.textContent = '∞';
        tnEl.className = 'stat-value negative';
    } else if (tradesNeeded === 0) {
        tnEl.textContent = '✓';
        tnEl.className = 'stat-value positive';
    } else {
        tnEl.textContent = tradesNeeded;
        tnEl.className = 'stat-value ' + (tradesNeeded < 100 ? 'neutral' : 'negative');
    }
}

// Update verdict display
function updateVerdict(verdict) {
    const verdictDiv = document.getElementById('verdict');
    verdictDiv.className = 'verdict ' + (verdict.verdict === 'skilled' ? 'skilled' : '');
    document.getElementById('verdictTitle').textContent = verdict.title;
    document.getElementById('verdictText').textContent = verdict.text;
}

// Update all charts
function updateCharts(positions, calibration) {
    // Destroy existing charts
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
    
    // Calibration Chart
    if (calibration) {
        const ctx = document.getElementById('calibrationChart').getContext('2d');
        charts.calibration = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: calibration.buckets.map(b => b.label),
                datasets: [
                    {
                        label: 'Actual Win Rate',
                        data: calibration.buckets.map(b => 
                            b.predictions.length > 0 ? (b.wins / b.predictions.length * 100) : 0
                        ),
                        backgroundColor: 'rgba(243, 156, 18, 0.7)',
                        borderColor: '#f39c12',
                        borderWidth: 2
                    },
                    {
                        label: 'Perfect Calibration',
                        data: [10, 30, 50, 70, 90],
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 2,
                        type: 'line'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Win Rate %', color: '#888' },
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        title: { display: true, text: 'Confidence Level', color: '#888' },
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } }
                }
            }
        });
    }
    
    // Category Chart
    const categories = getPerformanceByCategory(positions);
    const catLabels = Object.keys(categories);
    const catWinRates = catLabels.map(cat => {
        const data = categories[cat];
        return data.wins / (data.wins + data.losses) * 100;
    });
    
    if (catLabels.length > 0) {
        const catCtx = document.getElementById('categoryChart').getContext('2d');
        charts.category = new Chart(catCtx, {
            type: 'bar',
            data: {
                labels: catLabels,
                datasets: [{
                    label: 'Win Rate by Category',
                    data: catWinRates,
                    backgroundColor: catWinRates.map(wr => 
                        wr >= 55 ? 'rgba(46, 204, 113, 0.7)' : 
                        wr >= 45 ? 'rgba(243, 156, 18, 0.7)' : 
                        'rgba(231, 76, 60, 0.7)'
                    ),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Win Rate %', color: '#888' },
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // Timeline Chart (simulated cumulative P&L)
    const resolved = Object.values(positions).filter(p => p.resolved);
    let cumulative = 0;
    const timelineData = resolved.map((pos, i) => {
        if (pos.won) {
            cumulative += pos.size * (1 - pos.avgPrice);
        } else {
            cumulative -= pos.size * pos.avgPrice;
        }
        return cumulative;
    });
    
    if (timelineData.length > 0) {
        const tlCtx = document.getElementById('timelineChart').getContext('2d');
        charts.timeline = new Chart(tlCtx, {
            type: 'line',
            data: {
                labels: resolved.map((_, i) => `Trade ${i + 1}`),
                datasets: [{
                    label: 'Cumulative P&L',
                    data: timelineData,
                    borderColor: timelineData[timelineData.length - 1] >= 0 ? '#2ecc71' : '#e74c3c',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: { display: true, text: 'P&L ($)', color: '#888' },
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#888', maxTicksLimit: 10 },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

// Update receipts table
function updateReceipts(positions) {
    const tbody = document.getElementById('receiptsBody');
    tbody.innerHTML = '';
    
    const posArray = Object.entries(positions).sort((a, b) => b[1].size - a[1].size);
    
    for (const [key, pos] of posArray) {
        const tr = document.createElement('tr');
        
        // Calculate P&L for this position
        let pnl = 0;
        let resultClass = 'pending';
        let resultText = '⏳ Pending';
        
        if (pos.resolved) {
            if (pos.won) {
                pnl = pos.size * (1 - pos.avgPrice);
                resultClass = 'win';
                resultText = '✅ Won';
            } else {
                pnl = -pos.size * pos.avgPrice;
                resultClass = 'loss';
                resultText = '❌ Lost';
            }
        } else {
            pnl = pos.size * (pos.curPrice - pos.avgPrice);
        }
        
        tr.innerHTML = `
            <td>${pos.title.substring(0, 40)}${pos.title.length > 40 ? '...' : ''}</td>
            <td>${pos.outcome}</td>
            <td>$${formatMoney(pos.size)}</td>
            <td>${(pos.avgPrice * 100).toFixed(0)}%</td>
            <td class="${resultClass}">${resultText}</td>
            <td class="${pnl >= 0 ? 'win' : 'loss'}">${pnl >= 0 ? '+' : ''}$${formatMoney(Math.abs(pnl))}</td>
        `;
        tbody.appendChild(tr);
    }
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    event.target.classList.add('active');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Show calibration tab by default
    document.getElementById('calibration-tab').classList.remove('hidden');
});
