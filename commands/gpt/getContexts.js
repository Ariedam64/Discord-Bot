const { SlashCommandBuilder } = require('discord.js');
const { createInfoEmbed } = require('../../utils/embedTemplates');
const { getConfig } = require('../../utils/configUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getcontexts')
    .setDescription('Affiche les contextes disponibles avec leurs descriptions.'),

  async execute(interaction) {

    const configData = getConfig();

    const contextDescriptions = Object.keys(configData.contexts).map(context => {
      const description = configData.contexts[context].description;
      return `**__${context}__**: ${description}`;
    }).join('\n');;

    const embed = createInfoEmbed(
        'Contextes Disponibles',
        contextDescriptions 
      );
  
      await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};