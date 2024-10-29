
module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState) {
      // Détecter si quelqu'un rejoint un canal vocal
      if (!oldState.channel && newState.channel) {
        console.log(`${newState.member.user.tag} a rejoint le salon vocal ${newState.channel.name}.`);
      }
  
      // Détecter si quelqu'un quitte un canal vocal
      if (oldState.channel && !newState.channel) {
        console.log(`${oldState.member.user.tag} a quitté le salon vocal ${oldState.channel.name}.`);
      }
  
      // Détecter si quelqu'un passe de mute à unmute ou inversement
      if (oldState.channelId === newState.channelId) {
        if (oldState.selfMute !== newState.selfMute) {
          if (newState.selfMute) {
            console.log(`${newState.member.user.tag} s'est mute.`);
          } else {
            console.log(`${newState.member.user.tag} s'est unmute.`);
          }
        }
      }
    },
  };