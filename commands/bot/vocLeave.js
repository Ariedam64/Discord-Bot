const { SlashCommandBuilder } = require('discord.js');
const { leaveVoice } = require('../../utils/vocal.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('vocleave')
    .setDescription('Permettre au bot de quitter un salon vocal'),

  async execute(interaction) {
    await leaveVoice(interaction);
  },
};