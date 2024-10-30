const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { players } = require('../utils/commandLogic/musicUtils');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return; // Ignorer les réactions des bots

    const currentPlayer = players[reaction.message.guild.id]

    try {
      switch (reaction.emoji.name) {
        case '⏮️':
          currentPlayer.playPreviousSong();
          break;
        case '⏸️':
          currentPlayer.togglePause();
          break;
        case '⏭️':
          currentPlayer.playNextSong();
          break;
        case '🔉':
          currentPlayer.decreaseVolume();
          break;
        case '🔊':
          currentPlayer.increaseVolume();
          break;
        case '🔀':
          currentPlayer.toogleShuffle();
          break;
        case '🔁':
          currentPlayer.toggleLoop();
          break;
      }

      await reaction.users.remove(user.id);
    } catch (error) {
      console.error('Erreur lors du traitement de la réaction :', error);
    }
  },
};