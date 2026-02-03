function calculateKellyCriterion(winProbability, odds) {
    return (winProbability * odds - (1 - winProbability)) / odds;
}

// Example usage
const winProbability = 0.55; // 55% probability of winning
const odds = 2; // Decimal odds
const kellyCriterion = calculateKellyCriterion(winProbability, odds);

const kellyDisplay = document.createElement('div');
kellyDisplay.innerHTML = `<strong>Kelly Criterion:</strong> ${kellyCriterion.toFixed(4)}`;
document.querySelector('.container').appendChild(kellyDisplay);