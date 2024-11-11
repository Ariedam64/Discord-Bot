const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require('discord.js');
const { colors } = require('../config.json'); 

function formatNumber(num) {
  if (num >= 1e9) {
      return (num / 1e9).toFixed(0) + 'B'; 
  } else if (num >= 1e6) {
      return (num / 1e6).toFixed(0) + 'M'; 
  } else if (num >= 1e3) {
      return (num / 1e3).toFixed(0) + 'k'; 
  } else {
      return num.toString(); 
  }
}

function createSuccessEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.success)
    .setTitle(title || 'Succès')
    .setDescription(description || 'Action réalisée avec succès.')
}

function createErrorEmbed(description) {
  return new EmbedBuilder()
    .setColor(colors.error)
    .setTitle('Erreur')
    .setDescription(description || 'Une erreur est survenue.')
}

function createInfoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(title || 'Information')
    .setDescription(description || 'Voici une information importante.')
}

function createImageEmbed(title, description, imageUrl) {
  return new EmbedBuilder()
    .setColor(colors.info) 
    .setTitle(title || 'Image générée')
    .setDescription(description || 'Voici l\'image générée.')
    .setImage(imageUrl);
}

function createWarningEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(colors.warning)
    .setTitle(title || 'Avertissement')
    .setDescription(description || 'Faites attention.')
}

function createMusicEmbed(previousTracksQueue, currentTrack, upcomingTracksQueue, previousLyrics, currentLyrics, nextLyrics) {

  var previousTracks = [];
  var upcomingTracks = [];

  if (previousTracksQueue){
    previousTracks = previousTracksQueue.data;
  }
  if (upcomingTracksQueue){
    upcomingTracks = upcomingTracksQueue.data;
  }

  var previousTrack = previousTracks.length > 0 ? previousTracks[previousTracks.length - 1] : null;
  var nextTrack = upcomingTracks.length > 0 ? upcomingTracks[0] : null;
  var totalTracksLength = previousTracks.length + 1 + upcomingTracks.length;
  var currentTrackIndex = previousTracks.length + 1; 


  if (previousTracks.length === 0 && upcomingTracks.length === 0) {
      totalTracksLength = 1; 
      currentTrackIndex = 1;
  } else if (previousTracks.length === 0) {
      currentTrackIndex = 1; 
  } else if (upcomingTracks.length === 0) {
      currentTrackIndex = previousTracks.length + 1;
  }

  const musicDuration = currentTrack.duration;
  const musicViews = formatNumber(currentTrack.views);
  const musicAddedBy = currentTrack.requestedBy;

  var description = `**Information sur le morceau**
  > - Durée: ***${musicDuration}***
  > - Vues: ***${musicViews}***
  > - Ajouté par: ***${musicAddedBy}***

  **File d'attente (${currentTrackIndex}/${totalTracksLength})**\n`;

  if (previousTrack) {description += `> ${previousTrack.title}\n`;}
  description += `> > **${currentTrack.title}**\n`;
  if (nextTrack) {description += `> ${nextTrack.title}\n`;}

  if (currentLyrics) {
    description += `\n**Lyrics**\n`
  if (previousLyrics) {description += `> ${previousLyrics}\n`;}
  if (currentLyrics) {description += `> > **${currentLyrics}**\n`;}
  if (nextLyrics) {description += `> ${nextLyrics}\n`;}

  }

  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`🎶 **${currentTrack.cleanTitle}**`)
    .setDescription(description)
    .setURL(currentTrack.url)
    .setImage(currentTrack.thumbnail)
    //.setThumbnail("https://cdn.discordapp.com/emojis/1301712131296858204.gif?size=96&quality=lossless")
}

function createGameEmbed(game, isUpcoming) {
  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(game.title)
    .setDescription(game.description)
    .setThumbnail(game.gameImage)
    .setFooter({ text: `Prix d\'origine: ${game.originalPrice}` });

    if (game.startDate != "N/A") {
      embed.addFields({ name: 'Gratuit', value: ` ${game.startDate} - ${game.endDate}`, inline: false });
    }

    if (isUpcoming && game.upcomingStartDate != "N/A") {
      embed.addFields({ name: 'Prochainement', value: ` ${game.upcomingStartDate} - ${game.upcomingEndDate}`, inline: false });
    }

    return embed;
}

function createDetailAnimeEmbed(anime) {

  const fields = [];

  const animeUrl = anime.trailer.url ? anime.trailer.url : anime.url;
  if (anime.score) {fields.push({ name: 'Score', value: `⭐ ${anime.score}`, inline: true });}
  if (anime.popularity) {fields.push({ name: 'Popularité', value: `📈 ${anime.popularity}`, inline: true });}
  if (anime.rank) {fields.push({ name: 'Classement', value: `🏆 #${anime.rank}`, inline: true });}
  

  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`${anime.titles[0].title} (${anime.type})`)
    .setURL(animeUrl)
    .setImage(anime.images.webp.large_image_url)
    .setDescription( anime.synopsis ? anime.synopsis : 'Synopsis non disponible')
    .addFields(fields);

    return embed;
}

function createQueueEmbed(previousTracksQueue, currentTrack, upcomingTracksQueue) {

  const previousTracks = previousTracksQueue.data;
  const upcomingTracks = upcomingTracksQueue.data;

  const allTracks = [...previousTracks, currentTrack, ...upcomingTracks];

  const fields = [];
  
  allTracks.forEach((track, index) => {
    if (track === currentTrack) {
      fields.push({
        name: `➡️ ${index + 1}. ${track.title}`,
        value: `Durée: ${track.duration}`,
        inline: false
      });
    } else {
      fields.push({
        name: `${index + 1}. ${track.title}`,
        value: `Durée: ${track.duration}`,
        inline: false
      });
    }
  });

  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle('🎶 File d\'attente 🎶')
    .addFields(fields)
    .setTimestamp();
}

async function createPlaylistEmbed(playlists, guild) {
  const groupedPlaylists = playlists.reduce((acc, playlist) => {
    if (!acc[playlist.creator]) {
      acc[playlist.creator] = [];
    }
    acc[playlist.creator].push(playlist);
    return acc;
  }, {});

  const fields = await Promise.all(Object.entries(groupedPlaylists).map(async ([creator, userPlaylists]) => {
    const creatorUser = await guild.members.fetch(creator);
    const playlistDescriptions = userPlaylists.map(playlist => ` - ${playlist.name} [${playlist.songs.length}]`).join('\n');
    return {
      name: `Playlists de ${creatorUser.user.globalName}`,
      value: playlistDescriptions,
      inline: false
    };
  }));

  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle('🎶 Playlists 🎶')
    .addFields(fields)
    .setTimestamp();
}

function createPlaylistDetailEmbed(playlist, page = 1) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(playlist.songs.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const videos = playlist.songs.slice(startIndex, endIndex);

  const fields = videos.map((video, index) => {
    return {
      name: `${startIndex + index + 1}. ${video.title}`,
      value: `${video.url}`,
      inline: false
    };
  });

  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`🎶 Playlist ${playlist.name} 🎶`)
    .addFields(fields)
    .setFooter({ text: `Page ${page} sur ${totalPages}` })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`playlist_prev_${playlist.name}_${page}`)
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId(`playlist_next_${playlist.name}_${page}`)
        .setEmoji('➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page === totalPages)
    );

  return { embed, row };
}

module.exports = {
  createQueueEmbed,
  createMusicEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createWarningEmbed,
  createImageEmbed,
  createGameEmbed,
  createDetailAnimeEmbed,
  createPlaylistEmbed,
  createPlaylistDetailEmbed
};