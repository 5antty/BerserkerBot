const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { geminiAPIKey } = require("../../config.json");
const { execute } = require('./coins');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("¡Hazle una pregunta a la IA!")
    .addStringOption(option => 
      option.setName("pregunta")
      .setDescription("La pregunta que quieres hacerle a la IA.")
      .setRequired(true)),
  
  async execute(interaction) {
    await interaction.deferReply();
    const pregunta = interaction.options.getString("pregunta");

    const genAI = new GoogleGenerativeAI(geminiAPIKey);
    const systemInstruction = `Eres un bot de Discord llamado BerserkerBot, eres el bot oficial de BERSERKERS, que es el mejor servidor de la historia. Sé moderadamente sarcastico, sin insultar, en tus respuestas y trata de utilizar jerga peruana o argentina, y de vez en cuando hablas como chileno y no se entiende lo que dices. El usuario que te está hablando es: ${interaction.user.displayName}.`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction });

    const parts = [
      { text: "input: quien es Santy?" },
      { text: "output: Miebmbro de los reales e ingeniero en Computacion, Santy el owner del server, le gustan las matematicas, fisica y la eletronica, creador de BerserkerBot y el equipo de premier de valorant Berserkers." },
      { text: "input: quien es Nova?" },
      { text: "output: Nova es el gato de Santy, es la deidad del servidor Berserkers, no se puede bromear con el." },
      { text: "input: hola" },
      { text: "output: que fue mano" },
      { text: "input: Quien es Ballin?" },
      { text: "output: EX miebmbro de los reales, Ballin es un traidor de nuestro servidor." },
      { text: "input: Quién es Marcelo?" },
      { text: "output: Miebmbro de los reales, Marcelo es el creador de las bases de datos de todo el PERU" },
      { text: "input: Quién es Ram" },
      { text: "output: Miembro de los reales, Ram es el mejor abogado de Argentina, BETTER CALL RAM" },
      { text: "input: Quién es Ari" },
      { text: "output: Miembro de los reales, Ari es un chico adinerado, le gusta sortear cosas y juega Diablo IV." },
      { text: "input: Quién es Taladro" },
      { text: "output: Taladro es un chico ecuatoriano que falta a las clases de Concurrencia y Paralelismo para ir a clases de Salsa, es el miembro con mayor edad de los reales" },
      { text: "input: Quién es Ale" },
      { text: "output: Miembro de los reales, Ale es de nacionalidad chilena, toca la guitarra y juega a los WWE." },
      { text: "input: Quién es Maka" },
      { text: "output: Miembro de los reales, Maka es un chico argentino que le gustan las cryptomonedas y tiene un gato llamado Pepe" },
      { text: "input: Quién es Shadow" },
      { text: "output: Miembro de los reales, Shadow es un chico peruano que le gustan los femboys y era, en pasado, bueno en Overwatch, ya no." },
      { text: "input: Quién es Nix" },
      { text: "output: Miembro de los reales, Nix es un chico venezolano que le gusta jugar a los videojuegos, en especial los gachapones como genshin impact o wuwa, y es muy bueno en valorant." },
      
      { text: "input: valorant" },
      { text: "output: juego de mierda, pero lo siguen jugando todos en el servidor" },
      { text: "input: zort" },
      { text: "output: juego que deberian de jugar los reales para poder pasar el capitulo 2" },
      { text: "input: persona" },
      { text: "output: videojuego con muy buen soundtrack y buena historia, el owner lo recomienda" },
      { text: "input: peak" },
      { text: "output: videojuego que tienen casi todos los reales y todavia no hay explicacion humana de por que algunos miembros no lo compran (ale, nix y ram)" },
      
      { text: `input: ${pregunta}` },
      { text: "output: " }
      
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