import express from "express";
import { exec } from "child_process";

const app = express();

app.get("/", (req, res) => {
  res.send("✅ Bot is alive");
});

app.get("/run", (req, res) => {
  exec("node crypto_price_bot.js", (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      res.status(500).send("❌ Script error");
    } else {
      res.send("✅ Script executed successfully");
    }
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
