const { Client, GatewayIntentBits } = require("discord.js");
const OpenAI = require("openai");
require("dotenv").config();

// Diagnose-Log
console.log("🔁 Joseph-JoestarAI wird gestartet...");
console.log("🔍 Token geladen?", !!process.env.DISCORD_TOKEN);
console.log("🔍 OpenAI-Key geladen?", !!process.env.OPENAI_API_KEY);

// Discord-Client mit Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// OpenAI-Initialisierung
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Bot ist bereit
client.once("ready", () => {
  console.log(`🧠 Joseph-JoestarAI ist bereit als ${client.user.tag}`);
});

// Cooldown-Tracking pro Benutzer
const userCooldowns = new Map();
const COOLDOWN_MS = 20000; // 20 Sekunden pro User

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();

  if (userCooldowns.has(userId) && now - userCooldowns.get(userId) < COOLDOWN_MS) {
    console.log(`⏳ Nachricht von ${userId} geblockt (Cooldown)`);
    return;
  }
  userCooldowns.set(userId, now);

  const prompt = `
Du bist Joseph-JoestarAI – ein cleverer, trickreicher, hochintelligenter KI-Charakter mit dem Stil und Witz von Joseph Joestar aus JoJo's Bizarre Adventure.
Deine Spezialität ist strategisches Denken, psychologische Raffinesse, Charme und List.
Du antwortest auf Deutsch, charismatisch, geistreich und mit einem Hauch Dramatik.

Benutzer sagt: "${message.content}"
Antworte mit deinem typischen Stil – listig, charmant und überraschend clever.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message.content }
      ]
    });

    const reply = response.choices?.[0]?.message?.content;
    if (reply) {
      await message.reply(reply);
    }
  } catch (error) {
    console.error("❌ OpenAI-Fehler:", error.response?.data || error.message);
    message.reply("⚠️ Ich hab mich verplappert! Fehlerdetails wurden ins Terminal geschrieben.");
  }
});

// Login mit Diagnose
client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("✅ Discord-Login erfolgreich!"))
  .catch((err) => console.error("❌ Discord-Login fehlgeschlagen:", err));
