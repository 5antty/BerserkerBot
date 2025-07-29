const { SlashCommandBuilder } = require('discord.js');
const { loadEconomy } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Muestra la tienda de BerserkerCoins del servidor'),

  async execute(interaction) {
    const economy = loadEconomy();
    const sorted = Object.entries(economy)
    .sort(([, a], [, b]) => b.coins - a.coins)
    .slice(0, 10);

    if (sorted.length === 0) {
        return interaction.reply('Nadie tiene monedas aún 😅');
    }

    let reply = '**🏆 Ranking de monedas 🗿:**\n';
    for (let i = 0; i < sorted.length; i++) {
        const [userId, data] = sorted[i];
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        const username = user ? user.username : `Usuario desconocido (${userId})`;
        reply += `${i + 1}. ${username}: 💰 ${data.coins} monedas\n`;
    }
    await interaction.reply(reply);
  }
};