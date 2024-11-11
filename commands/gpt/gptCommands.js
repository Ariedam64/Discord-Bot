const { SlashCommandBuilder } = require('discord.js');
const { OpenAI } = require('openai');
const { createImageEmbed, createErrorEmbed, createSuccessEmbed } = require('../../templates/embedTemplates');
const { generateImage, changeBotContext } = require('../../utils/GPTUtils');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Commandes liées à l\'ia du bot')
    .addSubcommand(subcommand =>
      subcommand
        .setName('image')
        .setDescription('Génère une image à partir d\'une description')
        .addStringOption(option => 
          option.setName('image_description')
            .setDescription('Description de l\'image à générer')
            .setRequired(true)
          )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('personality')
        .setDescription('Changer la personnalité du bot')
        .addStringOption(option => 
          option.setName('bot_context')
            .setDescription('La personnalité que le bot doit utiliser')
            .setRequired(true)
            .addChoices(
              { name: 'Agressif', value: 'agressif' },
              { name: 'Normal', value: 'lambda_discord' },
              { name: 'Codeur', value: 'codeur' },
              { name: 'Waifu', value: 'waifu' },
              { name: 'Mathématicien', value: 'math' },
              { name: 'Voyageur', value: 'voyageur' },
              { name: 'Gameur', value: 'gameur' },
            )),
      
    ),

  async execute(interaction) {

    await interaction.deferReply();
    
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {

      case 'image':
        if ( process.env.DISCORD_PERSONAL_ID !== interaction.user.id ) {
          return await interaction.editReply({ embeds: [createErrorEmbed('Vous n\'avez pas la permission d\'utiliser cette commande.')] });
        }
        const imageDescription = interaction.options.getString('image_description');
        const urlImage = await generateImage(imageDescription);
        if (!urlImage) {
          await interaction.editReply({ embeds: [createErrorEmbed('Une erreur est survenue lors de la génération de l\'image.')] });
          return;
        }
        await interaction.editReply({ embeds: [createImageEmbed('Image générée', `Voici l'image générée pour : **${imageDescription}**`, urlImage)] });
        break;

      case 'personality':
        const botContext = interaction.options.getString('bot_context');
        const newBotPersonalityDescription = await changeBotContext(botContext);
        if (!newBotPersonalityDescription) {
          await interaction.editReply({ embeds: [createErrorEmbed('Une erreur est survenue lors du changement de personnalité.')] });
          return;
        }
        await interaction.editReply({ embeds: [createSuccessEmbed('Personnalité changée', `**Description**: ${newBotPersonalityDescription}`)] });
        break;
    }
  }
};