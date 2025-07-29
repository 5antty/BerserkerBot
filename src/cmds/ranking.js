const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadEconomy } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Muestra el ranking de BerserkerCoins del servidor'),

  async execute(interaction) {
    const economy = loadEconomy();
    const sorted = Object.entries(economy)
      .sort(([, a], [, b]) => b.coins - a.coins);

    if (sorted.length === 0) {
      return interaction.reply('Nadie tiene monedas aún 😅');
    }

    const PAGE_SIZE = 10;
    let page = 0;

    const generateEmbed = async (pageIndex) => {
      const start = pageIndex * PAGE_SIZE;
      const current = sorted.slice(start, start + PAGE_SIZE);
      let description = '';

      const placeEmojis = ['🥇', '🥈', '🥉'];

      for (let i = 0; i < current.length; i++) {
        const [userId, data] = current[i];
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        const username = member ? member.displayName : `Usuario desconocido (${userId})`;

        const position = start + i;
        const emoji = placeEmojis[position] || '🔹';

        description += `${emoji} **${position + 1}.** ${username} — 💰 ${data.coins} monedas\n`;
      }

      return new EmbedBuilder()
        .setTitle('🗿 Ranking de monedas 🗿')
        .setDescription(description)
        .setColor(0xFFD700)
        .setFooter({ text: `Página ${pageIndex + 1} de ${Math.ceil(sorted.length / PAGE_SIZE)}` });
    };

    const prevButton = new ButtonBuilder()
      .setCustomId('prev')
      .setLabel('⬅️ Anterior')
      .setStyle(ButtonStyle.Secondary);

    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Siguiente ➡️')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

    const embed = await generateEmbed(page);
    const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = reply.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Solo quien usó el comando puede usar estos botones.', ephemeral: true });
      }

      if (i.customId === 'prev' && page > 0) page--;
      if (i.customId === 'next' && (page + 1) * PAGE_SIZE < sorted.length) page++;

      const newEmbed = await generateEmbed(page);
      await i.update({ embeds: [newEmbed], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await reply.edit({ components: [] }); // desactiva botones
      } catch (e) {}
    });
  }
};
