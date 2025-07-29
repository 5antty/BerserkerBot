const fs = require("fs");
const { REST, Routes } = require("discord.js");

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];

const slashCommandsFiles = fs
  .readdirSync("./src/cmds")
  .filter((file) => file.endsWith("js"));

for (const file of slashCommandsFiles) {
  const slash = require(`../cmds/${file}`);
  console.log(`[Slash Commands] Cargando ${slash.data.name}`);
  commands.push(slash.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

createSlash();

async function createSlash() {
  try {
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log("[Slash Commands] Agregados.");
  } catch (e) {
    console.error(e);
  }
}