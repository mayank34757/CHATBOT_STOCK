const ALPHA_VANTAGE_API_KEY = 'GUS5JXA9TA80H688'; // Alpha Vantage API key
const FINNHUB_API_KEY = 'cvp3b41r01qihjtrtmigcvp3b41r01qihjtrtmj0'; // Finnhub API key
const GEMINI_API_KEY = 'AIzaSyBvxC2k808xH55F2x-malFaHdwdZTPzTfI'; // Gemini API key
// const MARKETSTACK_API_KEY = '9e1145557c68d4acd77ba76e97afa0d4'; // MarketStack API key

let socket;
let stockChart;
let stockLineChart;
let priceHistory = [];
let timeHistory = [];
const stockCache = new Map(); // Cache for API responses
const historicalCache = new Map(); // Cache for 30-day data
let currentSymbol = null; // Track current stock symbol
let currentMarket = null; // Track current market
let currentCurrency = null; // Track current currency
let lastRealTimeData = null; // Store last real-time chart data

// Trusted stock data
const trustedStockData = {
    AAPL: {
        currentPrice: 198.023,
        open: 196.12,
        high: 198.917,
        low: 194.049,
        prevClose: 193.16,
        marketCap: 3042270223960.0 / 1e12, // 3.04227 Trillion
        yearHigh: 260.1,
        yearLow: 164.77,
        peRatio: null,
        dividendYield: null,
        currency: 'USD',
        market: 'US',
        change: (((198.023 - 193.16) / 193.16) * 100).toFixed(2) + '%' // +2.52%
    },
    'TCS.NS': {
        currentPrice: 4200.00,
        open: 4180.00,
        high: 4220.00,
        low: 4150.00,
        prevClose: 4190.00,
        marketCap: 15200000, // Crores
        yearHigh: 4500.00,
        yearLow: 3500.00,
        peRatio: 32.50,
        dividendYield: 1.20,
        currency: 'INR',
        market: 'IN',
        change: (((4200.00 - 4190.00) / 4190.00) * 100).toFixed(2) + '%'
    },
    'RELIANCE.NS': {
        currentPrice: 3250.00,
        open: 3230.00,
        high: 3270.00,
        low: 3210.00,
        prevClose: 3240.00,
        marketCap: 22000000, // Crores
        yearHigh: 3500.00,
        yearLow: 2600.00,
        peRatio: 28.00,
        dividendYield: 0.30,
        currency: 'INR',
        market: 'IN',
        change: (((3250.00 - 3240.00) / 3240.00) * 100).toFixed(2) + '%'
    },
    'HDFCBANK.NS': {
        currentPrice: 1750.00,
        open: 1740.00,
        high: 1765.00,
        low: 1730.00,
        prevClose: 1745.00,
        marketCap: 13000000, // Crores
        yearHigh: 1900.00,
        yearLow: 1400.00,
        peRatio: 18.50,
        dividendYield: 1.10,
        currency: 'INR',
        market: 'IN',
        change: (((1750.00 - 1745.00) / 1745.00) * 100).toFixed(2) + '%'
    },
    'INFY.NS': {
        currentPrice: 1900.00,
        open: 1885.00,
        high: 1915.00,
        low: 1870.00,
        prevClose: 1890.00,
        marketCap: 8000000, // Crores
        yearHigh: 2100.00,
        yearLow: 1600.00,
        peRatio: 30.00,
        dividendYield: 1.50,
        currency: 'INR',
        market: 'IN',
        change: (((1900.00 - 1890.00) / 1890.00) * 100).toFixed(2) + '%'
    },
    'HINDUNILVR.NS': {
        currentPrice: 2700.00,
        open: 2680.00,
        high: 2720.00,
        low: 2660.00,
        prevClose: 2690.00,
        marketCap: 6500000, // Crores
        yearHigh: 3000.00,
        yearLow: 2400.00,
        peRatio: 55.00,
        dividendYield: 1.80,
        currency: 'INR',
        market: 'IN',
        change: (((2700.00 - 2690.00) / 2690.00) * 100).toFixed(2) + '%'
    },
    'ICICIBANK.NS': {
        currentPrice: 1250.00,
        open: 1240.00,
        high: 1260.00,
        low: 1230.00,
        prevClose: 1245.00,
        marketCap: 9000000, // Crores
        yearHigh: 1350.00,
        yearLow: 1000.00,
        peRatio: 19.00,
        dividendYield: 0.80,
        currency: 'INR',
        market: 'IN',
        change: (((1250.00 - 1245.00) / 1245.00) * 100).toFixed(2) + '%'
    },
    'SBIN.NS': {
        currentPrice: 850.00,
        open: 840.00,
        high: 860.00,
        low: 830.00,
        prevClose: 845.00,
        marketCap: 7500000, // Crores
        yearHigh: 950.00,
        yearLow: 650.00,
        peRatio: 12.00,
        dividendYield: 1.60,
        currency: 'INR',
        market: 'IN',
        change: (((850.00 - 845.00) / 845.00) * 100).toFixed(2) + '%'
    },
    'BHARTIARTL.NS': {
        currentPrice: 1600.00,
        open: 1585.00,
        high: 1615.00,
        low: 1570.00,
        prevClose: 1590.00,
        marketCap: 9500000, // Crores
        yearHigh: 1750.00,
        yearLow: 1200.00,
        peRatio: 35.00,
        dividendYield: 0.50,
        currency: 'INR',
        market: 'IN',
        change: (((1600.00 - 1590.00) / 1590.00) * 100).toFixed(2) + '%'
    },
    'ITC.NS': {
        currentPrice: 500.00,
        open: 495.00,
        high: 505.00,
        low: 490.00,
        prevClose: 498.00,
        marketCap: 6000000, // Crores
        yearHigh: 550.00,
        yearLow: 400.00,
        peRatio: 25.00,
        dividendYield: 2.50,
        currency: 'INR',
        market: 'IN',
        change: (((500.00 - 498.00) / 498.00) * 100).toFixed(2) + '%'
    },
    'KOTAKBANK.NS': {
        currentPrice: 1850.00,
        open: 1835.00,
        high: 1865.00,
        low: 1820.00,
        prevClose: 1840.00,
        marketCap: 3500000, // Crores
        yearHigh: 2000.00,
        yearLow: 1600.00,
        peRatio: 22.00,
        dividendYield: 0.90,
        currency: 'INR',
        market: 'IN',
        change: (((1850.00 - 1840.00) / 1840.00) * 100).toFixed(2) + '%'
    },
    'ASIANPAINT.NS': {
        currentPrice: 3100.00,
        open: 3080.00,
        high: 3120.00,
        low: 3060.00,
        prevClose: 3090.00,
        marketCap: 3000000, // Crores
        yearHigh: 3400.00,
        yearLow: 2700.00,
        peRatio: 50.00,
        dividendYield: 1.00,
        currency: 'INR',
        market: 'IN',
        change: (((3100.00 - 3090.00) / 3090.00) * 100).toFixed(2) + '%'
    },
    'BAJFINANCE.NS': {
        currentPrice: 7500.00,
        open: 7450.00,
        high: 7550.00,
        low: 7400.00,
        prevClose: 7470.00,
        marketCap: 4500000, // Crores
        yearHigh: 8200.00,
        yearLow: 6000.00,
        peRatio: 40.00,
        dividendYield: 0.40,
        currency: 'INR',
        market: 'IN',
        change: (((7500.00 - 7470.00) / 7470.00) * 100).toFixed(2) + '%'
    },
    'MARUTI.NS': {
        currentPrice: 12500.00,
        open: 12400.00,
        high: 12600.00,
        low: 12350.00,
        prevClose: 12450.00,
        marketCap: 4000000, // Crores
        yearHigh: 14000.00,
        yearLow: 10000.00,
        peRatio: 28.00,
        dividendYield: 0.70,
        currency: 'INR',
        market: 'IN',
        change: (((12500.00 - 12450.00) / 12450.00) * 100).toFixed(2) + '%'
    },
    'LT.NS': {
        currentPrice: 3700.00,
        open: 3680.00,
        high: 3720.00,
        low: 3660.00,
        prevClose: 3690.00,
        marketCap: 5000000, // Crores
        yearHigh: 4000.00,
        yearLow: 3200.00,
        peRatio: 32.00,
        dividendYield: 0.60,
        currency: 'INR',
        market: 'IN',
        change: (((3700.00 - 3690.00) / 3690.00) * 100).toFixed(2) + '%'
    },
    'AXISBANK.NS': {
        currentPrice: 1150.00,
        open: 1140.00,
        high: 1160.00,
        low: 1130.00,
        prevClose: 1145.00,
        marketCap: 3500000, // Crores
        yearHigh: 1250.00,
        yearLow: 900.00,
        peRatio: 15.00,
        dividendYield: 0.90,
        currency: 'INR',
        market: 'IN',
        change: (((1150.00 - 1145.00) / 1145.00) * 100).toFixed(2) + '%'
    },
    'SUNPHARMA.NS': {
        currentPrice: 1650.00,
        open: 1635.00,
        high: 1665.00,
        low: 1620.00,
        prevClose: 1640.00,
        marketCap: 4000000, // Crores
        yearHigh: 1800.00,
        yearLow: 1300.00,
        peRatio: 35.00,
        dividendYield: 0.80,
        currency: 'INR',
        market: 'IN',
        change: (((1650.00 - 1640.00) / 1640.00) * 100).toFixed(2) + '%'
    }
};

