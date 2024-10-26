const { SlashCommandBuilder } = require('discord.js');
const { createSuccessEmbed, createErrorEmbed } = require('../../utils/embedTemplates');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reloadconfig')
    .setDescription('Recharge le fichier de configuration'),

  async execute(interaction) {
    try {
        const configPath = path.resolve(__dirname, '../config.json');
        global.configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
        const embed = createSuccessEmbed(
          'Rechargement du fichier de configuration',
          'Le fichier de configuration a été rechargé avec succès !'
        );
  
        await interaction.reply({ content: '', embeds: [embed], ephemeral: false });
        
      } catch (error) {
        console.error('Erreur lors du rechargement du fichier de configuration :', error);
  
        const errorEmbed = createErrorEmbed(
          'Erreur de rechargement',
          'Impossible de recharger le fichier de configuration. Veuillez vérifier le fichier.'
        );
  
        await interaction.reply({ content: '', embeds: [errorEmbed], ephemeral: false });
      }
    },
  };