// Market Outlook Logic
document.addEventListener('DOMContentLoaded', function() {
    const sentimentIndicator = document.getElementById('sentiment-indicator');
    const sentimentLabel = document.getElementById('sentiment-label');
    const trendSummary = document.getElementById('trend-summary');
    const dcaRecommendation = document.getElementById('dca-recommendation');

    // Mock market data - in a real implementation, this would come from APIs
    function getMockMarketData() {
        // Simulate different market conditions
        const conditions = ['bullish', 'neutral', 'bearish'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

        const data = {
            bullish: {
                sentiment: 'Bullish',
                summary: 'Markets have shown strong upward momentum over the past few weeks with positive economic indicators and corporate earnings beating expectations.',
                recommendation: 'Current conditions are favorable for progressive investing (DCA). Consider maintaining or increasing your monthly investment amounts.'
            },
            neutral: {
                sentiment: 'Neutral',
                summary: 'Markets are experiencing moderate volatility with mixed signals from economic data. Some sectors are performing well while others face challenges.',
                recommendation: 'Market conditions are balanced. DCA remains a solid strategy, but consider monitoring economic indicators closely before making significant changes.'
            },
            bearish: {
                sentiment: 'Bearish',
                summary: 'Recent market trends show downward pressure with increased volatility and concerns about economic slowdown. Risk appetite appears reduced.',
                recommendation: 'Current market conditions suggest caution. While DCA can help mitigate timing risk, you may want to consider reducing investment amounts temporarily or waiting for clearer signals.'
            }
        };

        return data[randomCondition];
    }

    // Update market display
    function updateMarketDisplay() {
        const marketData = getMockMarketData();

        sentimentLabel.textContent = marketData.sentiment;
        sentimentIndicator.className = 'sentiment-indicator sentiment-' + marketData.sentiment.toLowerCase();

        trendSummary.textContent = marketData.summary;
        dcaRecommendation.textContent = marketData.recommendation;
    }

    // Initialize with mock data
    updateMarketDisplay();

    // In a real implementation, you could add a refresh button or auto-update
    // For now, the data is static on page load to simulate current conditions
});