// Common symbols
const commonUSSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'FB', 'NVDA', 'JPM', 'V', 'WMT',
    'JNJ', 'PG', 'MA', 'DIS', 'ADBE', 'NFLX', 'PYPL', 'INTC', 'CSCO', 'CMCSA','META'
];
const commonIndianSymbols = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
    'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS',
    'ASIANPAINT.NS', 'BAJFINANCE.NS', 'MARUTI.NS', 'LT.NS', 'AXISBANK.NS',
    'SUNPHARMA.NS',
    'RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'HINDUNILVR.BO',
    'ICICIBANK.BO', 'SBIN.BO', 'BHARTIARTL.BO', 'ITC.BO', 'KOTAKBANK.BO',
    'ASIANPAINT.BO', 'BAJFINANCE.BO', 'MARUTI.BO', 'LT.BO', 'AXISBANK.BO',
    'SUNPHARMA.BO',
    'NSE:RELIANCE', 'NSE:TCS', 'NSE:HDFCBANK', 'NSE:INFY', 'NSE:HINDUNILVR',
    'NSE:ICICIBANK', 'NSE:SBIN', 'NSE:BHARTIARTL', 'NSE:ITC', 'NSE:KOTAKBANK',
    'NSE:ASIANPAINT', 'NSE:BAJFINANCE', 'NSE:MARUTI', 'NSE:LT', 'NSE:AXISBANK',
    'NSE:SUNPHARMA'
];

