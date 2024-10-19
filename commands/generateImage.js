const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const { config } = require('dotenv');
const { createImageEmbed } = require('../embeds/embedTemplates');

config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generateimage')
    .setDescription('Génère une image à partir d\'une description.')
    .addStringOption(option => 
      option.setName('description')
        .setDescription('La description de l\'image que vous voulez générer.')
        .setRequired(true)),

  async execute(interaction) {
    const description = interaction.options.getString('description');
    
    await interaction.deferReply();

    try {
      const response = await client.images.generate({
        model: "dall-e-2",
        prompt: description,
        n: 1, 
        size: "512x512",
      });

      const imageUrl = response.data[0].url;

      const embed = createImageEmbed('Image générée', `Voici l'image générée pour : **${description}**`, imageUrl);

      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image :', error);
      await interaction.editReply('Une erreur est survenue lors de la génération de l\'image.');
    }
  },
};