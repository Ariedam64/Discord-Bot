const { SlashCommandBuilder } = require('discord.js');
const { createInfoEmbed } = require('../embeds/embedTemplates.js'); 
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot et son status.'),
  async execute(interaction) {

    const herokuApiKey = process.env.HEROKU_API_KEY;
    const herokuAppName = process.env.HEROKU_APP_NAME;

    const sentMessage = await interaction.reply({ content: 'Calcul du ping...', fetchReply: true });

    const apiLatency = interaction.client.ws.ping;
    const messageLatency = sentMessage.createdTimestamp - interaction.createdTimestamp;
    let dynosInfo = 'Impossible de récupérer le statut des dynos Heroku.';

    try {
      const response = await axios({
        method: 'get',
        url: `https://api.heroku.com/apps/${herokuAppName}/dynos`,
        headers: {
          Authorization: `Bearer ${herokuApiKey}`,
          Accept: 'application/vnd.heroku+json; version=3'
        }
      });
      const dynos = response.data.map(dyno => `${dyno.type}: ${dyno.state} (Started at: ${dyno.created_at})`).join('\n');
      dynosInfo = `**Statut des dynos Heroku:**\n${dynos}`;

    } catch (error) {
      console.error('Erreur avec l\'API Heroku:', error);
    }

    const embed = createInfoEmbed(
      'Statut du bot',
      `**Latence du message:** \`${messageLatency}ms\`\n**Latence de l'API Discord:** \`${apiLatency}ms\`\n\n${dynosInfo}`
    );

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};