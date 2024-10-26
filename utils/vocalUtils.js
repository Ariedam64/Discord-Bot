const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { createSuccessEmbed, createErrorEmbed } = require('./embedTemplates');

async function joinVoice(interaction) {
  const channel = interaction.member.voice.channel;

  if (!channel) {
    const errorEmbed = createErrorEmbed('Tu dois être dans un salon vocal pour que je puisse te rejoindre.');
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const embed = createSuccessEmbed(
      `Connexion au salon vocal ${channel.name}`,
      'Le bot s\'est connecté avec succès !'
    );

    await interaction.reply({ content: '', embeds: [embed], ephemeral: true });
    return connection;

  } catch (error) {
    console.error('Erreur lors de la tentative de connexion au salon vocal :', error);
    const errorEmbed = createErrorEmbed('Impossible de rejoindre le salon vocal. Une erreur est survenue.');
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

async function leaveVoice(interaction) {
  const channel = interaction.member.voice.channel;

  if (!channel) {
    const errorEmbed = createErrorEmbed('Tu dois être dans un salon vocal pour que je puisse quitter.');
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  try {
    const connection = getVoiceConnection(channel.guild.id); 
    if (connection) {
      connection.destroy(); 

      const successEmbed = createSuccessEmbed(
        `Déconnexion du salon vocal ${channel.name}`,
        'Le bot a quitté le salon vocal avec succès !'
      );
      await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } else {
      const errorEmbed = createErrorEmbed('Le bot n\'est connecté à aucun salon vocal dans ce serveur.');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

  } catch (error) {
    console.error('Erreur lors de la déconnexion du salon vocal :', error);
    const errorEmbed = createErrorEmbed('Impossible de quitter le salon vocal. Une erreur est survenue.');
    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}

module.exports = {
  joinVoice,
  leaveVoice,
};