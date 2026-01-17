// Investment Simulator Logic
document.addEventListener('DOMContentLoaded', function() {
    const monthlyAmountInput = document.getElementById('monthly-amount');
    const annualReturnInput = document.getElementById('annual-return');
    const durationSelect = document.getElementById('duration');
    const inflationInput = document.getElementById('inflation');

    const totalInvestedEl = document.getElementById('total-invested');
    const finalValueEl = document.getElementById('final-value');
    const totalGainsEl = document.getElementById('total-gains');
    const cagrEl = document.getElementById('cagr');

    let growthChart;

    // Initialize chart
    function initChart() {
        const ctx = document.getElementById('growth-chart').getContext('2d');
        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    fill: true,
                    tension: 0.1
                }, {
                    label: 'Total Invested',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount (€)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': €' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Calculate investment growth
    function calculateInvestment() {
        const monthlyAmount = parseFloat(monthlyAmountInput.value) || 0;
        const annualReturn = parseFloat(annualReturnInput.value) / 100 || 0;
        const duration = parseInt(durationSelect.value) || 10;
        const inflationRate = parseFloat(inflationInput.value) / 100 || 0;

        const monthlyReturn = annualReturn / 12;
        const months = duration * 12;

        let portfolioValue = 0;
        let totalInvested = 0;
        const portfolioValues = [];
        const investedValues = [];
        const labels = [];

        for (let month = 1; month <= months; month++) {
            totalInvested += monthlyAmount;
            portfolioValue = (portfolioValue + monthlyAmount) * (1 + monthlyReturn);

            // Record data points every 12 months for the chart
            if (month % 12 === 0) {
                const year = month / 12;
                labels.push(year);
                portfolioValues.push(Math.round(portfolioValue));
                investedValues.push(totalInvested);
            }
        }

        // Adjust for inflation if specified
        let adjustedPortfolioValue = portfolioValue;
        if (inflationRate > 0) {
            const inflationFactor = Math.pow(1 - inflationRate, duration);
            adjustedPortfolioValue = portfolioValue * inflationFactor;
        }

        const totalGains = adjustedPortfolioValue - totalInvested;
        const cagr = (Math.pow(adjustedPortfolioValue / totalInvested, 1 / duration) - 1) * 100;

        // Update results
        totalInvestedEl.textContent = '€' + totalInvested.toLocaleString();
        finalValueEl.textContent = '€' + Math.round(adjustedPortfolioValue).toLocaleString();
        totalGainsEl.textContent = '€' + Math.round(totalGains).toLocaleString();
        cagrEl.textContent = cagr.toFixed(2) + '%';

        // Update chart
        growthChart.data.labels = labels;
        growthChart.data.datasets[0].data = portfolioValues;
        growthChart.data.datasets[1].data = investedValues;
        growthChart.update();
    }

    // Event listeners
    [monthlyAmountInput, annualReturnInput, durationSelect, inflationInput].forEach(input => {
        input.addEventListener('input', calculateInvestment);
        input.addEventListener('change', calculateInvestment);
    });

    // Initialize
    initChart();
    calculateInvestment();
});