const { EmbedBuilder } = require('discord.js');
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

module.exports = {
  createSuccessEmbed,
  createErrorEmbed,
  createInfoEmbed,
  createWarningEmbed,
  createImageEmbed
};