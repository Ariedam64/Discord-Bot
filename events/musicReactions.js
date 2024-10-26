const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  name: Events.MessageReactionAdd,
  async execute(reaction, user) {
    if (user.bot) return; // Ignorer les réactions des bots

    const player = useMainPlayer();
    const queue = player.nodes.get(reaction.message.guild.id);

    if (!queue || (!queue.node.isPlaying() && !queue.node.isPaused())) {
      console.log("Queue found but not playing");
      return;
    }

    let currentVolume = queue.node.volume;

    try {
      switch (reaction.emoji.name) {
        case '⏮️':
          console.log("back");
          if (queue.history.previousTrack) {
            queue.history.back();
          }
          break;
        case '⏸️':
          if (queue.node.isPaused()) {
            queue.node.resume();
          } else {
            queue.node.pause();
          }
          break;
        case '⏭️':
          console.log("forward");
          if (queue.tracks.length > 0) {
            queue.node.skip();
          }
          break;
        case '🔉':
          console.log("volume down");
          console.log(currentVolume);
          if (currentVolume > 0) {
            queue.node.setVolume(currentVolume - 5);
          }
          break;
        case '🔊':
          console.log("volume up");
          console.log(currentVolume);
          if (currentVolume < 100) {
            queue.node.setVolume(currentVolume + 5);
          }
          break;
      }

      await reaction.users.remove(user.id);
    } catch (error) {
      console.error('Erreur lors du traitement de la réaction :', error);
    }
  },
};