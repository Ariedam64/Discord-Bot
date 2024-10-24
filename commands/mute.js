const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../embeds/embedTemplates.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute/démute le bot et vérifie si le son est coupé'),

  async execute(interaction) {
    const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

    if (!botMember.voice.channel) {
      const errorEmbed = createErrorEmbed('Je ne suis pas dans un salon vocal.');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (botMember.voice.serverMute) {
      await botMember.voice.setMute(false, 'Démute via commande');
      
      if (botMember.voice.serverDeaf) {
        await botMember.voice.setDeaf(false, 'Son activé via commande');
      }

      const successEmbed = createSuccessEmbed(
        'Bot démute',
        'Le bot a été démute avec succès et le son a été activé si coupé.'
      );
      return interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } else {
      await botMember.voice.setMute(true, 'Mute via commande');
      
      const successEmbed = createSuccessEmbed(
        'Bot mute',
        'Le bot a été mute avec succès.'
      );
      return interaction.reply({ embeds: [successEmbed], ephemeral: true });
    }
  },
};