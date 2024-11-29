const { Events } = require('discord.js');
const { players } = require('../utils/commandLogic/musicUtils');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return; // Ignorer les réactions des bots

  },
};