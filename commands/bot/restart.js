const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embedTemplates');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Redémarre le bot sur Heroku'),

  async execute(interaction) {
    const herokuApiKey = process.env.HEROKU_API_KEY;
    const herokuAppName = process.env.HEROKU_APP_NAME;

    try {
      await axios({
        method: 'delete',
        url: `https://api.heroku.com/apps/${herokuAppName}/dynos`,
        headers: {
          Authorization: `Bearer ${herokuApiKey}`,
          Accept: 'application/vnd.heroku+json; version=3'
        }
      });

      const successEmbed = createSuccessEmbed(
        'Redémarrage du bot',
        'Le bot est en cours de redémarrage. Veuillez attendre quelques instants.'
      );

      await interaction.reply({ embeds: [successEmbed], ephemeral: true });
      
    } catch (error) {
      console.error('Erreur lors du redémarrage des dynos Heroku :', error);

      const errorEmbed = createErrorEmbed(
        'Erreur de redémarrage',
        'Impossible de redémarrer le bot. Veuillez vérifier les logs pour plus de détails.'
      );

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};