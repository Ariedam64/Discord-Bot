const { getConfig } = require('../../utils/configUtils');
const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../../templates/embedTemplates');
const { resetMessageHistory, setCurrentContext } = require('../../utils/GPTUtils');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('setcontext')
  .setDescription('Change le contexte du bot.')
  .addStringOption(option => 
    option.setName('contexte')
      .setDescription('Le contexte à utiliser pour le bot.')
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

      async execute(interaction) {
        const configData = getConfig();
        const chosenContext = interaction.options.getString('contexte');
    
        if (configData.contexts[chosenContext]) {
          setCurrentContext(chosenContext);
          resetMessageHistory()
          const description = configData.contexts[chosenContext].description;
    
          const successEmbed = createSuccessEmbed(
            `Contexte changé : ${chosenContext}`,
            `**Description**: ${description}`
          );
    
          await interaction.reply({ embeds: [successEmbed], ephemeral: false });
        } else {
          const errorEmbed = createErrorEmbed('Contexte invalide. Les contextes disponibles sont : ' + Object.keys(configData.contexts).join(', '));
          await interaction.reply({ embeds: [errorEmbed], ephemeral: false });
        }
      },
    };