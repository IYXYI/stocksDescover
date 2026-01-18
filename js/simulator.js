// Investment Simulator Logic
// Custom plugin to draw milestone vertical lines and interval labels
Chart.register({
    id: 'simulatorMilestones',
    afterDraw: function(chart) {
        const milestones = chart._simulatorMilestones || [];
        if (!milestones || milestones.length === 0) return;
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const top = chart.chartArea.top;
        const bottom = chart.chartArea.bottom;

        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,6]);

        // draw vertical lines and collect pixel positions
        const xs = [];
        milestones.forEach(ms => {
            const x = xScale.getPixelForValue(ms.years);
            if (isNaN(x)) return;
            xs.push({ x, ms });

            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            // top amount label
            const label = (ms.amount / 1000).toLocaleString() + 'K €';
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.font = '600 12px "Segoe UI", Tahoma, Geneva, sans-serif';
            const textWidth = ctx.measureText(label).width + 10;
            const rectX = x - textWidth/2;
            const rectY = top + 6;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(rectX, rectY, textWidth, 22);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, rectY + 11);
        });

        // draw interval labels between consecutive milestones (e.g., "3.78 ans")
        for (let i = 1; i < xs.length; i++) {
            const a = xs[i-1];
            const b = xs[i];
            const midX = (a.x + b.x) / 2;
            const yearsDiff = Math.abs(b.ms.years - a.ms.years);
            const ivLabel = yearsDiff.toFixed(2) + ' ans';

            ctx.font = '600 12px "Segoe UI", Tahoma, Geneva, sans-serif';
            const w = ctx.measureText(ivLabel).width + 12;
            const h = 20;
            const rectY = bottom - 36;
            ctx.fillStyle = 'rgba(52,152,219,0.1)';
            roundRect(ctx, midX - w/2, rectY, w, h, 6, true, false);

            ctx.fillStyle = 'rgba(52,152,219,0.95)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ivLabel, midX, rectY + h/2);
        }

        ctx.restore();

        function roundRect(ctx, x, y, w, h, r, fill, stroke) {
            if (typeof stroke === 'undefined') stroke = true;
            if (typeof r === 'undefined') r = 5;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
            if (fill) ctx.fill();
            if (stroke) ctx.stroke();
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const monthlyAmountInput = document.getElementById('monthly-amount');
    const initialCapitalInput = document.getElementById('initial-capital');
    const annualReturnInput = document.getElementById('annual-return');
    const durationInput = document.getElementById('duration');
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
                datasets: [{
                    label: 'Portfolio Value',
                    data: [],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.12)',
                    fill: true,
                    tension: 0.12,
                    pointRadius: 2
                }, {
                    label: 'Total Invested',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.12)',
                    fill: true,
                    tension: 0.12,
                    borderDash: [6,4],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Years' },
                        ticks: { precision: 0 },
                        min: 0
                    },
                    y: {
                        title: { display: true, text: 'Amount (€)' },
                        ticks: { callback: function(value) { return '€' + value.toLocaleString(); } }
                    }
                },
                plugins: {
                    tooltip: { callbacks: { label: function(context) { return context.dataset.label + ': €' + context.parsed.y.toLocaleString(); } } },
                    legend: { labels: { usePointStyle: true } }
                }
            }
        });
    }

    // Calculate investment growth
    function calculateInvestment() {
        const monthlyAmount = parseFloat(monthlyAmountInput.value) || 0;
        const initialCapital = parseFloat(initialCapitalInput.value) || 0;
        const annualReturn = parseFloat(annualReturnInput.value) / 100 || 0;
        const duration = parseInt(durationInput.value) || 10;
        const inflationRate = parseFloat(inflationInput.value) / 100 || 0;

        const monthlyReturn = annualReturn / 12;
        const months = duration * 12;

        // arrays to hold monthly progression
        let portfolioValue = initialCapital;
        let totalInvested = initialCapital;
        const monthlyPortfolio = new Array(months + 1).fill(0);
        const monthlyInvested = new Array(months + 1).fill(0);
        const portfolioValues = [];
        const investedValues = [];

        monthlyPortfolio[0] = portfolioValue;
        monthlyInvested[0] = totalInvested;

        for (let month = 1; month <= months; month++) {
            totalInvested += monthlyAmount;
            portfolioValue = (portfolioValue + monthlyAmount) * (1 + monthlyReturn);
            monthlyPortfolio[month] = portfolioValue;
            monthlyInvested[month] = totalInvested;
            if (month % 12 === 0) {
                const year = month / 12;
                portfolioValues.push({ x: year, y: Math.round(portfolioValue) });
                investedValues.push({ x: year, y: Math.round(totalInvested) });
            }
        }

        // compute milestone crossings per €100k
        const milestones = [];
        const maxValue = Math.max(...monthlyPortfolio);
        const step = 100000;
        if (maxValue > 0) {
            for (let t = step; t <= Math.ceil(maxValue / step) * step; t += step) {
                let hitMonth = null;
                for (let m = 0; m <= months; m++) {
                    if (monthlyPortfolio[m] >= t) { hitMonth = m; break; }
                }
                if (hitMonth !== null) milestones.push({ amount: t, month: hitMonth, years: hitMonth / 12 });
            }
        }

        // Adjust for inflation if specified
        let adjustedPortfolioValue = portfolioValue;
        if (inflationRate > 0) {
            const inflationFactor = Math.pow(1 - inflationRate, duration);
            adjustedPortfolioValue = portfolioValue * inflationFactor;
        }

        const totalGains = adjustedPortfolioValue - totalInvested;
        let cagr = 0;
        if (totalInvested > 0 && adjustedPortfolioValue > 0) {
            cagr = (Math.pow(adjustedPortfolioValue / totalInvested, 1 / duration) - 1) * 100;
        }

        // Update results
        totalInvestedEl.textContent = '€' + totalInvested.toLocaleString();
        finalValueEl.textContent = '€' + Math.round(adjustedPortfolioValue).toLocaleString();
        totalGainsEl.textContent = '€' + Math.round(totalGains).toLocaleString();
        cagrEl.textContent = isFinite(cagr) ? cagr.toFixed(2) + '%' : '—';

        // Update chart data and scale
        growthChart.data.datasets[0].data = portfolioValues;
        growthChart.data.datasets[1].data = investedValues;
        growthChart.options.scales.x.max = duration;
        growthChart.options.scales.x.min = 0;

        // attach milestones for plugin
        growthChart._simulatorMilestones = milestones;
        growthChart.update();

        // show milestone list and intervals
        renderMilestones(milestones);
    }

    function renderMilestones(milestones) {
        const container = document.getElementById('milestone-list');
        container.innerHTML = '';
        if (!milestones || milestones.length === 0) {
            container.textContent = 'No milestones reached within the selected duration.';
            return;
        }

        milestones.forEach(ms => {
            const item = document.createElement('div');
            item.className = 'milestone-item';
            item.textContent = `${(ms.amount/1000).toLocaleString()}K €: ${ms.years.toFixed(2)} ans`;
            container.appendChild(item);
        });

        if (milestones.length > 1) {
            const intervals = [];
            for (let i = 1; i < milestones.length; i++) {
                const diff = milestones[i].years - milestones[i-1].years;
                intervals.push(`${(milestones[i-1].amount/1000).toLocaleString()}K→${(milestones[i].amount/1000).toLocaleString()}: ${diff.toFixed(2)} ans`);
            }
            const ivWrap = document.createElement('div');
            ivWrap.style.marginTop = '0.6rem';
            ivWrap.style.fontSize = '0.95rem';
            ivWrap.textContent = 'Intervals: ' + intervals.join(' • ');
            container.appendChild(ivWrap);
        }
    }

    // Event listeners
    [monthlyAmountInput, initialCapitalInput, annualReturnInput, durationInput, inflationInput].forEach(input => {
        input.addEventListener('input', calculateInvestment);
        input.addEventListener('change', calculateInvestment);
    });

    // Initialize
    initChart();
    calculateInvestment();
});
// Investment Simulator Logic
document.addEventListener('DOMContentLoaded', function() {
    const monthlyAmountInput = document.getElementById('monthly-amount');
    const initialCapitalInput = document.getElementById('initial-capital');
    const annualReturnInput = document.getElementById('annual-return');
    const durationInput = document.getElementById('duration');
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
                datasets: [{
                    label: 'Portfolio Value',
                    data: [],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.12)',
                    fill: true,
                    tension: 0.12,
                    pointRadius: 2
                }, {
                    label: 'Total Invested',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.12)',
                    fill: true,
                    tension: 0.12,
                    borderDash: [6,4],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Years'
                        },
                        ticks: {
                            precision: 0
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
                    },
                    legend: {
                        labels: { usePointStyle: true }
                    }
                }
            }
        });
    }

    // Calculate investment growth
    function calculateInvestment() {
        const monthlyAmount = parseFloat(monthlyAmountInput.value) || 0;
        const initialCapital = parseFloat(initialCapitalInput.value) || 0;
        const annualReturn = parseFloat(annualReturnInput.value) / 100 || 0;
        const duration = parseInt(durationInput.value) || 10;
        const inflationRate = parseFloat(inflationInput.value) / 100 || 0;

        const monthlyReturn = annualReturn / 12;
        // Custom plugin to draw milestone vertical lines and interval labels
        Chart.register({
            id: 'simulatorMilestones',
            afterDraw: function(chart) {
                const milestones = chart._simulatorMilestones || [];
                if (!milestones || milestones.length === 0) return;
                const ctx = chart.ctx;
                const xScale = chart.scales.x;
                const top = chart.chartArea.top;
                const bottom = chart.chartArea.bottom;

                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4,6]);

                // draw vertical lines and top labels
                const xs = [];
                milestones.forEach(ms => {
                    const x = xScale.getPixelForValue(ms.years);
                    if (isNaN(x)) return;
                    xs.push({ x, ms });

                    ctx.beginPath();
                    ctx.moveTo(x, top);
                    ctx.lineTo(x, bottom);
                    ctx.stroke();

                    // amount label at top
                    const label = (ms.amount / 1000).toLocaleString() + 'K €';
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(0,0,0,0.75)';
                    ctx.font = '600 12px "Segoe UI", Tahoma, Geneva, sans-serif';
                    const textWidth = ctx.measureText(label).width + 10;
                    const rectX = x - textWidth/2;
                    const rectY = top + 6;
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(rectX, rectY, textWidth, 22);
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, x, rectY + 11);
                });

                // draw interval labels between consecutive milestones (e.g., "3.78 ans")
                for (let i = 1; i < xs.length; i++) {
                    const a = xs[i-1];
                    const b = xs[i];
                    const midX = (a.x + b.x) / 2;
                    const yearsDiff = Math.abs(b.ms.years - a.ms.years);
                    const ivLabel = yearsDiff.toFixed(2) + ' ans';

                    // draw small rounded rect background
                    ctx.font = '600 12px "Segoe UI", Tahoma, Geneva, sans-serif';
                    const w = ctx.measureText(ivLabel).width + 12;
                    const h = 20;
                    const rectY = bottom - 36;
                    ctx.fillStyle = 'rgba(52,152,219,0.1)';
                    roundRect(ctx, midX - w/2, rectY, w, h, 6, true, false);

                    // text
                    ctx.fillStyle = 'rgba(52,152,219,0.95)';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(ivLabel, midX, rectY + h/2);
                }

                ctx.restore();

                function roundRect(ctx, x, y, w, h, r, fill, stroke) {
                    if (typeof stroke === 'undefined') {
                        stroke = true;
                    }
                    if (typeof r === 'undefined') {
                        r = 5;
                    }
                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.arcTo(x + w, y, x + w, y + h, r);
                    ctx.arcTo(x + w, y + h, x, y + h, r);
                    ctx.arcTo(x, y + h, x, y, r);
                    ctx.arcTo(x, y, x + w, y, r);
                    ctx.closePath();
                    if (fill) ctx.fill();
                    if (stroke) ctx.stroke();
                }
            }
        });

        // intervals
        if (milestones.length > 1) {
            const intervals = [];
            for (let i = 1; i < milestones.length; i++) {
                const diff = milestones[i].years - milestones[i-1].years;
                intervals.push(`${(milestones[i-1].amount/1000).toLocaleString()}K→${(milestones[i].amount/1000).toLocaleString()}: ${diff.toFixed(2)} yrs`);
            }
            const ivWrap = document.createElement('div');
            ivWrap.style.marginTop = '0.6rem';
            ivWrap.style.fontSize = '0.9rem';
            ivWrap.textContent = 'Intervals: ' + intervals.join(' • ');
            container.appendChild(ivWrap);
        }
    }

    // Event listeners
    [monthlyAmountInput, initialCapitalInput, annualReturnInput, durationInput, inflationInput].forEach(input => {
        input.addEventListener('input', calculateInvestment);
        input.addEventListener('change', calculateInvestment);
    });

    // Initialize
    initChart();
    calculateInvestment();
});

// Custom plugin to draw milestone vertical lines and labels
Chart.register({
    id: 'simulatorMilestones',
    afterDraw: function(chart) {
        const milestones = chart._simulatorMilestones || [];
        if (!milestones || milestones.length === 0) return;
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const top = chart.chartArea.top;
        const bottom = chart.chartArea.bottom;

        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,6]);

        milestones.forEach(ms => {
            const x = xScale.getPixelForValue(ms.years);
            if (isNaN(x)) return;
            // vertical dashed line
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            // top label (amount)
            const label = (ms.amount / 1000).toLocaleString() + 'K €';
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.font = '600 12px "Segoe UI", Tahoma, Geneva, sans-serif';
            const textWidth = ctx.measureText(label).width + 8;
            const rectX = x - textWidth/2;
            const rectY = top + 6;
            // background
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(rectX, rectY, textWidth, 20);
            // text
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, rectY + 10);

            // bottom label (years)
            const yrsLabel = ms.years.toFixed(2) + ' yrs';
            ctx.font = '500 11px "Segoe UI", Tahoma, Geneva, sans-serif';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.textBaseline = 'top';
            ctx.fillText(yrsLabel, x, bottom + 6);
        });

        ctx.restore();
    }
});