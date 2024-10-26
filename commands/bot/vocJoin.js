const { SlashCommandBuilder } = require('discord.js');
const { joinVoice } = require('../../utils/vocal.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('vocjoin')
  .setDescription('Permettre au bot de rejoindre un salon vocal'),

  async execute(interaction) {
    await joinVoice(interaction);
  },
};