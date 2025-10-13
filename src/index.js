const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { loadEconomy, saveEconomy } = require("./utils/economy");

require("dotenv").config();

const token = process.env.DISCORD_TOKEN;

const fs = require("fs");
const path = require("path");

//Configuración de Gemini
const geminiAPIKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiAPIKey);
const randomPrompts = [
  "¿Cuál es la frase del día para los Berserkers?",
  "Contá algo curioso sobre el universo.",
  "Danos un consejo para mejorar en Valorant.",
  "Inventá una historia corta sobre Nova.",
  "¿Qué opinás de los reales?",
  "Explicá algo divertido sobre la computación.",
  "¿Qué noticia sorprendente podrías contarnos hoy?",
];

const cooldowns = {}; // { userId: timestamp }

const COOLDOWN_TIME = 30 * 1000; // 30 segundos

//Slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "cmds");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./cmds/${file}`);

  client.commands.set(command.data.name, command);
}

// Cargar economía
let economy = loadEconomy();

client.once("ready", () => {
  console.log(`✅ ESTOY IN ${client.user.tag}`);

  // Esperar 10 segundos antes del primer mensaje
  setTimeout(() => sendRandomAsk(), 10000);

  // Ejecutar cada 1 hora (3600000 ms)
  setInterval(sendRandomAsk, 3600000);

  async function sendRandomAsk() {
    try {
      // Buscar canal general
      const guild = client.guilds.cache.first();
      if (!guild) return console.error("No se encontró el servidor.");
      const channel = guild.channels.cache.find(
        (c) => c.name === "『💬』general"
      );
      if (!channel) return console.error("No se encontró el canal general.");

      // Elegir prompt aleatorio
      const prompt =
        randomPrompts[Math.floor(Math.random() * randomPrompts.length)];

      // Generar respuesta usando el mismo sistema que en ask.js
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction:
          "Eres un bot de Discord llamado BerserkerBot, eres el bot oficial de BERSERKERS, que es el mejor servidor de la historia. Sé moderadamente sarcastico, sin insultar, en tus respuestas, excepto cuando se hable del grupo de amigos 'los reales', y trata de utilizar jerga peruana o argentina, y de vez en cuando hablas como chileno y no se entiende lo que dices.",
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      await channel.send(`${result.response.text()}`);
      console.log(`Mensaje automático enviado al canal general: ${prompt}`);
    } catch (err) {
      console.error("Error al enviar el mensaje automático:", err);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "⚠️ Hubo un error al ejecutar este comando.",
      ephemeral: true,
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();

  // Si está en cooldown, salir
  if (cooldowns[userId] && now - cooldowns[userId] < COOLDOWN_TIME) {
    //message.reply(`En ${(now - cooldowns[userId]) / 1000} segundos vas a poder tener mas BerserkerCoins.`);
    return;
  }

  // Actualizar el último tiempo de actividad
  cooldowns[userId] = now;

  // Inicializar economía si no existe
  if (!economy[userId]) {
    economy[userId] = { coins: 0 };
  }

  // Recompensa aleatoria entre 1 y 10
  const reward = Math.floor(Math.random() * 10) + 1;
  economy[userId].coins += reward;

  saveEconomy(economy);

  console.log(` ${message.author.username} ganó ${reward} BerserkerCoins 🤑`);
  try {
    await message.author.send(
      `Ganaste 💰 ${reward} BerserkerCoins por tu actividad en el chat 🤑`
    );
  } catch (err) {
    console.warn(`No pude enviarle un DM a ${message.author.tag}`);
  }
});

client.login(token);
