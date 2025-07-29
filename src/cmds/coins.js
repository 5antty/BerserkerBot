const { SlashCommandBuilder } = require('discord.js');
const { loadEconomy } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Muestra tus BerserkerCoins o las de otro usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)),

  async execute(interaction) {
    const economy = loadEconomy();
    const user = interaction.options.getUser('usuario') || interaction.user;
    const coins = economy[user.id]?.coins || 0;
    await interaction.reply(`${user.username} tiene 💰 ${coins} monedas 🤑`);
  }
};