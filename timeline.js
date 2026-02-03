const timelineData = [
    { year: 2021, winRate: 0.40 },
    { year: 2022, winRate: 0.45 },
    { year: 2023, winRate: 0.50 },
    { year: 2024, winRate: 0.55 },
    { year: 2025, winRate: 0.52 }
];

const ctx = document.getElementById('timelineChart').getContext('2d');
const timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timelineData.map(data => data.year),
        datasets: [{
            label: 'Win Rates Over Time',
            data: timelineData.map(data => data.winRate),
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});