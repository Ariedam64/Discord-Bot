const { EmbedBuilder } = require('discord.js');
const { colors } = require('../config.json'); 

function createErrorEmbed(errorMessage) {
  return new EmbedBuilder()
    .setColor(colors.error)
    .setTitle('Erreur')
    .setDescription(errorMessage)
    .setTimestamp()
    .setFooter({ text: 'Une erreur est survenue' });
}

module.exports = { createErrorEmbed };