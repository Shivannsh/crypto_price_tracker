import 'dotenv/config';
import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const CMC_API_KEY = process.env.CMC_API_KEY;

// ✅ Dex pairs you want to fetch
const DEX_URLS = {
  PNP: "https://api.dexscreener.com/latest/dex/pairs/solana/cbiwpjnrc21uabjqk9cxrjzqxgdp4jhtnfxgkqteekfq",
  TOKEN2: "https://api.dexscreener.com/latest/dex/pairs/solana/5hK4WSUBZxqzvgn2q6JQhhqb7GMzWiLWRkngoBYtvDhg"
};

// ✅ CMC endpoint
const CMC_URL =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH,SOL,LTC,LINK,ZEN,VFY&convert=USD";

// ✅ CMC Prices
async function getCMCPrices() {
  try {
    const res = await fetch(CMC_URL, {
      headers: { "X-CMC_PRO_API_KEY": CMC_API_KEY },
    });

    if (!res.ok) throw new Error("CMC API failed");

    const json = await res.json();
    return json.data;

  } catch (err) {
    console.error("⚠️ CMC Error:", err.message);
    return null; // return null to prevent crash
  }
}

// ✅ Dexscreener prices (SAFE, NON-FATAL)
async function getDexPrices() {
  const results = {};

  for (const [key, url] of Object.entries(DEX_URLS)) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Dexscreener API error");

      const json = await res.json();
      const price =
        json?.pairs?.[0]?.priceUsd ||
        json?.pair?.priceUsd ||
        null;

      results[key] = price ? parseFloat(price) : null;

    } catch (err) {
      console.error(`⚠️ Dexscreener failed for ${key}:`, err.message);
      results[key] = null; // ✅ SAFE fallback
    }
  }

  return results;
}

// ✅ Telegram sender
async function sendTelegramMessage(text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "Markdown",
    }),
  });
}

// ✅ Main Bot Logic
export async function main() {
  try {
    console.log("🔄 Fetching prices...");

    const [cmcData, dexPrices] = await Promise.all([
      getCMCPrices(),
      getDexPrices(),
    ]);

    // ✅ Build Telegram message
    const message = `
🚀 *Crypto Price Update* 🚀

🟢 PNP: \`$${dexPrices.PNP ? dexPrices.PNP.toFixed(6) : "N/A"}\`
⚪ ZEN: \`$${cmcData?.ZEN?.quote?.USD?.price.toFixed(2) ?? "N/A"}\`
🟣 VFY: \`$${cmcData?.VFY?.quote?.USD?.price.toFixed(6) ?? "N/A"}\`
🟠 ETH: \`$${cmcData?.ETH?.quote?.USD?.price.toFixed(2) ?? "N/A"}\`
🔵 SOL: \`$${cmcData?.SOL?.quote?.USD?.price.toFixed(2) ?? "N/A"}\`
🟣 Polytale: \`$${dexPrices.TOKEN2 ? dexPrices.TOKEN2.toFixed(6) : "N/A"}\`
🟠 BTC: \`$${cmcData?.BTC?.quote?.USD?.price.toFixed(2) ?? "N/A"}\`
🟤 LTC: \`$${cmcData?.LTC?.quote?.USD?.price.toFixed(2) ?? "N/A"}\`
🟡 LINK: \`$${cmcData?.LINK?.quote?.USD?.price.toFixed(2) ?? "N/A"}\`

⏱ Updated via *CMC + Dexscreener*
    `;

    await sendTelegramMessage(message);
    console.log("✅ Message sent!");

  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  }
}

// ✅ Run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
