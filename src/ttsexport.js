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

const voices = [
  //{ name: "BERSERKER", value: "Enceladus" },
  { name: "mina", value: "Zephyr" },
  //{ name: "Ballin", value: "Puck" },
  //{ name: "negraso", value: "Sadachbia" },
  //{ name: "empollon", value: "Fenrir" },
  { name: "mama", value: "Callirrhoe" },
  { name: "egirl", value: "Leda" },
  //{ name: "trolazo", value: "Pulcherrima" },
  //{ name: "africano", value: "Zubenelgenubi" },
];

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

async function generateTTSFile(prompt, voz, como) {
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

async function playaudio(member, guild, channel, prompt) {
  if (!member || !member.voice || !member.voice.channel) {
    console.log("El miembro no está en un canal de voz");
    return;
  }

  const random = Math.floor(Math.random() * voices.length);
  const voz = voices[random].value;
  const como = "habla como si fueras una mujer seduciendo a un hombre";
  await generateTTSFile(prompt, voz, como);

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });
  //const filePath = path.join(__dirname, `../audio/${fileName}`);
  const resource = createAudioResource("out.wav");
  const player = createAudioPlayer();

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy(); // salir del canal cuando termina
  });
}
module.exports = {
  generateTTSFile,
  playaudio,
};
