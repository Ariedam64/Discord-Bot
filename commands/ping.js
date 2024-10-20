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
    const uptimeRobotApiKey = process.env.UPTIME_ROBOT_API_KEY;

    const sentMessage = await interaction.reply({ content: 'Calcul du ping...', fetchReply: true });
    const apiLatency = interaction.client.ws.ping;
    const messageLatency = sentMessage.createdTimestamp - interaction.createdTimestamp;

    let dynosInfo = 'Impossible de récupérer le statut des dynos Heroku.';
    let uptimeStatus = 'Impossible de récupérer le statut du moniteur UptimeRobot.';
    let uptimeResponseTime = '';
    let averageResponseTime = '';

    function formatElapsedTime(minutesElapsed) {
      const days = Math.floor(minutesElapsed / 1440);
      const hours = Math.floor((minutesElapsed % 1440) / 60);
      const minutes = minutesElapsed % 60;

      let result = '';
      if (days > 0) result += `${days} jours `;
      if (hours > 0) result += `${hours}h `;
      result += `${minutes}min`;
      return result;
    }

    try {
      const response = await axios({
        method: 'get',
        url: `https://api.heroku.com/apps/${herokuAppName}/dynos`,
        headers: {
          Authorization: `Bearer ${herokuApiKey}`,
          Accept: 'application/vnd.heroku+json; version=3'
        }
      });

      const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      };

      const dynos = response.data.map(dyno => {
        const formattedDate = formatDate(dyno.created_at);
        const stateInUpperCase = dyno.state.toUpperCase();
        return `*${dyno.type}*: ${stateInUpperCase} depuis le ${formattedDate}`;
      }).join('\n');
      dynosInfo = `**Statut des dynos Heroku:**\n${dynos}`;

    } catch (error) {
      console.error('Erreur avec l\'API Heroku:', error);
    }

    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.uptimerobot.com/v2/getMonitors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `api_key=${uptimeRobotApiKey}&format=json&logs=1&logs_limit=1&response_times=1&response_times_limit=1`
      });

      const monitor = response.data.monitors[0];
      const status = monitor.status === 2 ? 'UP' : 'DOWN';
      const log = monitor.logs[0];
      const lastPing = monitor.response_times[0];
      averageResponseTime = monitor.average_response_time;

      const duration = Math.floor(log.duration / 60); // Convertir la durée en minutes
      const lastPingTime = new Date(lastPing.datetime * 1000).toLocaleString(); // Date du dernier ping

      const now = new Date();
      const minutesAgo = Math.floor((now - lastPingTime) / 60000);

      uptimeStatus = `*Moniteur*: ${status} (depuis ${formatElapsedTime(duration)})`;
      uptimeResponseTime = `*Dernier ping*: \`${lastPing.value}ms\` (il y a ${minutesAgo}min)`;

    } catch (error) {
      console.error('Erreur avec l\'API UptimeRobot:', error);
    }

    const embed = createInfoEmbed(
      'Statut du bot',
      `**Statut Discord** \n*Latence du message:* \`${messageLatency}ms\`\n*Latence API:* \`${apiLatency}ms\`\n\n${dynosInfo}\n\n**Statut du moniteur UptimeRobot:**\n${uptimeStatus}\n${uptimeResponseTime}`
    );

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};