const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Reproduce audio de un video de YouTube")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Busca un video de YouTube")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    const video = interaction.options.getString("url").trim();

    // Validar canal de voz
    if (!member.voice.channel) {
      return interaction.reply({
        content: "Debes estar en un canal de voz primero 🎧",
        ephemeral: true,
      });
    }

    // Validar enlace
    const validation = ytdl.validateURL(video);

    if (validation === false) {
      return interaction.reply({
        content: "URL no válida de YouTube ❌",
        ephemeral: true,
      });
    }

    await interaction.reply(
      `Conectando al canal de voz y reproduciendo el audio 🎵`
    );

    try {
      // Crear conexión al canal de voz
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      console.log("se obtiene el player");
      // Crear stream del video
      const source = await ytdl(video);
      console.log("se obtiene el source");
      // Crear recurso de audio
      const resource = createAudioResource(source);
      console.log("el recurso llega hasta aca");
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      await interaction.editReply(`✅ Reproduciendo: ${video}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Error al intentar reproducir el audio.");
    }
  },
};
