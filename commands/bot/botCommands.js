const { SlashCommandBuilder } = require('discord.js');
const { status, restart } = require('../../utils/commandLogic/botUtils');
const { loadConfig } = require('../../utils/configUtils');
const { createSuccessEmbed, createErrorEmbed } = require('../../templates/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot')
    .setDescription('Commandes liées au bot')
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Vérifie le statut du bot')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('restart')
        .setDescription('Redémarre le bot')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reload_config')
        .setDescription('Recharge le fichier de configuration')
    ),

  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {

      case 'status':
        await status(interaction);
        break;

      case 'restart':
        var result = await restart();    
        if (result.success) {
          await interaction.reply({ content: '', embeds: [createSuccessEmbed(result.title, result.message)], ephemeral: true });
        } else {
          await interaction.reply({ content: '', embeds: [createErrorEmbed(result.title, result.message)], ephemeral: true });
        }
        break;

      case 'reload_config':
        var result = await loadConfig();
        if (result.success) {
          await interaction.reply({ content: '', embeds: [createSuccessEmbed(result.title, result.message)], ephemeral: false }); 
        } else {
          await interaction.reply({ content: '', embeds: [createErrorEmbed(result.title, result.message)], ephemeral: false });
        }
        break; 

    }
  }
};