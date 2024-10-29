const { useMainPlayer, QueryType } = require("discord-player");
const { createMusicEmbed, createErrorEmbed,  createSuccessEmbed, createLyricsEmbed} = require('../embedTemplates');

players = {};

class MusicPlayer {
    constructor(interaction) {
        this.player = useMainPlayer();
        this.queue = null;
        this.volume = 5;
        this.isPlaying = false;

        this.currentTrack = null;
        this.currentLyrics = null;

        this.embedMessage = null;
        this.lyricsEmbedMessage = null;

        this.voiceChannel = interaction.member.voice.channel; 
        this.textChannel = interaction.guild.channels.cache.find(c => c.name === 'music');

        this.initPlayerEvents();
    }

    initPlayerEvents() {
        this.player.events.on('playerStart', async (player, track) => {
            this.currentTrack = track; 
            this.isPlaying = true;
            this.currentLyrics = null;
            this.updateMusicEmbed(); 
            this.updateLyricsEmbed();

            const syncedLyrics = await this.searchSyncedLyrics(track);

            if (syncedLyrics) {
                syncedLyrics.onChange(async (lyrics, timestamp) => {
                    this.currentLyrics = lyrics; 
                    this.updateLyricsEmbed();
                });

                this.lyricsUnsubscribe = syncedLyrics.subscribe();
            }
        });
        this.player.events.on('playerFinish', async (player, track) => {
            if (this.queue.getSize() === 0) {
                this.queue.node.stop();
                this.queue.clear();
                await this.embedMessage.delete();
                this.isPlaying = false;
                this.currentTrack = null;
                if (this.lyricsEmbedMessage) {
                    await this.lyricsEmbedMessage.delete();
                }
            }
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
            const embed = await createMusicEmbed(song)
            this.embedMessage = await interaction.reply({ embeds: [embed] });
            const message = await interaction.fetchReply();

            await message.react('⏮️'); 
            await message.react('⏸️'); 
            await message.react('⏭️'); 
            await message.react('🔉'); 
            await message.react('🔊');


            await this.queue.play(song);
            this.queue.node.setVolume(this.volume);

        } catch (error) {   
            console.error("MUSIC playFirstSong: Erreur lors de la lecture de la musique: " + error);
        }
    }

    async addSongToQueue(song, interaction) {
        await this.queue.addTrack(song);
        const successEmbed = createSuccessEmbed("Music",`La musique **${song.title}** a été ajoutée à la file d'attente.`);
        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
    
    async updateMusicEmbed() {
        if (!this.embedMessage) {return;}
        try {
            await this.embedMessage.edit({ embeds: [createMusicEmbed(this.currentTrack)] });
        } catch (error) {
            console.error("MUSIC updateEmbed: Erreur lors de la mise à jour de l'embed: " + error);
        }
    }

    async updateLyricsEmbed() {
        try {
            if (this.currentLyrics && !this.lyricsEmbedMessage) {
                this.lyricsEmbedMessage = await this.textChannel.send({ embeds: [createLyricsEmbed(this.currentLyrics)] });
            } else if (!this.currentLyrics && this.lyricsEmbedMessage) { 
                await this.lyricsEmbedMessage.delete();
                this.lyricsEmbedMessage = null;
            } else if (this.lyricsEmbedMessage) { 
                await this.lyricsEmbedMessage.edit({ embeds: [createLyricsEmbed(this.currentLyrics)] });
            }
        } catch (error) {
            console.error("MUSIC updateLyricsEmbed: Erreur lors de la mise à jour de l'embed de lyrics: " + error);
        }
    }

    async pauseToggle() {
        try {
            if (this.queue.node.isPaused()) {
                await this.queue.node.resume(); 
                this.isPlaying = true;
            } else {
                await this.queue.node.pause(); 
                this.isPlaying = false;
            }
        } catch (error) {
            console.error("MUSIC pauseToggle: Erreur lors du basculement de pause: " + error);
        }
    }

    decreaseVolume() {
        if (this.volume > 0) {
            this.volume -= 5;
            this.queue.node.setVolume(this.volume);
        }
    }

    increaseVolume() {
        if (this.volume < 100) {
            this.volume += 5;
            this.queue.node.setVolume(this.volume);
        }
    }

    playNextSong() {
        if (this.queue.getSize() > 0) {
            this.queue.node.skip();
        }
    }

    playPreviousSong() {
        if (this.queue.history.previousTrack){
            this.queue.history.back();
        }
    }

    stopPlaying(interaction) {
        this.queue.node.stop();
        const successEmbed = createSuccessEmbed("La musique a été arrêtée");
        interaction.reply({ embeds: [successEmbed], ephemeral: true });
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