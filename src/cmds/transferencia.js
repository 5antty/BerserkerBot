const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const economy = require('../../data/economy.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transferir')
    .setDescription('Transfiere BerserkerCoins a otro usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a transferir')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de monedas a transferir')
        .setRequired(true)),

  async execute(interaction) {
    const sender = interaction.user;
    const recipient = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('cantidad');

    if (recipient.bot) {
      return interaction.reply({ content: 'No puedes transferir monedas a un bot 🤖', ephemeral: true });
    }

    if (recipient.id === sender.id) {
      return interaction.reply({ content: 'No podes transferirte monedas a vos mismo wachin 😅', ephemeral: true });
    }

    if (amount <= 0) {
      return interaction.reply({ content: 'tmre, la cantidad debe ser mayor que 0 huevon.', ephemeral: true });
    }

    if (!economy[sender.id]) economy[sender.id] = { coins: 0 };
    if (!economy[recipient.id]) economy[recipient.id] = { coins: 0 };

    if (economy[sender.id].coins < amount) {
      return interaction.reply({ content: 'No tenes suficientes BerserkerCoins jasjajs 💸', ephemeral: true });
    }

    // Realiza la transferencia
    economy[sender.id].coins -= amount;
    economy[recipient.id].coins += amount;
    saveEconomy();

    await interaction.reply(`✅ ASHU transferiste 💰 ${amount} BerserkerCoins a ${recipient.username}.`);
  }
};