const { useMainPlayer, QueryType , QueueRepeatMode } = require("discord-player");
const { createMusicEmbed, createErrorEmbed,  createSuccessEmbed, createLyricsEmbed, createQueueEmbed} = require('../../templates/embedTemplates');
const { createMusicComponents } = require('../../templates/componentsTemplate');
const wait = require('node:timers/promises').setTimeout;

players = {};

class MusicPlayer {
    constructor(interaction) {
        this.player = useMainPlayer();
        this.queue = null;
        this.volume = 1;
        this.maxVolume = 20;
        this.minVolume = 1;
        this.isPlaying = false;
        this.isLoop = false;
        this.isLoopOne = false;
        this.isShuffle = false;

        this.currentTrack = null;
        this.previousLyrics = null;
        this.currentLyrics = null;
        this.nextLyrics = null;

        this.embedMessage = null;

        this.voiceChannel = interaction.member.voice.channel; 
        this.textChannel = interaction.guild.channels.cache.find(c => c.name === 'music');

        this.initPlayerEvents();
    }

    initPlayerEvents() {
        this.player.events.on('playerStart', async (queue, track) => {
            this.currentTrack = track; 
            this.isPlaying = true;
            this.previousLyrics = null;
            this.currentLyrics = null;
            this.nextLyrics = null;
            this.updateMusicEmbed(); 
            this.updateEmbedComponents();

            const syncedLyrics = await this.searchSyncedLyrics(track);
            
            if (syncedLyrics) {
                const lyricsArray = [...syncedLyrics.lyrics.entries()].sort((a, b) => a[0] - b[0]);
                syncedLyrics.onChange(async (lyrics, timestamp) => {
                    this.previousLyrics = this.currentLyrics;
                    this.currentLyrics = lyrics; 

                    const currentIndex = lyricsArray.findIndex(([time]) => time === timestamp);
                    this.nextLyrics = currentIndex !== -1 && lyricsArray[currentIndex + 1]
                        ? lyricsArray[currentIndex + 1][1]  
                        : null; 

                    this.updateMusicEmbed();
                });

                this.lyricsUnsubscribe = syncedLyrics.subscribe();
            }
            
        });
        this.player.events.on('disconnect', async (queue) => {
            this.isPlaying = false;
            this.currentTrack = null;
            this.queue.node.stop();
            this.queue.clear();
            await this.embedMessage.delete();
        });
    }

    async initQueue(guild) {
        try {
            this.queue = await this.player.nodes.create(guild);
        } catch (error) {
            console.error("MUSIC initQueue: Erreur lors de l'initialisation de la queue: " + error);
        }
    }

    async connectToVoiceChannel() {

        try {
            await this.queue.connect(this.voiceChannel, { deaf: false });
        } catch (error) {
            console.error("MUSIC connectToVoiceChannel: Erreur lors de la connexion au salon vocal: " + error);
        }
    }

    async searchYoutubeMusic(url) {
        try {
            const result = await this.player.search(url, {
                requestedBy: this.voiceChannel.client.user,
                searchEngine: QueryType.AUTO
            });

            if (result.tracks.length === 0) {
                console.log("MUSIC searchYoutubeMusic: Aucune musique trouvée pour l'URL donnée.");
                return null;
            }

            return result.tracks[0];

        } catch (error) {
            console.error("MUSIC searchYoutubeMusic: Erreur lors de la recherche de la musique: " + error);
            return null;
        }
    }

    async searchSyncedLyrics(song) {
        try {
            const results = await this.player.lyrics.search({
                q: song.cleanTitle,
            });
    
            const first = results[0];
            if (!first || !first.syncedLyrics) {
                return null;
            }
    
            return this.queue.syncedLyrics(first); 
        } catch (error) {
            console.error("MUSIC searchSyncedLyrics: Erreur lors de la recherche des paroles synchronisées: " + error);
            return null;
        }
    }

    async playFirstSong(song, interaction) {

        if (!song) {return;}

        try {
            const embed = await createMusicEmbed(this.queue.history.previousTrack, song, this.queue.tracks, this.previousLyrics, this.currentLyrics, this.nextLyrics);
            const components = createMusicComponents(this.isPlaying, this.isShuffle, this.isLoop, this.isLoopOne, this.queue.history.previousTrack, this.queue.getSize() > 0, this.volume <= this.minVolume, this.volume >= this.maxVolume);
            this.embedMessage = await interaction.reply({ embeds: [embed], components: components, ephemeral: false });
            
            await this.queue.play(song); 
            this.queue.node.setVolume(this.volume);

        } catch (error) {   
            console.error("MUSIC playFirstSong: Erreur lors de la lecture de la musique: " + error);
        }
    }

    async addSongToQueue(song, interaction, isPlaylist = false) {
        await this.queue.addTrack(song);
        this.updateMusicEmbed(); 
        this.updateEmbedComponents();
        if (!isPlaylist) {
            const successEmbed = createSuccessEmbed("Music",`La musique **${song.title}** a été ajoutée à la file d'attente.`);
            await interaction.reply({ embeds: [successEmbed], ephemeral: false });
            await wait(5_000);
            try {
                await interaction.deleteReply(); 
            } catch (error) {
                console.error('Erreur addSongToQueue: Suppression de la réponse :', error);
            }
        }  
    }
    
