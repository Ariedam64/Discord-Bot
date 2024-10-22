const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createMusicEmbed } = require('../embeds/embedTemplates');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const queue = new Map();

function playMusic(guild, song, interaction) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, { filter: 'audioonly' });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer();

  player.play(resource);
  serverQueue.connection.subscribe(player);
  serverQueue.player = player;

  const embed = createMusicEmbed(song.title, song.url, song.thumbnail, song.duration, interaction.user.username);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pause')
        .setLabel('⏸ Pause')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('resume')
        .setLabel('▶️ Reprendre')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('skip')
        .setLabel('⏭ Passer')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('⏹ Arrêter')
        .setStyle(ButtonStyle.Danger),
    );

  interaction.channel.send({ embeds: [embed], components: [row] });

  player.on(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    playMusic(guild, serverQueue.songs[0], interaction);
  });

  player.on('error', error => console.error(error));

  const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON' });

  collector.on('collect', async i => {
    if (i.customId === 'pause') {
      player.pause();
      await i.update({ content: 'Lecture mise en pause.', components: [row] });
    } else if (i.customId === 'resume') {
      player.unpause();
      await i.update({ content: 'Lecture reprise.', components: [row] });
    } else if (i.customId === 'skip') {
      player.stop();
      await i.update({ content: 'Chanson passée.', components: [row] });
    } else if (i.customId === 'stop') {
      player.stop();
      queue.delete(guild.id);
      await i.update({ content: 'Musique arrêtée.', components: [] });
    }
  });
}

function addSongToQueue(guildId, song) {
  const serverQueue = queue.get(guildId);

  if (serverQueue) {
    serverQueue.songs.push(song);
    return `**${song.title}** a été ajouté à la file d'attente.`;
  }
  
  return null;
}

module.exports = {
  playMusic,
  queue,
  addSongToQueue
};