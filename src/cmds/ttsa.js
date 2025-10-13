const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");

const { GoogleGenAI } = require("@google/genai");
const wav = require("wav");
require("dotenv").config();
const geminiAPITTS = process.env.GEMINI_API_TTS;

async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

async function main(prompt, voz, como) {
  const ai = new GoogleGenAI({
    apiKey: geminiAPITTS,
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [
      {
        parts: [
          {
            text: `${como}: ${prompt}`,
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voz },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const audioBuffer = Buffer.from(data, "base64");

  const fileName = "out.wav";
  await saveWaveFile(fileName, audioBuffer);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tts-avanzado")
    .setDescription("Que queres que diga causaaa")
    .addStringOption((option) =>
      option
        .setName("voz")
        .setDescription("Selecciona la voz")
        .addChoices(
          { name: "BERSERKER", value: "Enceladus" },
          { name: "mina", value: "Zephyr" },
          { name: "Ballin", value: "Puck" },
          { name: "negraso", value: "Sadachbia" },
          { name: "empollon", value: "Fenrir" },
          { name: "mama", value: "Callirrhoe" },
          { name: "egirl", value: "Leda" },
          { name: "trolazo", value: "Pulcherrima" },
          { name: "africano", value: "Zubenelgenubi" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("como")
        .setDescription("Como quieres que lo diga?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("No entediste? QUE DIGOOO")
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.member;
    const prompt = interaction.options.getString("prompt");
    const voz = interaction.options.getString("voz");
    const como = interaction.options.getString("como");

    if (!member.voice.channel) {
      return interaction.reply({
        content: "Debes estar en un canal de voz primero 🎧",
        ephemeral: true,
      });
    }

    await interaction.reply("🎵 Reproduciendo audio local...");
    await main(prompt, voz, como);
    const connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    //const filePath = path.join(__dirname, `../audio/${fileName}`);
    const resource = createAudioResource("out.wav");
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      //connection.destroy(); // salir del canal cuando termina
    });
  },
};

/*
.addStringOption((option) =>
      option
        .setName("Voz")
        .setDescription("Selecciona la voz")
        .addChoices(
          { name: "BERSERKER", value: "Enceladus" },
          { name: "mina", value: "Zephyr" },
          { name: "Ballin", value: "Puck" },
          { name: "negraso", value: "Sadachbia" },
          { name: "empollon", value: "Fenrir" },
          { name: "mama", value: "Callirrhoe" },
          { name: "egirl", value: "Leda" },
          { name: "trolazo", value: "Pulcherrima" },
          { name: "africano", value: "Zubenelgenubi" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("Como lo digo?")
        .setDescription("Como quieres que lo diga?")
        .setRequired(true)
    )
*/
