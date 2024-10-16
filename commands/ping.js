const { SlashCommandBuilder } = require('discord.js');
const { createInfoEmbed } = require('../embeds/embedTemplates.js'); // Assurez-vous que cet import est correct

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot.'),
  async execute(interaction) {

    const sentMessage = await interaction.reply({ content: 'Calcul du ping...', fetchReply: true });

    const apiLatency = interaction.client.ws.ping;
    const messageLatency = sentMessage.createdTimestamp - interaction.createdTimestamp;

    const embed = createInfoEmbed(
      'Latence du bot',
      `Message : \`${messageLatency}ms\`\nAPI : \`${apiLatency}ms\``
    );

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};