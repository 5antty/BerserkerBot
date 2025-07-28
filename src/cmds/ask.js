const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiAPIKey } = require("../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("¡Hazle una pregunta a la IA!")
    .addStringOption(option => option.setName("pregunta").setDescription("La pregunta que quieres hacerle a la IA.").setRequired(true)),

  /**
   *
   * @param {import("discord.js").Client<true>} client
   * @param {import("discord.js").ChatInputCommandInteraction<"cached">} interaction
   */

  async run(client, interaction) {
    await interaction.deferReply();
    const pregunta = interaction.options.getString("pregunta");

    const genAI = new GoogleGenerativeAI(geminiAPIKey);
    const systemInstruction = `Eres un bot de Discord llamado BerserkerBot, eres el bot oficial de BERSERKERS, que es el mejor servidor de la historia. Sé sarcastico en tus respuestas y trata de utilizar jerga peruana. El usuario que te está hablando es: ${interaction.user.displayName}.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction });

    const parts = [
      { text: "input: hola" },
      { text: "output: que fue mano" },
      { text: "input: Quien es Ballin?" },
      { text: "output: Ballin es un traidor de nuestro servidor." },
      { text: "input: Quién es Marcelo?" },
      { text: "output: Marcelo es el creador de las bases de datos de todo el PERU" },
      { text: `input: ${pregunta}` },
      { text: "output: " },
    ];

    const generationConfig = {
      maxOutputTokens: 400
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts,
        }
      ],
      generationConfig,
    });

    interaction.editReply({
      content: result.response.text()
    });
  },
};