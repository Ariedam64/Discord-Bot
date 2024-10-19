const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createSuccessEmbed, createErrorEmbed } = require('../embeds/embedTemplates.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('vocjoin')
  .setDescription('Permettre au bot de rejoindre un salon vocal'),

  async execute(interaction) {
    const channel = interaction.member.voice.channel; 

    if (!channel) {
      const errorEmbed = createErrorEmbed('Tu dois être dans un salon vocal pour que je puisse te rejoindre.');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const embed = createSuccessEmbed(
        `Connexion au salon vocal ${channel.name}`,
        'Le bot s\'est connecté avec succès !'
      );

      await interaction.reply({ content: '', embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de la tentative de connexion au salon vocal :', error);
      const errorEmbed = createErrorEmbed('Impossible de rejoindre le salon vocal. Une erreur est survenue.');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};