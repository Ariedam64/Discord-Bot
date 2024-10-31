const { SlashCommandBuilder } = require('discord.js');
const { MusicPlayer, players } = require('../../utils/commandLogic/musicUtils');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Jouer, Créer et Contrôler la musique')
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('Jouer une musique YouTube')
        .addStringOption(option => 
          option.setName('url')
            .setDescription('URL de la vidéo YouTube')
            .setRequired(true)
          )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Arrêter la musique')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('tracks')
        .setDescription('Afficher la liste des pistes en file d\'attente')
    ),

  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: 'Vous devez être dans un salon vocal pour utiliser cette commande.', ephemeral: true });
    }

    if (!players[guildId]) {
      players[guildId] = new MusicPlayer(interaction);
    }

    const player = players[guildId];

    switch (subcommand) {
      case 'play':
        const url = interaction.options.getString('url');
        await player.startPlaying(url, interaction);
        break;
      case 'stop':
        await player.stopPlaying(interaction);
        break;
      case 'tracks':
        await player.displayQueue(interaction);
        break;
    }

  },
};