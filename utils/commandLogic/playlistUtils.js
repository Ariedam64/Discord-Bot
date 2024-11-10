const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core-discord');
const { MusicPlayer, players } = require('./musicUtils');

let playlists = {};
const playlistPath = path.resolve(__dirname, '../../playlist.json');

function loadPlaylists() {
    if (fs.existsSync(playlistPath)) {
        playlists = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
    } else {
        playlists = { servers: [] };
        savePlaylists();
    }
}

function savePlaylists() {
    const replace = (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    };
    fs.writeFileSync(playlistPath, JSON.stringify(playlists, replace, 4));
    playlists = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
}
function getPlaylists() {
    return playlists;
}

loadPlaylists();

function createPlaylist(serverId, memberId, playlistName) {
    let server = playlists.servers.find(s => s.serverId === serverId);
    if (!server) {
        server = { serverId: serverId, playlists: [] };
        playlists.servers.push(server);
    }

    if (server.playlists.some(p => p.name === playlistName)) {
        return { success: false, message: 'Une playlist avec ce nom existe déjà.' };
    }

    const newPlaylist = {
        name: playlistName,
        creator: memberId,
        videos: []
    };
    server.playlists.push(newPlaylist);

    savePlaylists();
    return { success: true, message: `La playlist "${playlistName}" a été créée.` };
}

async function addTrackToPlaylist(serverId, memberId, playlistName, videoUrl) {
    let server = playlists.servers.find(s => s.serverId === serverId);
    if (!server) {
        return { success: false, message: `Aucune playlist trouvée pour le serveur ${serverId}.` };
    }

    let playlist = server.playlists.find(p => p.name === playlistName);
    if (!playlist) {
        return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }

    let creator = playlist.creator;
    if (creator !== memberId) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à ajouter une musique à cette playlist.' };
    }

    if (!ytdl.validateURL(videoUrl)) {
        return { success: false, message: 'URL de la vidéo invalide.' };
    }

    if (playlist.videos.some(v => v.url === videoUrl)) {
        return { success: false, message: 'La vidéo est déjà dans la playlist.' };
    }

    const videoTitle = await getVideoTitle(videoUrl)

    playlist.videos.push({ title: videoTitle , url: videoUrl });
    savePlaylists();
    return { success: true, message: `La musique a été ajoutée à la playlist "${playlistName}".` };
}

function deletePlaylist(serverId, memberId, playlistName) {
    let server = playlists.servers.find(s => s.serverId === serverId);
    if (!server) {
        return { success: false, message: `Aucune playlist trouvée pour le serveur ${serverId}.` };
    }

    let playlistIndex = server.playlists.findIndex(p => p.name === playlistName);
    if (playlistIndex === -1) {
        return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }

    let creator = server.playlists[playlistIndex].creator;
    if (creator !== memberId) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à supprimer cette playlist.' };
    }

    server.playlists.splice(playlistIndex, 1);
    savePlaylists();
    return { success: true, message: `La playlist "${playlistName}" a été supprimée.` };
}

function removeTrackFromPlaylist(serverId, memberId, playlistName, videoUrl = null, videoName = null, videoPosition = null) {
    let server = playlists.servers.find(s => s.serverId === serverId);
    if (!server) {
        return { success: false, message: `Aucune playlist trouvée pour le serveur ${serverId}.` };
    }

    let playlist = server.playlists.find(p => p.name === playlistName);
    if (!playlist) {
        return { success: false, message: `Aucune playlist trouvée avec le nom ${playlistName}.` };
    }

    let creator = playlist.creator;
    if (creator !== memberId) {
        return { success: false, message: 'Vous n\'êtes pas autorisé à supprimer une musique de cette playlist.' };
    }

    if (videoUrl) {
        let videoIndex = playlist.videos.findIndex(v => v.url === videoUrl);
        if (videoIndex === -1) {
            return { success: false, message: 'La vidéo n\'est pas dans la playlist.' };
        }
    } else if (videoName) {
        let videoIndex = playlist.videos.findIndex(v => v.title === videoName);
        if (videoIndex === -1) {
            return { success: false, message: 'La vidéo n\'est pas dans la playlist.' };
        }
    } else if (videoPosition) {
        videoIndex = videoPosition - 1;
        if (videoPosition < 1 || videoPosition > playlist.videos.length) {
            return { success: false, message: 'Position de la vidéo invalide.' };
        }
    }

    playlist.videos.splice(videoIndex, 1);
    savePlaylists();
    return { success: true, message: 'La musique a été supprimée de la playlist.' };
}

async function playPlaylist(serverId, playlistName, interaction) {
    const playlists = getPlaylists();
    const server = playlists.servers.find(s => s.serverId === serverId);

    if (!server) {
        return { success: false, message: `Aucune playlist trouvée pour le serveur ${serverId}.` };
    }

    const playlist = server.playlists.find(p => p.name === playlistName);
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

    for (const video of playlist.videos) {
        const song = await musicPlayer.searchYoutubeMusic(video.url);
        if (song) {
            if (!musicPlayer.isPlaying) {
                await musicPlayer.playFirstSong(song, interaction);
            } else {
                await musicPlayer.addSongToQueue(song, interaction, true);
            }
        }
    }
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
    savePlaylists,
    getPlaylists,
    createPlaylist,
    addTrackToPlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    playPlaylist,
    playlists,
};