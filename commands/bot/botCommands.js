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
        var embed = null;
        var result = await restart(interaction);    
        if (result.success) {
          embed = createSuccessEmbed('Redémarrage du bot','Le bot a été redémarré avec succès !');
        } else {
          embed = createErrorEmbed('Erreur de redémarrage','Impossible de redémarrer le bot.');
        }
        await interaction.reply({ content: '', embeds: [embed], ephemeral: true });
        break;

      case 'reload_config':
        var embed = null;
        var result = await loadConfig();
        if (result.success) {
          embed = createSuccessEmbed('Rechargement du fichier de configuration','Le fichier de configuration a été rechargé avec succès !');      
        } else {
          embed = createErrorEmbed('Erreur de rechargement','Impossible de recharger le fichier de configuration. Veuillez vérifier le fichier.');
        }
        await interaction.reply({ content: '', embeds: [embed], ephemeral: false });
        break; 

    }
  }
};