const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const economy = require('../../data/economy.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Muestra el ranking de BerserkerCoins del servidor'),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const coins = economy[user.id]?.coins || 0;
    await interaction.reply(`${user.username} tiene 💰 ${coins} monedas 🤑`);

    const sorted = Object.entries(economy)
    .sort(([, a], [, b]) => b.coins - a.coins)
    .slice(0, 10);

    if (sorted.length === 0) {
        return interaction.reply('Nadie tiene monedas aún 😅');
    }

    let reply = '**🏆 Ranking de monedas 🗿:**\n';
    for (let i = 0; i < sorted.length; i++) {
        const [userId, data] = sorted[i];
        const user = await client.users.fetch(userId).catch(() => null);
        const username = user ? user.username : `Usuario desconocido (${userId})`;
        reply += `${i + 1}. ${username}: 💰 ${data.coins} monedas\n`;
    }
    await interaction.reply(reply);
  }
};


//Muestra el ranking de monedas al pedir con !ranking
/* if (message.content === '!ranking') {
  const sorted = Object.entries(economy)
    .sort(([, a], [, b]) => b.coins - a.coins)
    .slice(0, 10);

  if (sorted.length === 0) {
    return message.reply('Nadie tiene monedas aún 😅');
  }

  let reply = '**🏆 Ranking de monedas 🗿:**\n';
  for (let i = 0; i < sorted.length; i++) {
    const [userId, data] = sorted[i];
    const user = await client.users.fetch(userId).catch(() => null);
    const username = user ? user.username : `Usuario desconocido (${userId})`;
    reply += `${i + 1}. ${username}: 💰 ${data.coins} monedas\n`;
  }

  message.reply(reply);
} */