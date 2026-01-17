#!/usr/bin/env python3
"""
Market News Scraper and Sentiment Analyzer
Scrapes Yahoo Finance news and performs sentiment analysis
"""

import json
import re
from datetime import datetime, timezone
from typing import List, Dict, Tuple

import requests
from bs4 import BeautifulSoup


class MarketNewsScraper:
    def __init__(self):
        self.base_url = "https://finance.yahoo.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Sentiment keywords
        self.bullish_keywords = [
            "rally", "growth", "record high", "beats expectations", "rate cut",
            "recovery", "bullish", "ai boom", "surge", "jump", "climb",
            "breakthrough", "expansion", "upgrade", "positive", "optimism"
        ]

        self.bearish_keywords = [
            "crash", "sell-off", "recession", "inflation", "rate hike",
            "slowdown", "uncertainty", "layoffs", "decline", "drop", "fall",
            "downgrade", "negative", "concern", "worry", "slump"
        ]

    def fetch_news_page(self) -> str:
        """Fetch the Yahoo Finance news page"""
        try:
            response = requests.get(f"{self.base_url}/news", headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching news page: {e}")
            return ""

    def extract_headlines(self, html_content: str) -> List[Dict]:
        """Extract headlines and summaries from the HTML"""
        headlines = []

        try:
            soup = BeautifulSoup(html_content, 'html.parser')

            # Yahoo Finance news articles are typically in these containers
            article_selectors = [
                'div[data-test-locator="mega"]',
                'div[data-test-locator="headline"]',
                'h3 a[href*="/news/"]',
                '.js-stream-content article',
                '.stream-item'
            ]

            articles_found = 0

            for selector in article_selectors:
                if articles_found >= 20:
                    break

                articles = soup.select(selector)
                for article in articles:
                    if articles_found >= 20:
                        break

                    try:
                        # Extract title
                        title_elem = article.select_one('h3, .headline, [data-test="headline"]')
                        if not title_elem:
                            title_elem = article.select_one('a')
                        if not title_elem:
                            continue

                        title = title_elem.get_text(strip=True)
                        if not title or len(title) < 10:
                            continue

                        # Extract URL
                        link_elem = article.select_one('a[href]')
                        url = link_elem['href'] if link_elem else ""
                        if url and not url.startswith('http'):
                            url = f"https://finance.yahoo.com{url}"

                        # Extract summary/description
                        summary_elem = article.select_one('p, .summary, [data-test="summary"]')
                        summary = summary_elem.get_text(strip=True) if summary_elem else ""

                        # Skip if we already have this headline
                        if any(h['title'] == title for h in headlines):
                            continue

                        headlines.append({
                            'title': title,
                            'description': summary,
                            'url': url
                        })

                        articles_found += 1

                    except Exception as e:
                        print(f"Error parsing article: {e}")
                        continue

        except Exception as e:
            print(f"Error parsing HTML: {e}")

        return headlines[:20]  # Ensure we return max 20

    def analyze_sentiment(self, text: str) -> int:
        """Analyze sentiment of a text and return score"""
        text_lower = text.lower()
        score = 0

        # Count bullish keywords
        for keyword in self.bullish_keywords:
            if keyword in text_lower:
                score += 1

        # Count bearish keywords
        for keyword in self.bearish_keywords:
            if keyword in text_lower:
                score -= 1

        return score

    def calculate_overall_sentiment(self, headlines: List[Dict]) -> Tuple[float, str, str]:
        """Calculate overall sentiment and recommendation"""
        if not headlines:
            return 0.0, "Neutral", "Unable to analyze market sentiment at this time."

        total_score = 0
        valid_articles = 0

        for headline in headlines:
            title_score = self.analyze_sentiment(headline['title'])
            desc_score = self.analyze_sentiment(headline['description'])
            article_score = title_score + desc_score
            total_score += article_score
            valid_articles += 1

        if valid_articles == 0:
            return 0.0, "Neutral", "Unable to analyze market sentiment at this time."

        avg_score = total_score / valid_articles

        if avg_score > 0.5:
            sentiment = "Bullish"
            recommendation = "Current market sentiment is positive. Consider dollar-cost averaging or gradual investing in quality assets."
        elif avg_score < -0.5:
            sentiment = "Bearish"
            recommendation = "Market sentiment appears cautious. Consider reducing exposure or focusing on defensive assets."
        else:
            sentiment = "Neutral"
            recommendation = "Market sentiment is mixed. Wait for clearer trend confirmation before making significant changes."

        return round(avg_score, 2), sentiment, recommendation

    def generate_market_data(self) -> Dict:
        """Main function to scrape and analyze market data"""
        print("Fetching market news...")

        html_content = self.fetch_news_page()
        if not html_content:
            return self.get_fallback_data()

        headlines = self.extract_headlines(html_content)
        print(f"Extracted {len(headlines)} headlines")

        if not headlines:
            return self.get_fallback_data()

        sentiment_score, market_sentiment, recommendation = self.calculate_overall_sentiment(headlines)

        market_data = {
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "sentimentScore": sentiment_score,
            "marketSentiment": market_sentiment,
            "recommendation": recommendation,
            "headlines": headlines
        }

        return market_data

    def get_fallback_data(self) -> Dict:
        """Return fallback data when scraping fails"""
        return {
            "updatedAt": datetime.now().isoformat() + "Z",
            "sentimentScore": 0.0,
            "marketSentiment": "Neutral",
            "recommendation": "Market data temporarily unavailable. Please check back later.",
            "headlines": []
        }


def main():
    scraper = MarketNewsScraper()
    market_data = scraper.generate_market_data()

    with open('market.json', 'w', encoding='utf-8') as f:
        json.dump(market_data, f, indent=2, ensure_ascii=False)

    print(f"Market data updated: {market_data['marketSentiment']} (Score: {market_data['sentimentScore']})")
    print(f"Headlines extracted: {len(market_data['headlines'])}")


if __name__ == "__main__":
    main()