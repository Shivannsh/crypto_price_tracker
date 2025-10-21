import 'dotenv/config';
import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const CMC_API_KEY = process.env.CMC_API_KEY;


// CoinMarketCap URL
const CMC_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,SOL,LTC,LINK,ZEN,VFY&convert=USD';

// Dexscreener URL
const DEX_URL = "https://api.dexscreener.com/latest/dex/pairs/solana/cbiwpjnrc21uabjqk9cxrjzqxgdp4jhtnfxgkqteekfq";

// Fetch CMC prices
async function getCMCPrices() {
    const res = await fetch(CMC_URL, {
        headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY }
    });
    if (!res.ok) throw new Error('Failed to fetch CoinMarketCap API');
    const json = await res.json();
    return json.data;
}

// Fetch PNP price from Dexscreener
async function getPNPPrice() {
    const res = await fetch(DEX_URL);
    if (!res.ok) throw new Error('Failed to fetch Dexscreener API');
    const json = await res.json();
    const price = json?.pairs?.[0]?.priceUsd || json?.pair?.priceUsd;
    return price ? parseFloat(price) : null;
}

// Send message to Telegram
async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    });
}

// Main function
export async function main() {
    try {
        console.log('🔄 Fetching prices...');
        const [cmcData, pnpPrice] = await Promise.all([getCMCPrices(), getPNPPrice()]);

        const message = `
🚀 *Crypto Price Update* 🚀

🟢 PNP: \`$${pnpPrice?.toFixed(6) ?? "N/A"}\`
⚪ ZEN: \`$${cmcData.ZEN.quote.USD.price.toFixed(2)}\`
🟣 VFY: \`$${cmcData.VFY.quote.USD.price.toFixed(6)}\`
🟣 ETH: \`$${cmcData.ETH.quote.USD.price.toFixed(2)}\`
🔵 SOL: \`$${cmcData.SOL.quote.USD.price.toFixed(2)}\`
🟠 BTC: \`$${cmcData.BTC.quote.USD.price.toFixed(2)}\`
🟤 LTC: \`$${cmcData.LTC.quote.USD.price.toFixed(2)}\`
🟡 LINK: \`$${cmcData.LINK.quote.USD.price.toFixed(2)}\`


⏱ Updated via *CMC + Dexscreener*
        `;

        await sendTelegramMessage(message);
        console.log('✅ Message sent!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

// Export main function for use in server.js