// Normalize symbol for APIs
function normalizeSymbol(symbol, market = 'US', api = 'alpha') {
    symbol = symbol.toUpperCase();
    if (market === 'IN') {
        if (api === 'alpha') {
            return `NSE:${symbol.replace('.NS', '').replace('.BO', '').replace('NSE:', '')}`;
        }
        if (api === 'marketstack') {
            return symbol.replace('.NS', '.NSE').replace('.BO', '.BSE').replace('NSE:', '') + '.NSE';
        }
        if (api === 'indian') {
            return symbol.replace('.NS', '').replace('.BO', '').replace('NSE:', '');
        }
        return symbol.includes('.') || symbol.includes(':') ? symbol : `${symbol}.NS`;
    }
    return symbol;
}

// Determine market
function detectMarket(symbol) {
    symbol = symbol.toUpperCase();
    if (symbol.endsWith('.NS') || symbol.endsWith('.BO') || symbol.startsWith('NSE:')) {
        return 'IN';
    }
    return 'US';
}

// Validate symbol
async function validateSymbol(symbol) {
    symbol = symbol.toUpperCase();
    console.log(`Validating symbol: ${symbol}`);
    
    if (trustedStockData[symbol] || commonUSSymbols.includes(symbol) || commonIndianSymbols.includes(symbol)) {
        console.log(`Symbol ${symbol} validated via trusted/common list`);
        return true;
    }

    const market = detectMarket(symbol);
    const normalizedSymbol = normalizeSymbol(symbol, market, 'alpha');

    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${normalizedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
        if (!response.ok) throw new Error(`Alpha Vantage validation error: ${response.status}`);
        const data = await response.json();
        const isValid = data.bestMatches && data.bestMatches.some(match => 
            match['1. symbol'].toUpperCase().includes(normalizedSymbol.split(':').pop())
        );
        console.log(`Alpha Vantage validation for ${normalizedSymbol}: ${isValid}`);
        return isValid;
    } catch (error) {
        console.error(`Symbol validation error for ${symbol}:`, error);
        if (market === 'IN') {
            const baseSymbol = symbol.replace('.NS', '').replace('.BO', '').replace('NSE:', '');
            return commonIndianSymbols.some(s => s.includes(baseSymbol));
        }
        return false;
    }
}

// Show/hide loading
function toggleLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Reset UI
function resetUI() {
    const chartSection = document.querySelector('.chart-section');
    chartSection.style.display = 'none';
    chartSection.classList.remove('active');
    document.getElementById('stockChart').style.display = 'none';
    document.getElementById('stockLineChart').style.display = 'none';
    if (stockChart) stockChart.destroy();
    if (stockLineChart) stockLineChart.destroy();
    if (socket) socket.close();
    document.getElementById('thirtyDayChartBtn').disabled = true;
    document.getElementById('realTimeChartsBtn').disabled = true;
    document.getElementById('buySellSuggestionBtn').disabled = true;
    currentSymbol = null;
    currentMarket = null;
    currentCurrency = null;
    lastRealTimeData = null;
}

// Create bar chart
function createStockChart(symbol, data, currency = 'USD') {
    const ctx = document.getElementById('stockChart').getContext('2d');
    const chartSection = document.querySelector('.chart-section');

    if (stockChart) stockChart.destroy();

    chartSection.style.display = 'flex';
    chartSection.classList.add('active');
    document.getElementById('stockChart').style.display = 'block';
    document.getElementById('stockLineChart').style.display = 'block';

    stockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Open', 'High', 'Low', 'Current', 'Prev Close'],
            datasets: [{
                label: `${symbol} Price (${currency})`,
                data: [data.open, data.high, data.low, data.currentPrice, data.prevClose],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: false, title: { display: true, text: `Price (${currency})` } }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: `${symbol} Daily Price Snapshot` }
            },
            animation: { duration: 500, easing: 'easeInOutQuad' }
        }
    });

    lastRealTimeData = { ...data };
}

// Create line chart
function createStockLineChart(symbol, initialPrice, currency = 'USD') {
    const ctx = document.getElementById('stockLineChart').getContext('2d');
    const chartSection = document.querySelector('.chart-section');

    if (stockLineChart) stockLineChart.destroy();

    chartSection.style.display = 'flex';
    chartSection.classList.add('active');
    document.getElementById('stockLineChart').style.display = 'block';

    priceHistory = [initialPrice];
    timeHistory = [new Date().toLocaleTimeString()];

    stockLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeHistory,
            datasets: [{
                label: `${symbol} Real-Time Price (${currency})`,
                data: priceHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1,
                pointRadius: 2
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { beginAtZero: false, title: { display: true, text: `Price (${currency})` } }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: `${symbol} Real-Time Price Trend` }
            },
            animation: { duration: 500, easing: 'easeInOutQuad' }
        }
    });
}

