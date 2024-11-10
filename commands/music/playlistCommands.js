const { SlashCommandBuilder } = require('discord.js');
const { createPlaylist, addTrackToPlaylist } = require('../../utils/commandLogic/playlistUtils');
const { createSuccessEmbed, createErrorEmbed } = require('../../templates/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Gérer les playlists')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Créer une playlist')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom de la playlist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer une playlist')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom de la playlist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Ajouter une musique à une playlist')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom de la playlist')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('url')
            .setDescription('URL de la musique')
            .setRequired(true)
        )
    ),

  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const memberId = interaction.member.id;

    switch (subcommand) {
      case 'add':
        var playlistName = interaction.options.getString('name');
        var videoUrl = interaction.options.getString('url');
        var result = await addTrackToPlaylist(guildId, memberId, playlistName, videoUrl);
        if (result.success) {
          await interaction.reply({ embeds: [createSuccessEmbed(result.message)], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [createErrorEmbed(result.message)], ephemeral: true });
        }
        break;
      case 'remove':
        break;
      case 'create':
        var playlistName = interaction.options.getString('name');
        var result = createPlaylist(guildId, memberId, playlistName);
        if (result.success) {
          await interaction.reply({ embeds: [createSuccessEmbed(result.message)], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [createErrorEmbed(result.message)], ephemeral: true });
        }
        break;
      case 'delete':
        break;
      case 'show':
        break;
    }
  },
};