    async updateMusicEmbed() {
        if (!this.embedMessage) {return;}
        try {
            await this.embedMessage.edit({ embeds: [createMusicEmbed(this.queue.history.tracks, this.currentTrack, this.queue.tracks, this.previousLyrics, this.currentLyrics, this.nextLyrics)] });
        } catch (error) {
            console.error("MUSIC updateEmbed: Erreur lors de la mise à jour de l'embed: " + error);
        }
    }

    async updateEmbedComponents() {
        if (!this.embedMessage) {return;}
        try {
            const components = createMusicComponents(this.isPlaying, this.isShuffle, this.isLoop, this.isLoopOne, this.queue.history.previousTrack, this.queue.getSize() > 0, this.volume <= this.minVolume, this.volume >= this.maxVolume);
            await this.embedMessage.edit({ components: components });
        } catch (error) {
            console.error("MUSIC updateComponents: Erreur lors de la mise à jour des composants: " + error);
        }
    }

    async rewind(seconds = 10) {
        if (!this.queue || !this.currentTrack) return;

        const currentPosition = this.queue.node.streamTime; 
        const newPosition = Math.max(0, currentPosition - seconds * 1000); 
        await this.queue.node.seek(newPosition); 
    }

    async forward(seconds = 10) {
        if (!this.queue || !this.currentTrack) return;

        const currentPosition = this.queue.node.streamTime; 
        const trackDuration = this.currentTrack.durationMS; 
        const newPosition = Math.min(trackDuration, currentPosition + seconds * 1000)-1; 
        await this.queue.node.seek(newPosition);
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.queue.toggleShuffle();
        this.updateEmbedComponents();
    }

    toggleLoop() {
        this.isLoop = !this.isLoop;
        this.isLoopOne = false;
        const newMode = this.queue.repeatMode === QueueRepeatMode.OFF ? QueueRepeatMode.QUEUE : QueueRepeatMode.OFF;
        this.queue.setRepeatMode(newMode);
        this.updateEmbedComponents();
    }

    toggleLoopOne() {
        this.isLoopOne = !this.isLoopOne;
        this.isLoop = false;
        const newMode = this.queue.repeatMode === QueueRepeatMode.TRACK ? QueueRepeatMode.OFF : QueueRepeatMode.TRACK;
        this.queue.setRepeatMode(newMode);
        this.updateEmbedComponents();
    }

    async togglePause() {
        try {
            if (this.queue.node.isPaused()) {
                await this.queue.node.resume(); 
                this.isPlaying = true;
            } else {
                await this.queue.node.pause(); 
                this.isPlaying = false;
            }
            await this.updateEmbedComponents();
        } catch (error) {
            console.error("MUSIC pauseToggle: Erreur lors du basculement de pause: " + error);
        }
    }

    decreaseVolume() {
        if (this.volume > this.minVolume) {
            this.volume -= 1;
            this.queue.node.setVolume(this.volume);
            this.updateEmbedComponents();
        }
    }

    increaseVolume() {
        if (this.volume < this.maxVolume) {
            this.volume += 1;
            this.queue.node.setVolume(this.volume);
            this.updateEmbedComponents();
        }
    }

    playNextSong() {
        if (this.queue.getSize() > 0) {
            this.queue.node.skip();
            this.updateEmbedComponents();
        }
    }

    playPreviousSong() {
        if (this.queue.history.previousTrack){
            this.queue.history.back();
           this.updateEmbedComponents();
        }
    }

    stopPlaying(interaction) {
        this.queue.node.stop();
        const successEmbed = createSuccessEmbed("La musique a été arrêtée");
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }

    async displayQueue(interaction) {
        if (!this.queue || this.queue.getSize() === 0) {
            const errorEmbed = createErrorEmbed("La file d'attente est vide.");
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const queueEmbed = createQueueEmbed(this.queue.history.tracks, this.currentTrack, this.queue.tracks);
        await interaction.reply({ embeds: [queueEmbed], ephemeral: false });
        await wait(15_000);
        await interaction.deleteReply(); 
    }

    cleanUrl(url) {
        const listIndex = url.indexOf('&list');
        if (listIndex !== -1) {
            return url.substring(0, listIndex); 
        }
        return url
    }

    async startPlaying(url, interaction) {

        if (!this.textChannel) {
            const errorEmbed = createErrorEmbed("Impossible de trouver le salon de texte 'music'.");
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        if (!this.voiceChannel) {
            const errorEmbed = createErrorEmbed("Vous devez être dans un salon vocal pour utiliser cette commande.");
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const song = await this.searchYoutubeMusic(this.cleanUrl(url));

        if (!song) {
            const errorEmbed = createErrorEmbed("Aucune musique trouvée pour l'URL donnée.");
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        
        if (!this.queue) {
            await this.initQueue(this.voiceChannel.guild);
        }

        if (this.voiceChannel && !this.queue.connection) {
            this.voiceChannel = interaction.member.voice.channel;
            await this.connectToVoiceChannel();
        }

        if (!this.isPlaying) {
            this.playFirstSong(song, interaction);
        } else {
            this.addSongToQueue(song, interaction);
        }
    }

}

module.exports = { MusicPlayer, players };