const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require("discord-player")
const { createMusicEmbed, createErrorEmbed } = require('../../utils/embedTemplates');;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Jouer une musique YouTube')
    .addStringOption(option => 
      option.setName('url')
        .setDescription('URL de la vidéo YouTube')
        .setRequired(true)),

  async execute(interaction) {
    
    const player = useMainPlayer();
    const url = interaction.options.getString('url');
    const voiceChannel = interaction.member.voice.channel;
    let queue;

    if (!voiceChannel) {
      const errorEmbed = createErrorEmbed('Tu dois être dans un salon vocal pour jouer de la musique !');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!player.nodes.has(interaction.guild.id)) { 
      queue = await player.nodes.create(interaction.guild);
    } else {
      queue = player.nodes.get(interaction.guild.id);
    }

    try {

      if (!queue.connection) {
        console.log('Connecting to voice channel...');
        await queue.connect(voiceChannel, { deaf: false });
      }

      const musicFound = await player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO
      }).then(x => x.tracks[0]);

      if (!musicFound) {
        return interaction.reply('Aucune musique trouvée pour cette URL.');
      }

      const music = {
        title: musicFound.title,
        author: musicFound.author,
        url: musicFound.url,
        thumbnail: musicFound.thumbnail,
        duration: musicFound.duration,
        description: musicFound.description,
        cleanTitle: musicFound.title,
        //lyrics: await player.lyrics.search({ q: musicFound.title })
      }

      /*if (music.lyrics.length > 0 || music.lyrics[0].syncedLyrics) {
        const syncedLyrics = queue.syncedLyrics(music.lyrics[0]);
        const unsubscribe = syncedLyrics.onChange(async (lyrics, timestamp) => {
          console.log(lyrics, timestamp);
          //await interaction.followUp(`🎤 ${lyrics}`);
       });
      }*/

      await queue.addTrack(musicFound);

      if (!queue.node.isPlaying()) {
        console.log('Starting playback...');
        await queue.node.play();
        queue.node.setVolume(5)
        const musicEmbed = createMusicEmbed(music);
        await interaction.reply({ embeds: [musicEmbed] });

        const message = await interaction.fetchReply();

        await message.react('⏮️'); 
        await message.react('⏸️'); 
        await message.react('⏭️'); 
        await message.react('🔉'); 
        await message.react('🔊');
      } else {
        await interaction.reply({ content: 'Musique ajoutée à la file d\'attente.', ephemeral: true });
      }

    } catch (error) {
      console.error('Erreur lors de la lecture de la musique :', error);
      interaction.reply('Une erreur est survenue lors de la lecture de la musique.');
    }
  },
};