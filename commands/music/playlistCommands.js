const { SlashCommandBuilder } = require('discord.js');
const { createPlaylist, addTrackToPlaylist, deletePlaylist, removeTrackFromPlaylist, playPlaylist,playlists } = require('../../utils/commandLogic/playlistUtils');
const { createSuccessEmbed, createErrorEmbed, createPlaylistEmbed, createPlaylistDetailEmbed } = require('../../templates/embedTemplates');

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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Supprimer une musique d\'une playlist')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom de la playlist')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('position')
            .setDescription('Position de la musique dans la playlist')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('url')
            .setDescription('URL de la musique')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Titre de la musique')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('show')
        .setDescription('Afficher les playlists')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('detail')
        .setDescription('Afficher le détail d\'une playlist')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom de la playlist')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('Jouer une playlist')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom de la playlist')
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
        var playlistName = interaction.options.getString('name');
        var videoUrl = interaction.options.getString('url');
        var videoTitle = interaction.options.getString('title');
        var position = interaction.options.getInteger('position');

        if (!videoUrl && !videoTitle && !position) {
          return await interaction.reply({ embeds: [createErrorEmbed('Vous devez spécifier une URL, un titre ou une position de la musique à supprimer.')], ephemeral: true });
        }

        var result = await removeTrackFromPlaylist(guildId, memberId, playlistName, videoUrl, videoTitle, position);
        if (result.success) {
          await interaction.reply({ embeds: [createSuccessEmbed(result.message)], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [createErrorEmbed(result.message)], ephemeral: true });
        }
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
        var playlistName = interaction.options.getString('name');
        var result = deletePlaylist(guildId, memberId, playlistName);
        if (result.success) {
          await interaction.reply({ embeds: [createSuccessEmbed(result.message)], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [createErrorEmbed(result.message)], ephemeral: true });
        }
        break;

      case 'show':
        var server = playlists.servers.find(s => s.serverId === guildId);
        if (!server) {
          return await interaction.reply({ embeds: [createErrorEmbed(`Aucune playlist trouvée pour le serveur ${guildId}.`)], ephemeral: true });
        }

        var playlistsList = server.playlists
        var embed = await createPlaylistEmbed(playlistsList, interaction.guild);
        await interaction.reply({ embeds: [embed], ephemeral: true });

        break;

      case 'detail':
        var playlistName = interaction.options.getString('name');
        var server = playlists.servers.find(s => s.serverId === guildId);
        if (!server) {
          return await interaction.reply({ embeds: [createErrorEmbed(`Aucune playlist trouvée pour le serveur ${guildId}.`)], ephemeral: true });
        }
        var playlist = server.playlists.find(p => p.name === playlistName);
        if (!playlist) {
          return await interaction.reply({ embeds: [createErrorEmbed(`Aucune playlist trouvée avec le nom ${playlistName}.`)], ephemeral: true });
        } 

        var { embed, row } = createPlaylistDetailEmbed(playlist);
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        break;

      case 'play':
        var playlistName = interaction.options.getString('name');
    
        var result = await playPlaylist(guildId, playlistName, interaction);
        /*if (!result.success) {
          await interaction.reply({ content: result.message, ephemeral: true });
        } */
        break;
    }
  },
};