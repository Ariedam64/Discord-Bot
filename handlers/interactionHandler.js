const { players } = require('../utils/commandLogic/musicUtils'); 

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
      if (interaction.isCommand()) {
          const command = client.commands.get(interaction.commandName);

          if (!command) return;

          try {
              await command.execute(interaction);
          } catch (error) {
              console.error(error);
              await interaction.reply({ content: 'Il y a eu une erreur en exécutant cette commande!', ephemeral: true });
          }
      } else if (interaction.isButton()) {

        const musicPlayer = players[interaction.guild.id];
       
        if (!musicPlayer) {
            await interaction.reply({ content: 'Aucun lecteur de musique trouvé pour ce serveur.', ephemeral: true });
            return;
        }

        try {
          switch (interaction.customId) {
            case 'music_previous':
                await musicPlayer.playPreviousSong();
                break;
            case 'music_rewind':
                await musicPlayer.rewind();
                break;
            case 'music_pause':
                await musicPlayer.togglePause();
                break;
            case 'music_forward':
                await musicPlayer.forward();
                break;
            case 'music_next':
                await musicPlayer.playNextSong();
                break;
            case 'music_shuffle':
                await musicPlayer.toggleShuffle();
                break;
            case 'music_loop':
                await musicPlayer.toggleLoop();
                break;
            case 'music_loop_one':
                await musicPlayer.toggleLoopOne();
                break;
            case 'music_volume_down':
                await musicPlayer.decreaseVolume();
                break;
            case 'music_volume_up':
                await musicPlayer.increaseVolume();
                break;
            default:
                console.log(`Unhandled button interaction: ${interaction.customId}`);
        }

        await interaction.deferUpdate();
      } catch (error) {
          console.error(error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.followUp({ content: 'Il y a eu une erreur en exécutant cette action!', ephemeral: true });
          }}
    }
  });
};