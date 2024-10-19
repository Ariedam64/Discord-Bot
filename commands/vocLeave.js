const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { createSuccessEmbed, createErrorEmbed } = require('../embeds/embedTemplates.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('vocleave')
    .setDescription('Permettre au bot de quitter un salon vocal'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const errorEmbed = createErrorEmbed('Tu dois être dans un salon vocal pour que je puisse quitter.');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const connection = getVoiceConnection(channel.guild.id); 
      if (connection) {
        connection.destroy(); 

        const successEmbed = createSuccessEmbed(
          `Déconnexion du salon vocal ${channel.name}`,
          'Le bot a quitté le salon vocal avec succès !'
        );
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });

      } else {
        const errorEmbed = createErrorEmbed('Le bot n\'est connecté à aucun salon vocal dans ce serveur.');
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

    } catch (error) {
      console.error('Erreur lors de la déconnexion du salon vocal :', error);
      const errorEmbed = createErrorEmbed('Impossible de quitter le salon vocal. Une erreur est survenue.');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};