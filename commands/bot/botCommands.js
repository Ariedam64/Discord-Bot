const { SlashCommandBuilder } = require('discord.js');
const { status, reloadConfigFile, restart } = require('../../utils/commandLogic/botUtils');

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
        await restart(interaction);       
        break;
      case 'reload_config':
        await reloadConfigFile(interaction);
        break; 
    }
  }
};