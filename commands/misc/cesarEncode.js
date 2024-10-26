const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed } = require('../../utils/embedTemplates');
const { cesarEncode } = require('../../utils/commandLogic/cesar');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('encode')
    .setDescription('Encode un texte avec le chiffre de César.')
    .addStringOption(option => 
      option.setName('texte')
        .setDescription('Le texte à encoder.')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('decalage')
        .setDescription('Le décalage à utiliser pour le chiffrement.')
        .setRequired(true)),
    
  async execute(interaction) {
    const text = interaction.options.getString('texte');
    const shift = interaction.options.getInteger('decalage');

    if (isNaN(shift)) {
      return interaction.reply('Le décalage doit être un nombre.');
    }

    const encodedText = cesarEncode(text, shift);

    const embed = createSuccessEmbed(
      'Texte encodé avec le chiffre de César',
      `Texte original : \`${text}\`\nDécalage : \`${shift}\`\nTexte encodé : \`${encodedText}\``
    );

    await interaction.reply({ embeds: [embed] });
  },
};