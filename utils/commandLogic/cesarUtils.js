const { createSuccessEmbed } = require("../../templates/embedTemplates");

async function cesarEncode(text, shift, interaction) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const shiftedText = text.toLowerCase();
    let encodedText = '';
  
    for (let i = 0; i < shiftedText.length; i++) {
      const currentChar = shiftedText[i];
  
      if (alphabet.includes(currentChar)) {
        const currentIndex = alphabet.indexOf(currentChar);
        let newIndex = (currentIndex + shift) % 26;
        if (newIndex < 0) newIndex += 26;
        encodedText += alphabet[newIndex];
      } else {
        encodedText += currentChar;
      }
    }

    const embed = createSuccessEmbed(
      'Texte encodé avec le chiffre de César',
      `Texte original : \`${text}\`\nDécalage : \`${shift}\`\nTexte encodé : \`${encodedText}\``
    );

    await interaction.reply({ embeds: [embed] });

  }

  async function cesarDecode(text, shift, interaction) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const shiftedText = text.toLowerCase();
    let decodedText = '';
  
    for (let i = 0; i < shiftedText.length; i++) {
      const currentChar = shiftedText[i];
  
      if (alphabet.includes(currentChar)) {
        const currentIndex = alphabet.indexOf(currentChar);
        let newIndex = (currentIndex - shift + 26) % 26;
        decodedText += alphabet[newIndex];
      } else {
        decodedText += currentChar;
      }
    }

    const embed = createSuccessEmbed(
      'Texte décodé avec le chiffre de César',
      `Texte chiffré : \`${text}\`\nDécalage : \`${shift}\`\nTexte décodé : \`${decodedText}\``
    );

    await interaction.reply({ embeds: [embed] });
  }

  function splitBruteForceDescription(results, maxLength) {

    let desc = '';
    results.forEach(result => {
      desc += `Décalage : \`${result.shift}\`\nTexte décodé : \`${result.decodedText}\`\n\n`;
    });

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

  async function cesarBruteforce(text, interaction) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const shiftedText = text.toLowerCase();
    let results = [];
  
    for (let shift = 1; shift < 26; shift++) {
      let decodedText = '';
  
      for (let i = 0; i < shiftedText.length; i++) {
        const currentChar = shiftedText[i];
  
        if (alphabet.includes(currentChar)) {
          const currentIndex = alphabet.indexOf(currentChar);
          let newIndex = (currentIndex - shift + 26) % 26; 
          decodedText += alphabet[newIndex];
        } else {
          decodedText += currentChar;
        }
      }
  
      results.push({
        shift: shift,
        decodedText: decodedText,
      });
    }

    const parts = splitBruteForceDescription(results, 2048);

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
  }

 
  module.exports = { cesarEncode, cesarDecode, cesarBruteforce };