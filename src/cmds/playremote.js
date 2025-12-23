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
    .setName("play-out")
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
          { name: "chau", value: "chau" },
          { name: "qver", value: "qver" },
          { name: "tmreBallin", value: "tmreBallin" },
          { name: "huevon", value: "huevon" },
          { name: "oyaraa", value: "oyaraa" },
          { name: "soyballin", value: "soyballin" },
          { name: "qpalta", value: "qpalta" }
        )
    )
    .addStringOption((option) =>
      option.setName("canal").setDescription("id de canal").setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.member;
    const channel = interaction.options.getString("canal");
    //const idCanal = 1099408420202872832;

    await interaction.reply("🎵 Reproduciendo audio...");

    const connection = joinVoiceChannel({
      channelId: channel,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    //Me quedo con el nombre del audio
    let audioName = interaction.options.getString("audio");

    const filePath = path.join(__dirname, `../audios/${audioName}.wav`);
    const resource = createAudioResource(filePath);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);
    console.log(`Reproduciendo audio: ${audioName}`);
    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy(); // salir del canal cuando termina
    });
  },
};
