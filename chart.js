const data = {
    labels: ['Politics', 'Sports', 'Crypto'],
    datasets: [{
        label: 'Win Rates',
        data: [0.45, 0.60, 0.55], // Placeholder values
        backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
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

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, config);