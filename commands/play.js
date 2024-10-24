const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, QueryType } = require("discord-player")
const { createSuccessEmbed, createErrorEmbed } = require('../embeds/embedTemplates.js');;

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
    const queue = await player.nodes.create(interaction.guild);

    if (!voiceChannel) {
      const errorEmbed = createErrorEmbed('Tu dois être dans un salon vocal pour jouer de la musique !');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {

      if (!queue.connection) {
        console.log('Connecting to voice channel...');
        await queue.connect(voiceChannel, { deaf: false });
      }

      const music = await player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO
      }).then(x => x.tracks[0]);

      await interaction.reply('🔄 Recherche de la musique...');

      console.log(music.title)

      const lyrics = await player.lyrics.search({ q: music.title });

      if (lyrics[0].syncedLyrics) {
        const syncedLyrics = queue.syncedLyrics(lyrics[0]);
        const unsubscribe = syncedLyrics.onChange(async (lyrics, timestamp) => {
          console.log(lyrics, timestamp);
          //await interaction.followUp(`🎤 ${lyrics}`);
       });
      }

      if (!music) {
        return interaction.reply('Aucune musique trouvée pour cette URL.');
      }

      await queue.addTrack(music);

      if (!queue.playing) {
        console.log('Starting playback...');
        await queue.node.play();
      }

      await interaction.editReply(`🎶 Lecture de la musique : **${music.title}**`);
  
    } catch (error) {
      console.error('Erreur lors de la lecture de la musique :', error);
      interaction.reply('Une erreur est survenue lors de la lecture de la musique.');
    }
  },
};