// Restore real-time charts
function restoreRealTimeCharts(symbol, market, currency) {
    const chatBox = document.getElementById('chatBox');
    if (!lastRealTimeData) {
        chatBox.innerHTML += `<p class="ai-message">AI: No real-time data available for ${symbol}. Please fetch stock details first.</p>`;
        return;
    }

    document.getElementById('stockChart').style.display = 'block';
    document.getElementById('stockLineChart').style.display = 'block';

    createStockChart(symbol, lastRealTimeData, currency);
    createStockLineChart(symbol, parseFloat(lastRealTimeData.currentPrice), currency);

    chatBox.innerHTML += `<p class="ai-message">AI: Restored real-time charts for ${symbol}.</p>`;
}

// Mock historical data for fallback
function mockHistoricalData(symbol, currentPrice) {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const price = currentPrice * (1 + (Math.random() - 0.5) * 0.1); // ±5% variation
        data.push({
            date: date.toLocaleDateString(),
            price: parseFloat(price.toFixed(2))
        });
    }
    console.log(`Using mock historical data for ${symbol}`);
    return data;
}

// Fetch Finnhub historical data
async function fetchFinnhubHistoricalData(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60)}&to=${Math.floor(Date.now() / 1000)}&token=${FINNHUB_API_KEY}`);
        if (!response.ok) throw new Error(`Finnhub error: ${response.status}`);
        const data = await response.json();
        if (!data.c || data.c.length === 0) throw new Error('No candle data found');
        return data.c.map((price, i) => ({
            date: new Date(data.t[i] * 1000).toLocaleDateString(),
            price: parseFloat(price)
        }));
    } catch (error) {
        console.error(`Finnhub historical data error for ${symbol}:`, error);
        return null;
    }
}

// Create 30-day historical chart
async function createThirtyDayChart(symbol, market, currency) {
    toggleLoading(true);
    const chatBox = document.getElementById('chatBox');
    let historicalData = [];

    // Check cache
    if (historicalCache.has(symbol)) {
        const cachedData = historicalCache.get(symbol);
        if (Date.now() - cachedData.timestamp < 2 * 60 * 60 * 1000) {
            historicalData = cachedData.data;
            console.log(`Using cached historical data for ${symbol}`);
        }
    }

    if (!historicalData.length) {
        if (market === 'US') {
            try {
                const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
                if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
                const data = await response.json();
                const daily = data['Time Series (Daily)'];
                if (!daily) throw new Error('No daily data found');
                const dates = Object.keys(daily).slice(0, 30).reverse();
                historicalData = dates.map(date => ({
                    date,
                    price: parseFloat(daily[date]['4. close'])
                }));
            } catch (error) {
                console.error(`Alpha Vantage 30-day error for ${symbol}:`, error);
                historicalData = await fetchFinnhubHistoricalData(symbol);
                if (!historicalData) {
                    console.log(`All APIs failed for ${symbol}, using mock data`);
                    historicalData = mockHistoricalData(symbol, lastRealTimeData?.currentPrice || 100);
                }
            }
        } else {
            try {
                const cleanSymbol = normalizeSymbol(symbol, 'IN', 'marketstack');
                const response = await fetch(`http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${cleanSymbol}&limit=30`);
                if (!response.ok) throw new Error(`MarketStack error: ${response.status}`);
                const data = await response.json();
                if (!data.data || data.data.length === 0) throw new Error('No data found');
                historicalData = data.data.reverse().map(item => ({
                    date: item.date.split('T')[0],
                    price: parseFloat(item.close)
                }));
            } catch (error) {
                console.error(`MarketStack 30-day error for ${symbol}:`, error);
                try {
                    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${normalizeSymbol(symbol, 'IN', 'alpha')}&apikey=${ALPHA_VANTAGE_API_KEY}`);
                    if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
                    const data = await response.json();
                    const daily = data['Time Series (Daily)'];
                    if (!daily) throw new Error('No daily data found');
                    const dates = Object.keys(daily).slice(0, 30).reverse();
                    historicalData = dates.map(date => ({
                        date,
                        price: parseFloat(daily[date]['4. close'])
                    }));
                } catch (alphaError) {
                    console.error(`Alpha Vantage 30-day error for ${symbol}:`, alphaError);
                    console.log(`All APIs failed for ${symbol}, using mock data`);
                    historicalData = mockHistoricalData(symbol, lastRealTimeData?.currentPrice || 4200);
                }
            }
        }
        historicalCache.set(symbol, { data: historicalData, timestamp: Date.now() });
    }

    const ctx = document.getElementById('stockChart').getContext('2d');
    const chartSection = document.querySelector('.chart-section');

    if (stockChart) stockChart.destroy();
    if (stockLineChart) stockLineChart.destroy();

    chartSection.style.display = 'flex';
    chartSection.classList.add('active');
    document.getElementById('stockChart').style.display = 'block';
    document.getElementById('stockLineChart').style.display = 'none';

    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.map(d => d.date),
            datasets: [{
                label: `${symbol} 30-Day Price (${currency})`,
                data: historicalData.map(d => d.price),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1,
                pointRadius: 2
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { beginAtZero: false, title: { display: true, text: `Price (${currency})` } }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: `${symbol} 30-Day Price History` }
            },
            animation: { duration: 500, easing: 'easeInOutQuad' }
        }
    });

    chatBox.innerHTML += `<p class="ai-message">AI: Displaying 30-day price history for ${symbol}.</p>`;
    toggleLoading(false);
}

