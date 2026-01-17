# Stock Market Discovery

A static website for stock market education featuring a long-term investment simulator and real-time market sentiment analysis.

## Purpose

This site helps users understand stock market investing through:
- **Investment Simulator**: Simulate dollar-cost averaging (DCA) over long periods with customizable parameters.
- **Market Outlook**: Real-time market sentiment analysis based on financial news headlines.

**Disclaimer**: This is for educational purposes only and is not financial advice.

## Viewing the Site

The website is hosted on GitHub Pages and accessible at:
https://iyxyi.github.io/stocksDescover/

## Features

### Investment Simulator
- Monthly investment amount input (customizable)
- Annual return rate (default 7%)
- Investment duration (1-50 years, fully customizable)
- Optional inflation adjustment
- Real-time calculation of total invested, final value, gains, and CAGR
- Interactive growth chart showing portfolio vs invested amount

### Market Sentiment Analysis
- **Automated News Scraping**: Runs every 2 minutes via GitHub Actions
- **Real-time Headlines**: Latest 20 financial news headlines from Yahoo Finance
- **Sentiment Scoring**: Keyword-based analysis of bullish vs bearish terms
- **Market Recommendations**: DCA guidance based on current sentiment
- **Live Updates**: Data refreshes automatically without page reload

## Market News Integration

The website now features real-time market sentiment analysis powered by automated news scraping:

### How It Works
- **Automated Scraping**: A GitHub Action runs every 2 minutes to scrape the latest financial news from Yahoo Finance
- **Sentiment Analysis**: Headlines are analyzed using keyword-based sentiment scoring
- **Real-time Updates**: Market sentiment, recommendations, and headlines are updated automatically
- **Static Hosting**: All data is stored in `market.json` for fast loading on GitHub Pages

### Sentiment Analysis Methodology
- **Bullish Keywords**: rally, growth, record high, beats expectations, rate cut, recovery, bullish, AI boom, etc.
- **Bearish Keywords**: crash, sell-off, recession, inflation, rate hike, slowdown, uncertainty, layoffs, etc.
- **Scoring**: +1 for bullish keywords, -1 for bearish keywords per article
- **Overall Score**: Average sentiment across all analyzed headlines

### Market Recommendations
- **Bullish (>0.5)**: Favorable for dollar-cost averaging
- **Neutral (-0.5 to 0.5)**: Wait for clearer trend confirmation
- **Bearish (<-0.5)**: Consider reducing exposure or defensive assets

### Technical Implementation
- **Language**: Python with BeautifulSoup for web scraping
- **Scheduling**: GitHub Actions with cron (`*/2 * * * *`)
- **Data Storage**: JSON file committed to repository
- **Frontend**: Vanilla JavaScript fetch API for data loading
- **Error Handling**: Graceful fallbacks when scraping fails

## Technologies Used

- HTML5, CSS3, Vanilla JavaScript
- Chart.js for data visualization
- Python with BeautifulSoup for web scraping
- GitHub Actions for automation
- Responsive design for desktop and mobile
- Static site hosted on GitHub Pages

## Project Structure

```
/
├── index.html                 # Investment simulator page
├── market.html                # Market outlook page
├── market.json                # Generated market sentiment data
├── css/
│   └── styles.css            # Shared styles with dark mode
├── js/
│   ├── simulator.js          # Simulator logic
│   └── market.js             # Market data display
├── scripts/
│   └── scrape_news.py        # News scraping script
└── .github/workflows/
    ├── deploy.yml            # GitHub Pages deployment
    └── news-scraper.yml      # News scraping automation
```

## Local Development

Since this is a static site, you can open the HTML files directly in a browser. For the best experience, serve the files from a local server to handle relative paths correctly.

## Deployment

The site is automatically deployed using GitHub Actions whenever changes are pushed to the `main` branch. The news scraper also runs automatically every 2 minutes to keep market data current.

### Deployment Flow:
1. Push changes to `main` branch → Site redeploys
2. Every 2 minutes → News scraper runs → `market.json` updates → Site shows fresh data

## Future Enhancements

The code is structured to easily add:
- Additional news sources
- More sophisticated sentiment analysis (NLP models)
- Historical sentiment tracking
- Additional investment strategies
- More detailed analytics