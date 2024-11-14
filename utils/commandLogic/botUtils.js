const { createInfoEmbed, createErrorEmbed, createSuccessEmbed } = require('../../templates/embedTemplates');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../configUtils');

function formatElapsedTime(minutesElapsed) {
    const days = Math.floor(minutesElapsed / 1440);
    const hours = Math.floor((minutesElapsed % 1440) / 60);
    const minutes = minutesElapsed % 60;

    let result = '';
    if (days > 0) result = `${days} jours`;
    else if (hours > 0) result = `${hours}h et ${minutes}min`;
    else result = `${minutes}min`;
    return result;
  }

async function status(interaction){

    const herokuApiKey = process.env.HEROKU_API_KEY;
    const herokuAppName = process.env.HEROKU_APP_NAME;
    const uptimeRobotApiKey = process.env.UPTIME_ROBOT_API_KEY;

    const sentMessage = await interaction.reply({ content: 'Récupération des données...', fetchReply: true });
    const apiLatency = interaction.client.ws.ping;
    const messageLatency = sentMessage.createdTimestamp - interaction.createdTimestamp;

    let dynosInfo = `- Erreur: \`Impossible de récupérer les dynos d\'Heroku\``;
    let uptimeStatus = '- Erreur: \`Impossible de récupérer le moniteur d\'UptimeRobot.\`';
    let uptimeResponseTime = '';

    try {
      const expectedDynos = ['web', 'worker'];
      const dynosInfoMap = {};
      const response = await axios({
        method: 'get',
        url: `https://api.heroku.com/apps/${herokuAppName}/dynos`,
        headers: {
          Authorization: `Bearer ${herokuApiKey}`,
          Accept: 'application/vnd.heroku+json; version=3'
        }
      });

      response.data.forEach(dyno => {
        const now = new Date();
        const createdAt = new Date(dyno.created_at);
        const timeElapsed = Math.floor((now - createdAt) / 60000); 
        const status = dyno.state.toUpperCase();
        
        dynosInfoMap[dyno.type] = `- ${dyno.type}: \`${status}\` depuis ${formatElapsedTime(timeElapsed)}`;
      });
    
      dynosInfo = expectedDynos.map(dynoType => {
        if (dynosInfoMap[dynoType]) {
          return dynosInfoMap[dynoType];
        } else {
          return `- ${dynoType}: \`DOWN\``;
        }
      }).join('\n');

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
      const status = monitor.status === 2 ? `\`UP\`` : `\`DOWN\``;
      const log = monitor.logs[0];
      const lastPingDateTime = monitor.response_times[0].datetime;
      const lastPingValue = monitor.response_times[0].value;
      averageResponseTime = monitor.average_response_time;

      const duration = Math.floor(log.duration / 60); 
      const now = new Date();
      const lastPingTime = new Date(lastPingDateTime * 1000);
      const minutesAgo = Math.floor((now - lastPingTime) / 60000);

      uptimeStatus = `- Moniteur: ${status} depuis ${formatElapsedTime(duration)}`;
      uptimeResponseTime = `- Dernier ping: \`${lastPingValue}ms\` il y a ${minutesAgo}min`;

    } catch (error) {
      console.error('Erreur avec l\'API UptimeRobot:', error);
    }

    const embed = createInfoEmbed(
      'Bot Statut',
      `**Discord** \n- Latence du message: \`${messageLatency}ms\`\n- Latence API: \`${apiLatency}ms\`\n\n**Dynos Heroku**\n${dynosInfo}\n\n**Moniteur UptimeRobot**\n${uptimeStatus}\n${uptimeResponseTime}`
    );

    await interaction.editReply({ content: '', embeds: [embed] });
}

async function reloadConfigFile(interaction){

    try {
        loadConfig();
  
        const embed = createSuccessEmbed(
          'Rechargement du fichier de configuration',
          'Le fichier de configuration a été rechargé avec succès !'
        );
  
        await interaction.reply({ content: '', embeds: [embed], ephemeral: false });
        
    } catch (error) {
        console.error('Erreur lors du rechargement du fichier de configuration :', error);
  
        const errorEmbed = createErrorEmbed(
          'Erreur de rechargement',
          'Impossible de recharger le fichier de configuration. Veuillez vérifier le fichier.'
        );
  
        await interaction.reply({ content: '', embeds: [errorEmbed], ephemeral: false });
    }
}

async function restart(interaction){
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
}

module.exports = { 
    status,
    reloadConfigFile,
    restart
 }