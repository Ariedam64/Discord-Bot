const { players } = require('../utils/commandLogic/musicUtils'); 
const { loadPlaylists } = require('../utils/commandLogic/playlistUtils');
const { createErrorEmbed, createPlaylistDetailEmbed } = require('../templates/embedTemplates');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  });
};

async function handleCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Il y a eu une erreur en exécutant cette commande!', ephemeral: true });
  }
}

async function handleButton(interaction) {
  const customId = interaction.customId;

  if (customId.startsWith('playlist_')) {
    await handlePlaylistButton(interaction, customId);
  } else {
    await handleMusicButton(interaction, customId);
  }
}

async function handlePlaylistButton(interaction, customId) {
  const [event, action, playlistName, page] = customId.split('_');
  const guildId = interaction.guild.id;
  const playlists = loadPlaylists();
  const server = playlists.servers.find(s => s.serverId === guildId);

  if (!server) {
    return await interaction.reply({ embeds: [createErrorEmbed(`Aucune playlist trouvée pour le serveur ${guildId}.`)], ephemeral: true });
  }

  const playlist = server.playlists.find(p => p.name === playlistName);
  if (!playlist) {
    return await interaction.reply({ embeds: [createErrorEmbed(`Aucune playlist trouvée avec le nom ${playlistName}.`)], ephemeral: true });
  }

  let newPage = parseInt(page);
  if (action === 'prev') {
    newPage--;
  } else if (action === 'next') {
    newPage++;
  }

  const { embed, row } = createPlaylistDetailEmbed(playlist, newPage);
  await interaction.update({ embeds: [embed], components: [row] });
}

async function handleMusicButton(interaction, customId) {
  const musicPlayer = players[interaction.guild.id];

  if (!musicPlayer) {
    await interaction.reply({ content: 'Aucun lecteur de musique trouvé pour ce serveur.', ephemeral: true });
    return;
  }

  try {
    switch (customId) {
      case 'music_previous':
        await musicPlayer.playPreviousSong();
        break;
      case 'music_rewind':
        await musicPlayer.rewind();
        break;
      case 'music_pause':
        await musicPlayer.togglePause();
        break;
      case 'music_forward':
        await musicPlayer.forward();
        break;
      case 'music_next':
        await musicPlayer.playNextSong();
        break;
      case 'music_shuffle':
        await musicPlayer.toggleShuffle();
        break;
      case 'music_loop':
        await musicPlayer.toggleLoop();
        break;
      case 'music_loop_one':
        await musicPlayer.toggleLoopOne();
        break;
      case 'music_volume_down':
        await musicPlayer.decreaseVolume();
        break;
      case 'music_volume_up':
        await musicPlayer.increaseVolume();
        break;
      default:
        console.log(`Unhandled button interaction: ${customId}`);
    }

    await interaction.deferUpdate();
  } catch (error) {
    console.error(error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.followUp({ content: 'Il y a eu une erreur en exécutant cette action!', ephemeral: true });
    }
  }
}