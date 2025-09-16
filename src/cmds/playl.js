const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reproducir")
    .setDescription("Reproduce un archivo de audio local")
    .addStringOption((option) =>
      option
        .setName("audio")
        .setDescription("El nombre del archivo de audio (sin extensión)")
        .setRequired(true)
        .addChoices(
          { name: "saludo", value: "saludo" },
          { name: "hablen", value: "hablen" },
          { name: "paeso", value: "paeso" },
          { name: "paja", value: "paja" },
          { name: "train", value: "train" },
          { name: "chau", value: "chau" }
        )
    ),
  async execute(interaction) {
    const member = interaction.member;

    if (!member.voice.channel) {
      return interaction.reply({
        content: "Debes estar en un canal de voz primero 🎧",
        ephemeral: true,
      });
    }

    await interaction.reply("🎵 Reproduciendo audio local...");

    const connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    //Me quedo con el nombre del audio
    let audioName = interaction.options.getString("audio");

    const filePath = path.join(__dirname, `../audio/${audioName}.wav`);
    const resource = createAudioResource(filePath);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      //connection.destroy(); // salir del canal cuando termina
    });
  },
};
