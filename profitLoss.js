function calculateProfitLoss(whaleData) {
    // Example calculations, replace with actual logic
    const profitLossData = whaleData.map(whale => {
        return {
            name: whale.name,
            profitLoss: whale.bets.reduce((sum, bet) => sum + (bet.profit - bet.loss), 0)
        };
    });
    return profitLossData;
}