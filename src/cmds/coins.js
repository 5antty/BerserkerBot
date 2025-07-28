const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const economy = require('../../data/economy.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Muestra tus BerserkerCoins o las de otro usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const coins = economy[user.id]?.coins || 0;
    await interaction.reply(`${user.username} tiene 💰 ${coins} monedas 🤑`);
  }
};


 // Mostrar monedas al pedir con !coins
/*   if (message.content.startsWith('!coins')) {
  const mentionedUser = message.mentions.users.first();
  const targetUser = mentionedUser || message.author;
  const targetId = targetUser.id;

  const coins = economy[targetId]?.coins || 0;

  if (mentionedUser) {
    message.reply(`${targetUser.username} tiene 💰 ${coins} monedas.`);
  } else {
    message.reply(`Tienes 💰 ${coins} monedas.`);
  }
} */