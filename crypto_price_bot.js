import fetch from "node-fetch";

const TELEGRAM_BOT_TOKEN = "7612917653:AAHbq3Yjc5YKoUEVkwSeoYalOCAEgbAN6qE"; // Replace with your token
const CHAT_ID = "-1003124878095";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin,litecoin,chainlink,pnp-exchange,zkverify,zencash&vs_currencies=usd";

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

async function main() {
  try {
    const data = await getPrices();

    const message = `
🚀 *Crypto Price Update* 🚀

🟠 PNP: \`$${data["pnp-exchange"].usd}\`
🟢 ZEN: \`$${data["zencash"].usd}\`
🟤 VFY: \`$${data["zkverify"].usd}\`
🟣 ETH: \`$${data["ethereum"].usd}\`
🔵 SOL: \`$${data["solana"].usd}\`
🟡 BTC: \`$${data["bitcoin"].usd}\`
🟤 LTC: \`$${data["litecoin"].usd}\`
🟢 LINK: \`$${data["chainlink"].usd}\`


⏱ Updated via CoinGecko API
    `;

    await sendTelegramMessage(message);
    console.log("✅ Sent update to Telegram");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

main();
