const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed } = require('../../utils/embedTemplates');
const { cesarDecode } = require('../../utils/commandLogic/cesar');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('decode')
    .setDescription('Décode un texte chiffré avec le chiffre de César.')
    .addStringOption(option =>
      option.setName('texte')
        .setDescription('Le texte à décoder.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('decalage')
        .setDescription('Le décalage utilisé pour le chiffrement.')
        .setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString('texte');
    const shift = interaction.options.getInteger('decalage');

    if (isNaN(shift)) {
      return interaction.reply('Le décalage doit être un nombre.');
    }

    const decodedText = cesarDecode(text, shift);

    const embed = createSuccessEmbed(
      'Texte décodé avec le chiffre de César',
      `Texte chiffré : \`${text}\`\nDécalage : \`${shift}\`\nTexte décodé : \`${decodedText}\``
    );

    await interaction.reply({ embeds: [embed] });
  },
};