// Generate buy/sell suggestion
async function generateBuySellSuggestion(symbol, market, currency) {
    toggleLoading(true);
    const chatBox = document.getElementById('chatBox');
    let historicalData = [];

    if (historicalCache.has(symbol)) {
        const cachedData = historicalCache.get(symbol);
        if (Date.now() - cachedData.timestamp < 2 * 60 * 60 * 1000) {
            historicalData = cachedData.data.map(d => d.price);
            console.log(`Using cached historical data for ${symbol} in buy/sell suggestion`);
        }
    }

    if (!historicalData.length) {
        if (market === 'US') {
            try {
                const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
                if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
                const data = await response.json();
                const daily = data['Time Series (Daily)'];
                if (!daily) throw new Error('No daily data found');
                const dates = Object.keys(daily).slice(0, 30);
                historicalData = dates.map(date => parseFloat(daily[date]['4. close']));
            } catch (error) {
                console.error(`Alpha Vantage suggestion error for ${symbol}:`, error);
                const finnhubData = await fetchFinnhubHistoricalData(symbol);
                if (finnhubData) {
                    historicalData = finnhubData.map(d => d.price);
                } else {
                    console.log(`All APIs failed for ${symbol}, using mock data`);
                    historicalData = mockHistoricalData(symbol, lastRealTimeData?.currentPrice || 100).map(d => d.price);
                }
            }
        } else {
            try {
                const cleanSymbol = normalizeSymbol(symbol, 'IN', 'marketstack');
                const response = await fetch(`http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${cleanSymbol}&limit=30`);
                if (!response.ok) throw new Error(`MarketStack error: ${response.status}`);
                const data = await response.json();
                if (!data.data || data.data.length === 0) throw new Error('No data found');
                historicalData = data.data.map(item => parseFloat(item.close));
            } catch (error) {
                console.error(`MarketStack suggestion error for ${symbol}:`, error);
                try {
                    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${normalizeSymbol(symbol, 'IN', 'alpha')}&apikey=${ALPHA_VANTAGE_API_KEY}`);
                    if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
                    const data = await response.json();
                    const daily = data['Time Series (Daily)'];
                    if (!daily) throw new Error('No daily data found');
                    const dates = Object.keys(daily).slice(0, 30);
                    historicalData = dates.map(date => parseFloat(daily[date]['4. close']));
                } catch (alphaError) {
                    console.error(`Alpha Vantage suggestion error for ${symbol}:`, alphaError);
                    console.log(`All APIs failed for ${symbol}, using mock data`);
                    historicalData = mockHistoricalData(symbol, lastRealTimeData?.currentPrice || 4200).map(d => d.price);
                }
            }
        }
        historicalCache.set(symbol, { 
            data: historicalData.map((price, i) => ({ 
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(), 
                price 
            })), 
            timestamp: Date.now() 
        });
    }

    const currentPrice = historicalData[0];
    const movingAverage = historicalData.reduce((sum, price) => sum + price, 0) / historicalData.length;
    const recentTrend = historicalData.slice(0, 5);
    const isTrendingUp = recentTrend.every((price, i) => i === 0 || price >= recentTrend[i - 1]);

    const suggestion = (currentPrice < movingAverage * 0.95 && isTrendingUp)
        ? `It is the right time to buy`
        : `It is the right time to sell`;

    chatBox.innerHTML += `<p class="ai-message">AI: ${suggestion}</p>`;
    toggleLoading(false);
}

// Fetch Alpha Vantage data
async function fetchAlphaVantageData(symbol, retries = 7) {
    for (let i = 0; i < retries; i++) {
        try {
            let response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
            if (response.status === 429) {
                console.log(`Alpha Vantage rate limit for ${symbol}, retrying after 15s...`);
                await new Promise(resolve => setTimeout(resolve, 15000));
                continue;
            }
            if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
            let data = await response.json();
            let quote = data['Global Quote'];
            if (quote && quote['05. price']) {
                console.log(`Alpha Vantage GLOBAL_QUOTE success for ${symbol}`);
                return {
                    currentPrice: parseFloat(quote['05. price']).toFixed(2),
                    open: parseFloat(quote['02. open']).toFixed(2),
                    high: parseFloat(quote['03. high']).toFixed(2),
                    low: parseFloat(quote['04. low']).toFixed(2),
                    prevClose: parseFloat(quote['08. previous close']).toFixed(2),
                    change: quote['10. change percent'] || 'N/A',
                    volume: quote['06. volume'],
                    marketCap: 'N/A',
                    yearHigh: 'N/A',
                    yearLow: 'N/A',
                    peRatio: 'N/A',
                    dividendYield: 'N/A'
                };
            }
            console.log(`Alpha Vantage GLOBAL_QUOTE failed for ${symbol}, trying TIME_SERIES_DAILY`);
            response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
            if (response.status === 429) {
                console.log(`Alpha Vantage rate limit for ${symbol}, retrying after 15s...`);
                await new Promise(resolve => setTimeout(resolve, 15000));
                continue;
            }
            if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
            data = await response.json();
            const daily = data['Time Series (Daily)'];
            if (!daily) return null;
            const latestDate = Object.keys(daily)[0];
            const latestData = daily[latestDate];
            console.log(`Alpha Vantage TIME_SERIES_DAILY success for ${symbol}`);
            return {
                currentPrice: parseFloat(latestData['4. close']).toFixed(2),
                open: parseFloat(latestData['1. open']).toFixed(2),
                high: parseFloat(latestData['2. high']).toFixed(2),
                low: parseFloat(latestData['3. low']).toFixed(2),
                prevClose: parseFloat(daily[Object.keys(daily)[1]]['4. close']).toFixed(2),
                change: ((parseFloat(latestData['4. close']) - parseFloat(daily[Object.keys(daily)[1]]['4. close'])) / parseFloat(daily[Object.keys(daily)[1]]['4. close']) * 100).toFixed(2) + '%',
                volume: latestData['5. volume'],
                marketCap: 'N/A',
                yearHigh: 'N/A',
                yearLow: 'N/A',
                peRatio: 'N/A',
                dividendYield: 'N/A'
            };
        } catch (error) {
            console.error(`Alpha Vantage error for ${symbol}:`, error.message);
            if (i === retries - 1) return null;
        }
    }
    return null;
}

// Fetch Finnhub data
async function fetchFinnhubData(symbol) {
    try {
        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        if (!quoteResponse.ok) throw new Error(`Finnhub API error: ${quoteResponse.status}`);
        const quote = await quoteResponse.json();
        if (!quote.c || quote.c <= 0) {
            console.log(`Finnhub returned invalid data for ${symbol}`);
            return null;
        }

        const profileResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
        const profile = await profileResponse.json();

        const metricsResponse = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`);
        const metrics = await metricsResponse.json();

        console.log(`Finnhub success for ${symbol}`);
        return {
            currentPrice: parseFloat(quote.c).toFixed(2),
            open: parseFloat(quote.o).toFixed(2),
            high: parseFloat(quote.h).toFixed(2),
            low: parseFloat(quote.l).toFixed(2),
            prevClose: parseFloat(quote.pc).toFixed(2),
            change: quote.pc ? ((quote.c - quote.pc) / quote.pc * 100).toFixed(2) + '%' : 'N/A',
            marketCap: profile.marketCapitalization ? (profile.marketCapitalization / 1e6).toFixed(2) : 'N/A',
            yearHigh: metrics['52WeekHigh']?.toFixed(2) || 'N/A',
            yearLow: metrics['52WeekLow']?.toFixed(2) || 'N/A',
            peRatio: metrics['peTTM']?.toFixed(2) || 'N/A',
            dividendYield: metrics['dividendYieldTTM']?.toFixed(2) || 'N/A'
        };
    } catch (error) {
        console.error(`Finnhub error for ${symbol}:`, error);
        return null;
    }
}

// Fetch MarketStack data
async function fetchMarketStackData(symbol) {
    try {
        const cleanSymbol = normalizeSymbol(symbol, 'IN', 'marketstack');
        const response = await fetch(`http://api.marketstack.com/v1/eod?access_key=${MARKETSTACK_API_KEY}&symbols=${cleanSymbol}`);
        if (!response.ok) throw new Error(`MarketStack API error: ${response.status}`);
        const data = await response.json();
        if (!data.data || data.data.length === 0) {
            console.log(`MarketStack returned no data for ${symbol}`);
            return null;
        }
        const latest = data.data[0];
        console.log(`MarketStack success for ${symbol}`);
        return {
            currentPrice: parseFloat(latest.close).toFixed(2),
            open: parseFloat(latest.open).toFixed(2),
            high: parseFloat(latest.high).toFixed(2),
            low: parseFloat(latest.low).toFixed(2),
            prevClose: parseFloat(data.data[1]?.close || latest.close).toFixed(2),
            change: data.data[1]?.close ? ((latest.close - data.data[1].close) / data.data[1].close * 100).toFixed(2) + '%' : 'N/A',
            marketCap: 'N/A',
            yearHigh: 'N/A',
            yearLow: 'N/A',
            peRatio: 'N/A',
            dividendYield: 'N/A'
        };
    } catch (error) {
        console.error(`MarketStack error for ${symbol}:`, error.message);
        return null;
    }
}

// Display stock data
function displayStockData(symbol, data, currency, market = 'US') {
    const chatBox = document.getElementById('chatBox');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const exchange = market === 'IN' ? 'NSE/BSE' : 'NYSE/NASDAQ';

    chatBox.innerHTML += `
        <p class="ai-message">AI: Stock Details for ${symbol} (as of ${today}):</p>
        <table class="stock-table">
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Current Price</td><td>${currency} ${data.currentPrice}</td></tr>
            <tr><td>Open</td><td>${currency} ${data.open}</td></tr>
            <tr><td>High</td><td>${currency} ${data.high}</td></tr>
            <tr><td>Low</td><td>${currency} ${data.low}</td></tr>
            <tr><td>Previous Close</td><td>${currency} ${data.prevClose}</td></tr>
            <tr><td>Change</td><td>${data.change}</td></tr>
            <tr><td>Exchange</td><td>${exchange}</td></tr>
            <tr><td>Market Cap</td><td>${currency} ${data.marketCap} ${market === 'IN' ? 'Crores' : 'Trillion'}</td></tr>
            <tr><td>52-Week High</td><td>${currency} ${data.yearHigh}</td></tr>
            <tr><td>52-Week Low</td><td>${currency} ${data.yearLow}</td></tr>
            <tr><td>P/E Ratio</td><td>${data.peRatio}</td></tr>
            <tr><td>Dividend Yield</td><td>${data.dividendYield}%</td></tr>
            <tr><td>Note</td><td>Verify real-time data as prices can fluctuate rapidly.</td></tr>
        </table>
    `;

    createStockChart(symbol, data, currency);
    createStockLineChart(symbol, parseFloat(data.currentPrice), currency);

    currentSymbol = symbol;
    currentMarket = market;
    currentCurrency = currency;
    document.getElementById('thirtyDayChartBtn').disabled = false;
    document.getElementById('realTimeChartsBtn').disabled = false;
    document.getElementById('buySellSuggestionBtn').disabled = false;

    if (market === 'US') {
        socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
        socket.onopen = () => {
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'trade' && data.data) {
                const price = data.data[0].p.toFixed(2);
                console.log(`WebSocket update for ${symbol}: ${price}`);
                if (stockChart && stockChart.data.datasets[0].data.length === 5) {
                    stockChart.data.datasets[0].data[3] = parseFloat(price);
                    stockChart.update();
                    lastRealTimeData.currentPrice = parseFloat(price);
                }
                if (stockLineChart) {
                    priceHistory.push(parseFloat(price));
                    timeHistory.push(new Date().toLocaleTimeString());
                    if (priceHistory.length > 20) {
                        priceHistory.shift();
                        timeHistory.shift();
                    }
                    stockLineChart.data.labels = timeHistory;
                    stockLineChart.data.datasets[0].data = priceHistory;
                    stockLineChart.update();
                }
            }
        };
        socket.onerror = () => {
            console.error(`WebSocket error for ${symbol}`);
            setInterval(async () => {
                const quote = await fetchFinnhubData(symbol);
                if (quote) {
                    console.log(`Polling update for ${symbol}: ${quote.currentPrice}`);
                    if (stockChart && stockChart.data.datasets[0].data.length === 5) {
                        stockChart.data.datasets[0].data[3] = parseFloat(quote.currentPrice);
                        stockChart.update();
                        lastRealTimeData.currentPrice = parseFloat(quote.currentPrice);
                    }
                    priceHistory.push(parseFloat(quote.currentPrice));
                    timeHistory.push(new Date().toLocaleTimeString());
                    if (priceHistory.length > 20) {
                        priceHistory.shift();
                        timeHistory.shift();
                    }
                    stockLineChart.data.labels = timeHistory;
                    stockLineChart.data.datasets[0].data = priceHistory;
                    stockLineChart.update();
                }
            }, 30000);
        };
    } else {
        setInterval(async () => {
            const data = await fetchMarketStackData(symbol) || 
                         await fetchAlphaVantageData(normalizeSymbol(symbol, 'IN', 'alpha'));
            if (data) {
                console.log(`Polling update for ${symbol}: ${data.currentPrice}`);
                if (stockChart && stockChart.data.datasets[0].data.length === 5) {
                    stockChart.data.datasets[0].data[3] = parseFloat(data.currentPrice);
                    stockChart.update();
                    lastRealTimeData.currentPrice = parseFloat(data.currentPrice);
                }
                priceHistory.push(parseFloat(data.currentPrice));
                timeHistory.push(new Date().toLocaleTimeString());
                if (priceHistory.length > 20) {
                    priceHistory.shift();
                    timeHistory.shift();
                }
                stockLineChart.data.labels = timeHistory;
                stockLineChart.data.datasets[0].data = priceHistory;
                stockLineChart.update();
            } else {
                console.log(`Polling failed for ${symbol}`);
            }
        }, 30000);
    }
}

// Main function to fetch stock details
async function fetchStockDetails(symbol) {
    symbol = symbol.toUpperCase();
    const chatBox = document.getElementById('chatBox');
    const chartSection = document.querySelector('.chart-section');
    const chatSection = document.querySelector('.chat-section');
    resetUI();
    toggleLoading(true);
    chatBox.innerHTML += `<p class="ai-message">AI: Fetching stock details for ${symbol}...</p>`;

    if (trustedStockData[symbol]) {
        console.log(`Using trusted data for ${symbol}`);
        const data = trustedStockData[symbol];
        stockCache.set(symbol, { data, currency: data.currency, market: data.market, timestamp: Date.now() });
        displayStockData(symbol, data, data.currency, data.market);
        toggleLoading(false);
        return;
    }

    if (stockCache.has(symbol)) {
        const cachedData = stockCache.get(symbol);
        if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
            console.log(`Using cached data for ${symbol}`);
            displayStockData(symbol, cachedData.data, cachedData.currency, cachedData.market);
            toggleLoading(false);
            return;
        }
    }

    const market = detectMarket(symbol);
    let normalizedSymbol = normalizeSymbol(symbol, market);
    console.log(`Detected market for ${symbol}: ${market}, normalized: ${normalizedSymbol}`);

    if (!(await validateSymbol(symbol))) {
        const altFormats = [
            symbol.replace('.NS', '.BO'),
            symbol.replace('.BO', '.NS'),
            `NSE:${symbol.replace('.NS', '').replace('.BO', '').replace('NSE:', '')}`,
            symbol.replace('.NS', '').replace('.BO', '').replace('NSE:', '')
        ];
        for (const altSymbol of altFormats) {
            if (await validateSymbol(altSymbol)) {
                console.log(`Using alternative symbol ${altSymbol}`);
                await fetchStockDetails(altSymbol);
                toggleLoading(false);
                return;
            }
        }
        chatBox.innerHTML += `<p class="ai-message">AI: Invalid symbol '${symbol}'. Try formats like TCS.NS, NSE:TCS for Indian stocks, or AAPL, MSFT, GOOGL for US stocks.</p>`;
        toggleLoading(false);
        return;
    }

    if (market === 'IN') {
        let data = await fetchMarketStackData(symbol);
        if (data) {
            console.log(`MarketStack data retrieved for ${symbol}`);
            stockCache.set(symbol, { data, currency: 'INR', market, timestamp: Date.now() });
            displayStockData(symbol, data, 'INR', market);
            toggleLoading(false);
            return;
        }
        console.log(`MarketStack failed for ${symbol}, trying Alpha Vantage`);
    }

    let data = await fetchAlphaVantageData(normalizeSymbol(symbol, market, 'alpha'));
    if (data) {
        console.log(`Alpha Vantage data retrieved for ${normalizedSymbol}`);
        stockCache.set(symbol, { data, currency: market === 'IN' ? 'INR' : 'USD', market, timestamp: Date.now() });
        displayStockData(symbol, data, market === 'IN' ? 'INR' : 'USD', market);
        toggleLoading(false);
        return;
    }
    console.log(`Alpha Vantage failed for ${normalizedSymbol}, trying Finnhub`);

    if (market === 'US') {
        data = await fetchFinnhubData(symbol);
        if (data) {
            console.log(`Finnhub data retrieved for ${symbol}`);
            stockCache.set(symbol, { data, currency: 'USD', market, timestamp: Date.now() });
            displayStockData(symbol, data, 'USD', market);
            toggleLoading(false);
            return;
        }
        console.log(`Finnhub failed for ${symbol}`);
    }

    chatBox.innerHTML += `<p class="ai-message">AI: No data found for ${symbol}. Try formats like TCS.NS, NSE:TCS for Indian stocks, or AAPL, MSFT, GOOGL for US stocks. Ensure API keys are active (Alpha Vantage, MarketStack, Finnhub). Wait 1 minute if rate-limited.</p>`;
    toggleLoading(false);
}

