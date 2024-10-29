const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { colors } = require('../config.json'); 

function formatNumber(num) {
  if (num >= 1e9) {
      return (num / 1e9).toFixed(0) + 'B'; // Milliards
  } else if (num >= 1e6) {
      return (num / 1e6).toFixed(0) + 'M'; // Millions
  } else if (num >= 1e3) {
      return (num / 1e3).toFixed(0) + 'k'; // Milliers
  } else {
      return num.toString(); // Retourne le nombre tel quel s'il est inférieur à 1000
  }
}

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

  const fields = [];

  fields.push({ name: 'Durée', value: music.duration, inline: true });
  fields.push({ name: 'Vues', value: formatNumber(music.views), inline: true });

  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`🎶 **${music.cleanTitle}**`)
    .setURL(music.url)
    .setThumbnail(music.thumbnail)
    .addFields(fields)
    .setTimestamp()
}

function createLyricsEmbed(lyrics=null) {

  const SyncedLyrics = lyrics || 'Non disponible';

  return new EmbedBuilder()
    .setColor(colors.info)
    .setTitle('🎤 Lyrics synchronisées 🎤')
    .setDescription(SyncedLyrics);
}

function createGameEmbed(game, isUpcoming) {
  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(game.title)
    .setDescription(game.description)
    .setThumbnail(game.gameImage)
    .setFooter({ text: `Prix d\'origine: ${game.originalPrice}` });

    if (game.startDate != "N/A") {
      embed.addFields({ name: 'Gratuit', value: ` ${game.startDate} - ${game.endDate}`, inline: false });
    }

    if (isUpcoming && game.upcomingStartDate != "N/A") {
      embed.addFields({ name: 'Prochainement', value: ` ${game.upcomingStartDate} - ${game.upcomingEndDate}`, inline: false });
    }

    return embed;
}

function createDetailAnimeEmbed(anime) {

  const fields = [];

  const animeUrl = anime.trailer.url ? anime.trailer.url : anime.url;
  if (anime.score) {fields.push({ name: 'Score', value: `⭐ ${anime.score}`, inline: true });}
  if (anime.popularity) {fields.push({ name: 'Popularité', value: `📈 ${anime.popularity}`, inline: true });}
  if (anime.rank) {fields.push({ name: 'Classement', value: `🏆 #${anime.rank}`, inline: true });}
  

  const embed = new EmbedBuilder()
    .setColor(colors.info)
    .setTitle(`${anime.titles[0].title} (${anime.type})`)
    .setURL(animeUrl)
    .setImage(anime.images.webp.large_image_url)
    .setDescription( anime.synopsis ? anime.synopsis : 'Synopsis non disponible')
    .addFields(fields);

    return embed;
}

module.exports = {
  createLyricsEmbed,
  createMusicEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createWarningEmbed,
  createImageEmbed,
  createGameEmbed,
  createDetailAnimeEmbed
};