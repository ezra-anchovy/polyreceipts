function compareWhales(whale1Data, whale2Data) {
    const ctx = document.getElementById('whaleComparisonChart').getContext('2d');
    const data = {
        labels: ['Whale 1', 'Whale 2'],
        datasets: [{
            label: 'Balance',
            data: [whale1Data.balance, whale2Data.balance],
            backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const comparisonChart = new Chart(ctx, config);
}

// Example data for testing
const whale1 = { balance: 300000 };
const whale2 = { balance: 250000 };
compareWhales(whale1, whale2);