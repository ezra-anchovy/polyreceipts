const whaleAddresses = [
    { name: 'Whale A', address: '0x1234567890abcdef1234567890abcdef12345678' },
    { name: 'Whale B', address: '0xabcdef1234567890abcdef1234567890abcdef12' },
    // Add more whale addresses as needed
];

function updateWhaleData() {
    // Fetch real whale data from a tracker API or input manually
    compareWhales(whaleAddresses[0], whaleAddresses[1]); // Example for comparison
}