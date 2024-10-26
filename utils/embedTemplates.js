const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { colors } = require('../config.json'); 

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

function createMusicEmbed(music) {
  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`🎶 **${music.cleanTitle}**`)
    .setURL(music.url)
    .setAuthor({ name: music.author })
    .setThumbnail(music.thumbnail)
    .setFooter({ text: 'Durée: ' + music.duration })
    .setTimestamp();
}

function createMusicComponents(){
  const backButton = new ButtonBuilder()
  .setCustomId('back')
  .setLabel('⏮️')
  .setStyle(ButtonStyle.Primary);

  const pauseButton = new ButtonBuilder()
    .setCustomId('pause')
    .setLabel('⏸️')
    .setStyle(ButtonStyle.Secondary);

  const forwardButton = new ButtonBuilder()
    .setCustomId('forward')
    .setLabel('⏭️')
    .setStyle(ButtonStyle.Primary);

  const volumeUpButton = new ButtonBuilder()
    .setCustomId('volume_up')
    .setLabel('🔊')
    .setStyle(ButtonStyle.Success);

  const volumeDownButton = new ButtonBuilder()
    .setCustomId('volume_down')
    .setLabel('🔉')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder()
    .addComponents(backButton, pauseButton, forwardButton, volumeUpButton, volumeDownButton);

  return row;
}

function createGameEmbed(game) {
  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(game.title)
    .setDescription(game.description)
    .setThumbnail(game.gameImage)
    .setFooter({ text: `Prix d\'origine: ${game.originalPrice}` });

    if (game.startDate != "N/A") {
      embed.addFields({ name: 'Gratuit: ', value: ` ${game.startDate} - ${game.endDate}`, inline: false });
    }

    if (game.upcomingStartDate != "N/A") {
      embed.addFields({ name: 'Prochainement: ', value: ` ${game.upcomingStartDate} - ${game.upcomingEndDate}`, inline: false });
    }

    return embed;
}

module.exports = {
  createMusicComponents,
  createMusicEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createWarningEmbed,
  createImageEmbed,
  createGameEmbed
};