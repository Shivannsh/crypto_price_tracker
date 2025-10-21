import express from "express";
import { main as runBot } from "./crypto_price_bot.js";

const app = express();

app.get("/", (req, res) => res.send("✅ Bot is alive"));

app.get("/run", async (req, res) => {
  try {
    await runBot();
    res.send("✅ Script executed successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Script error");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
