const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed } = require('../../utils/embedTemplates');
const { cesarBruteforce } = require('../../utils/commandLogic/cesar');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bruteforce')
    .setDescription('Essaye toutes les combinaisons possibles du chiffre de César.')
    .addStringOption(option =>
      option.setName('texte')
        .setDescription('Le texte à décoder avec bruteforce.')
        .setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString('texte');

    const results = cesarBruteforce(text);

    let description = '';
    results.forEach(result => {
      description += `Décalage : \`${result.shift}\`\nTexte décodé : \`${result.decodedText}\`\n\n`;
    });

    function splitDescription(desc, maxLength) {
      const parts = [];
      while (desc.length > maxLength) {
        let part = desc.slice(0, maxLength);
        const lastNewline = part.lastIndexOf('\n'); 
        if (lastNewline !== -1) {
          part = desc.slice(0, lastNewline);
        }
        parts.push(part);
        desc = desc.slice(part.length).trim();
      }
      parts.push(desc); 
      return parts;
    }

    const parts = splitDescription(description, 2048);

    const embed = createSuccessEmbed(
      'Résultats du bruteforce du chiffre de César',
      parts[0]
    );
    await interaction.reply({ embeds: [embed] });

    for (let i = 1; i < parts.length; i++) {
      const embedPart = createSuccessEmbed(
        `Résultats - partie ${i + 1}`,
        parts[i]
      );
      await interaction.followUp({ embeds: [embedPart] });
    }
  },
};