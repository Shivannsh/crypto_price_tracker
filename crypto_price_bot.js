import fetch from "node-fetch";
import 'dotenv/config';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin,litecoin,chainlink,pnp-exchange,zkverify,zencash&vs_currencies=usd";


;
async function getPrices() {
  const res = await fetch(COINGECKO_URL);
  if (!res.ok) throw new Error("Failed to fetch CoinGecko API");
  return res.json();
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: CHAT_ID,
    text: text,
    parse_mode: "Markdown",
  };
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function main() {
  try {
    const data = await getPrices();

    const message = `
🚀 *Crypto Price Update* 🚀

🟠 PNP: \`$${data["pnp-exchange"]?.usd ?? "N/A"}\`
🟢 ZEN: \`$${data["zencash"]?.usd ?? "N/A"}\`
🟤 VFY: \`$${data["zkverify"]?.usd ?? "N/A"}\`
🟣 ETH: \`$${data["ethereum"]?.usd ?? "N/A"}\`
🔵 SOL: \`$${data["solana"]?.usd ?? "N/A"}\`
🟡 BTC: \`$${data["bitcoin"]?.usd ?? "N/A"}\`
🟤 LTC: \`$${data["litecoin"]?.usd ?? "N/A"}\`
🟢 LINK: \`$${data["chainlink"]?.usd ?? "N/A"}\`

⏱ Updated via CoinGecko API
    `;

    await sendTelegramMessage(message);
    console.log("✅ Sent update to Telegram");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// If you want to test locally
if (process.argv[1].includes("crypto_price_bot.js")) {
  main();
}
