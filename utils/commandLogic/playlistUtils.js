const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core-discord');

let playlist = {};
const playlistPath = path.resolve(__dirname, '../../playlist.json');

function loadPlaylists() {
    if (fs.existsSync(playlistPath)) {
        playlists = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
        console.log(playlists);
    } else {
        playlists = { servers: [] };
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
    return playlist;
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
    deletePlaylist
};