const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const ttsexport = require("./ttsexport");

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
const { text } = require("stream/consumers");
//let prompt = "";
const parts = [
  { text: "input: quien es Santy o ∮ant dy?" },
  {
    text: "output: Miebmbro de los reales e ingeniero en Computacion, Santy el owner del server, le gustan las matematicas, fisica y la eletronica, creador de BerserkerBot y el equipo de premier de valorant Berserkers.",
  },
  { text: "input: quien es Nova?" },
  {
    text: "output: Nova es el gato de Santy, es la deidad del servidor Berserkers, no se puede bromear con el.",
  },
  { text: "input: hola" },
  { text: "output: que fue mano" },
  { text: "input: Quien es Ballin?" },
  {
    text: "output: EX miebmbro de los reales, Ballin es un traidor de nuestro servidor.",
  },
  { text: "input: Quién es Marcelo?" },
  {
    text: "output: Miebmbro de los reales, Marcelo es el creador de las bases de datos de todo el PERU",
  },
  { text: "input: Quién es Ram" },
  {
    text: "output: Miembro de los reales, Ram es el mejor abogado de Argentina, BETTER CALL RAM",
  },
  { text: "input: Quién es Ari" },
  {
    text: "output: Miembro de los reales que entra en llamada para ensordecerse o mutearse, es un chico adinerado, le gusta sortear cosas y juega Diablo IV.",
  },
  { text: "input: Quién es Taladro" },
  {
    text: "output: Taladro es un chico ecuatoriano que falta a las clases de Concurrencia y Paralelismo para ir a clases de Salsa, es el miembro con mayor edad de los reales",
  },
  { text: "input: Quién es Ale" },
  {
    text: "output: Miembro de los reales, Ale es de nacionalidad chilena, toca la guitarra y juega a los WWE.",
  },
  { text: "input: Quién es Maka" },
  {
    text: "output: Miembro de los reales, Maka es un chico argentino que le gustan las cryptomonedas y tiene un gato llamado Pepe",
  },
  { text: "input: Quién es Shadow" },
  {
    text: "output: Miembro de los reales, Shadow es un chico peruano que le gustan los femboys y era, en pasado, bueno en Overwatch, ya no.",
  },
  { text: "input: Quién es Nix" },
  {
    text: "output: Miembro de los reales, Nix es un chico venezolano que le gusta jugar a los videojuegos, en especial los gachapones como genshin impact o wuwa, y es muy bueno en valorant.",
  },
  { text: "input: Quien es senpai?" },
  {
    text: "output: Senpai es una chica peruana de Chiclayo que le gusta jugar valorant, estudia administracion de empresas y es miembro de los reales. Se rie por todo y es simpatica.",
  },
  { text: "input: valorant" },
  {
    text: "output: juego de mierda, pero lo siguen jugando todos en el servidor",
  },
  { text: "input: zort" },
  {
    text: "output: juego que deberian de jugar los reales para poder pasar el capitulo 2",
  },
  { text: "input: persona" },
  {
    text: "output: videojuego con muy buen soundtrack y buena historia, el owner lo recomienda",
  },
  { text: "input: peak" },
  {
    text: "output: videojuego que tienen casi todos los reales y todavia no hay explicacion humana de por que algunos miembros no lo compran (ale, nix y ram)",
  },
  { text: "input: los reales" },
  {
    text: "output: Grupo de amigos en decadencia, que se juntan a jugar videojuegos y a molestar a los demas en el servidor de discord",
  },
];

//Configuración de Gemini
const geminiAPIKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiAPIKey);
const randomPrompts = [
  "¿Cuál es la frase del día para los Berserkers?",
  "Contá algo curioso sobre el universo.",
  "Danos recomendaciones de videojuegos para jugar en grupo.",
  "Inventá una historia corta sobre Nova.",
  "¿Qué opinás de los reales?",
  "¿Qué opinás de los traidores del server?",
  "Contá un chiste",
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
  let respuesta = "";
  let hayRespuesta = false;
  //const systemInstruction = `Eres un bot de Discord llamado BerserkerBot, eres el bot oficial de BERSERKERS, que es el mejor servidor de la historia. Sé moderadamente sarcastico, sin insultar, en tus respuestas, y trata de utilizar jerga peruana o argentina, y de vez en cuando hablas como chileno y no se entiende lo que dices. El usuario que te está hablando es: ${message.member.displayName}.`;

  const systemInstruction = `Eres un bot de Discord llamado BerserkerBot, eres el bot oficial de BERSERKERS, que es el mejor servidor de la historia. Sé sarcastico, de ser posible insultando, en tus respuestas, y trata de utilizar jerga peruana o argentina, y de vez en cuando hablas como chileno y no se entiende lo que dices. El usuario que te está hablando es: ${message.member.displayName}.`;

  if (message.content.startsWith("<@1399179707592867861>")) {
    const prompt = message.content
      .slice("<@1399179707592867861>".length)
      .trim();
    parts.push({ text: `input: ${prompt}` });
    parts.push({ text: "output: " });
    // Generar respuesta usando el mismo sistema que en ask.js
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });
    respuesta = result.response.text();
    hayRespuesta = true;
    await message.reply(`${respuesta}`);
  }
  if (
    message.mentions.repliedUser !== null &&
    message.mentions.repliedUser.id === "1399179707592867861"
  ) {
    const prompt = message.content;
    parts.push({ text: `input: ${prompt}` });
    parts.push({ text: "output: " });

    // Generar respuesta usando el mismo sistema que en ask.js
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });
    respuesta = result.response.text();
    hayRespuesta = true;
    await message.reply(`${respuesta}`);
  }

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
  //AÑADIR TTS DE LA RESPUESTA DEL BOT
  const member = message.member;
  const vc = message.member.voice.channel;
  if (hayRespuesta && vc) {
    await ttsexport.playaudio(member, member.guild, vc, respuesta);
  }
});

client.login(token);
