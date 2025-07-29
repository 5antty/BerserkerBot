const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection
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

const { loadEconomy, saveEconomy } = require('./utils/economy');


const fs = require('fs');
const path = require('path');
const config = require("../config.json");

const cooldowns = {}; // { userId: timestamp }

const COOLDOWN_TIME = 30 * 1000; // 30 segundos

//Slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'cmds');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./cmds/${file}`);
  
  client.commands.set(command.data.name, command);
}


// Cargar economía
let economy = loadEconomy();

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '⚠️ Hubo un error al ejecutar este comando.', ephemeral: true });
  }
});


client.on('messageCreate', async message => {
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
    await message.author.send(`Ganaste 💰 ${reward} BerserkerCoins por tu actividad en el chat 🤑`);
  } catch (err) {
    console.warn(`No pude enviarle un DM a ${message.author.tag}`);
  }
});

client.login(config.token);