// Send message function
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (!message) return;

    const chatBox = document.getElementById('chatBox');
    const chartSection = document.querySelector('.chart-section');
    const chatSection = document.querySelector('.chat-section');
    chatBox.innerHTML += `<p class="user-message">You: ${message}</p>`;
    chatInput.value = '';

    chatSection.classList.remove('full-width');
    resetUI();

    const lowerMessage = message.toLowerCase();
    if ((lowerMessage.includes('who') || lowerMessage.includes('whose')) &&
        (lowerMessage.includes('developer') || lowerMessage.includes('made') || lowerMessage.includes('make') || lowerMessage.includes('created') || lowerMessage.includes('built'))) {
        chatBox.innerHTML += `<p class="ai-message">AI: I was created by Gautam, Mayank, and Pankaj.</p>`;
        return;
    }

    const stockRegex = /\b[A-Z0-9]+(?::[A-Z0-9]+|\.[A-Z]{1,3})?\b/;
    const stockMatch = message.match(stockRegex);
    const isStockQuery = stockMatch && (lowerMessage.includes('stock') || lowerMessage.includes('price') || lowerMessage.includes('details') || lowerMessage.includes('about'));

    if (stockMatch && isStockQuery) {
        const symbol = stockMatch[0].toUpperCase();
        chatSection.classList.add('full-width');
        chartSection.style.display = 'flex';
        await fetchStockDetails(symbol);
    } else if (stockMatch && !isStockQuery) {
        chatBox.innerHTML += `<p class="ai-message">AI: Did you mean to ask about the stock '${stockMatch[0]}'? Try saying '${stockMatch[0]} stock details'!</p>`;
    } else {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: message }] }]
                    })
                }
            );

            if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            chatBox.innerHTML += `<p class="ai-message">AI: ${aiResponse}</p>`;
        } catch (error) {
            console.error('Gemini API error:', error);
            chatBox.innerHTML += `<p class="ai-message">AI: Oops! I couldn’t process that. Try asking about a stock (e.g., 'TCS.NS stock details', 'AAPL stock details') or something else!</p>`;
        }
    }
}

// Event listeners for buttons
document.getElementById('thirtyDayChartBtn').addEventListener('click', () => {
    if (currentSymbol) {
        createThirtyDayChart(currentSymbol, currentMarket, currentCurrency);
    }
});

document.getElementById('realTimeChartsBtn').addEventListener('click', () => {
    if (currentSymbol) {
        restoreRealTimeCharts(currentSymbol, currentMarket, currentCurrency);
    }
});

document.getElementById('buySellSuggestionBtn').addEventListener('click', () => {
    if (currentSymbol) {
        generateBuySellSuggestion(currentSymbol, currentMarket, currentCurrency);
    }
});

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});