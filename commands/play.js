const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { playMusic, addSongToQueue, queue } = require('../utils/music.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Jouer une musique YouTube')
    .addStringOption(option => 
      option.setName('url')
        .setDescription('URL de la vidéo YouTube')
        .setRequired(true)),

  async execute(interaction) {
    const url = interaction.options.getString('url');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply('Tu dois être dans un salon vocal pour jouer de la musique !');
    }

    const songInfo = await ytdl.getInfo(url);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };

    const serverQueue = queue.get(interaction.guild.id);

    if (!serverQueue) {
      const queueContract = {
        textChannel: interaction.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        player: null,
      };

      queue.set(interaction.guild.id, queueContract);
      queueContract.songs.push(song);

      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        queueContract.connection = connection;
        playMusic(interaction.guild, queueContract.songs[0], interaction);

      } catch (err) {
        console.error(err);
        queue.delete(interaction.guild.id);
        return interaction.reply('Erreur lors de la connexion au salon vocal.');
      }
    } else {
      const response = addSongToQueue(interaction.guild.id, song);
      return interaction.reply(response);
    }
  }
};