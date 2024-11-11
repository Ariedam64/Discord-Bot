const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core-discord');
const { MusicPlayer, players } = require('./musicUtils');
const { Playlist, Song } = require('../../stockage/models/playlist');

async function loadPlaylists() {
    return await Playlist.findAll({ include: 'songs' });
}

async function createPlaylist(serverId, memberId, playlistName) {
    const existingPlaylist = await Playlist.findOne({ where: { serverId, name: playlistName } });
    if (existingPlaylist) {
      return { success: false, message: 'Une playlist avec ce nom existe déjà.' };
    }
  
    const newPlaylist = await Playlist.create({
      serverId,
      name: playlistName,
      creator: memberId,
    });
  
    return { success: true, message: `La playlist "${playlistName}" a été créée.` };
}

async function addTrackToPlaylist(serverId, memberId, playlistName, videoUrl) {
    const playlist = await Playlist.findOne({ where: { serverId, name: playlistName }, include: 'songs' });
    if (!playlist) {
      return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }
  
    if (playlist.creator !== memberId) {
      return { success: false, message: 'Vous n\'êtes pas autorisé à ajouter une musique à cette playlist.' };
    }
  
    if (playlist.songs.some(s => s.url === videoUrl)) {
      return { success: false, message: 'La musique est déjà dans la playlist.' };
    }
  
    const videoTitle = await getVideoTitle(videoUrl);
    await Song.create({ title: videoTitle, url: videoUrl, PlaylistId: playlist.id });
  
    return { success: true, message: `La musique a été ajoutée à la playlist "${playlistName}".` };
}

async function deletePlaylist(serverId, memberId, playlistName) {
    const playlist = await Playlist.findOne({ where: { serverId, name: playlistName } });
    if (!playlist) {
      return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }
  
    if (playlist.creator !== memberId) {
      return { success: false, message: 'Vous n\'êtes pas autorisé à supprimer cette playlist.' };
    }
  
    await playlist.destroy();
    return { success: true, message: `La playlist "${playlistName}" a été supprimée.` };
}

async function removeTrackFromPlaylist(serverId, memberId, playlistName, videoUrl = null, videoName = null, videoPosition = null) {
    const playlist = await Playlist.findOne({ where: { serverId, name: playlistName }, include: 'videos' });
    if (!playlist) {
      return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }
  
    if (playlist.creator !== memberId) {
      return { success: false, message: 'Vous n\'êtes pas autorisé à supprimer une musique de cette playlist.' };
    }
  
    let song;
    if (videoUrl) {
        song = playlist.songs.find(s => s.url === videoUrl);
    } else if (videoName) {
        song = playlist.songs.find(s => s.title === videoName);
    } else if (videoPosition) {
        song = playlist.songs[videoPosition - 1];
    }
  
    if (!song) {
      return { success: false, message: 'La vidéo n\'est pas dans la playlist.' };
    }
  
    await song.destroy();
    return { success: true, message: 'La musique a été supprimée de la playlist.' };
}

async function playPlaylist(serverId, playlistName, interaction) {

    const playlist = await Playlist.findOne({
        where: { serverId, name: playlistName },
        include: 'songs'
    });

    if (!playlist) {
        return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }

    const musicPlayer = players[interaction.guild.id] || new MusicPlayer(interaction);
    players[interaction.guild.id] = musicPlayer;

    if (!musicPlayer.queue) {
        await musicPlayer.initQueue(interaction.guild);
    }

    if (!musicPlayer.voiceChannel) {
        return { success: false, message: 'Vous devez être dans un salon vocal pour utiliser cette commande.' };
    }

    if (!musicPlayer.queue.connection) {
        await musicPlayer.connectToVoiceChannel();
    }

    if (musicPlayer.isPlaying) {
        await musicPlayer.stopPlaying(interaction);
    }

    for (const song of playlist.songs) {
        try {
            const foundedSong = await musicPlayer.searchYoutubeMusic(song.url);
            if (foundedSong) {
                if (!musicPlayer.isPlaying) {
                    await musicPlayer.playFirstSong(foundedSong, interaction);
                } else {
                    await musicPlayer.addSongToQueue(foundedSong, interaction, true);
                }
            } else {
                console.error(`Erreur: Impossible de trouver la chanson pour l'URL ${song.url}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la recherche de la chanson pour l'URL ${song.url}:`, error);
        }
    }

    return { success: true, message: `La playlist "${playlistName}" a été jouée avec succès.` };
}

async function getVideoTitle(url) {
    try {
        const video = await ytdl.getBasicInfo(url);
        return video.videoDetails.title;
    } catch (error) {
        return 'Titre inconnu';
    }
    
}
  
module.exports = {
    loadPlaylists,
    createPlaylist,
    addTrackToPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    playPlaylist,
};