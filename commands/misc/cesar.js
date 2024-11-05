const { SlashCommandBuilder } = require('discord.js');
const { cesarBruteforce, cesarEncode, cesarDecode } = require('../../utils/commandLogic/cesarUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cesar')
    .setDescription('Essaye toutes les combinaisons possibles du chiffre de César.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('encode')
        .setDescription('Encode un texte')
        .addStringOption(option => 
          option.setName('encode_text')
            .setDescription('Le texte à encoder')
            .setRequired(true)
          )
        .addIntegerOption(option =>
          option.setName('encode_shift')
            .setDescription('Le décalage utilisé pour le chiffrement')
            .setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('decode')
        .setDescription('Décode un texte')
        .addStringOption(option => 
          option.setName('decode_text')
            .setDescription('Le texte à décoder')
            .setRequired(true)
          )
        .addIntegerOption(option =>
          option.setName('decode_shift')
            .setDescription('Le décalage utilisé pour le déchiffrement')
            .setRequired(true)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('bruteforce')
        .setDescription('Décoder un texte avec bruteforce')
        .addStringOption(option => 
          option.setName('bruteforce_text')
            .setDescription('Le texte à décoder')
            .setRequired(true)
          )
    ),

  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        
        case 'encode':
          const encode_text = interaction.options.getString('encode_text');
          const encode_shift = interaction.options.getInteger('encode_shift');
          await cesarEncode(encode_text, encode_shift, interaction);
          break;
  
        case 'decode':
          const decode_text = interaction.options.getString('decode_text');
          const decode_shift = interaction.options.getInteger('decode_shift');
          await cesarDecode(decode_text, decode_shift, interaction);
          break;
  
        case 'bruteforce':
          const bruteforce_text = interaction.options.getString('bruteforce_text');
          await cesarBruteforce(bruteforce_text, interaction);
          break;
      }

  },
};