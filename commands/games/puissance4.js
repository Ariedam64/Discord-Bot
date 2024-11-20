const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Player, Game } = require('../../utils/commandLogic/puissance4Utils.js');
const { handlePuissance4Reaction } = require('../../handlers/reactionHandler.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('puissance4')
    .setDescription('Commence une partie de Puissance 4 avec un autre joueur.')
    .addUserOption(option => 
      option.setName('adversaire')
        .setDescription('Choisissez un adversaire.')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const adversaire = interaction.options.getUser('adversaire');
      const bot = interaction.client.user; // Bot as player 2

      if (adversaire.id === interaction.user.id) {
        return interaction.reply("Vous ne pouvez pas jouer contre vous-même !");
      }

      const joueur1 = new Player(interaction.user);
      const joueur2 = new Player(adversaire);
      const game = new Game(joueur1, joueur2);
      const reactions = game.reactions;
      const message = await interaction.reply({ embeds: [game.drawBoardEmbed()], fetchReply: true });


      for (const reaction of reactions) {
        await message.react(reaction);
      }

      const filter = (reaction, user) => {
        return reactions.includes(reaction.emoji.name) && 
                (user.id === joueur1.user.id || user.id === joueur2.user.id);
      };

      const collector = message.createReactionCollector({ filter, time: 300000 });
      game.collector = collector;

      if (game.getCurrentPlayer().user.id === bot.id) {
        const bestMove = game.findBestMove();
        game.placeDisc(bestMove, game.players[1].color);
        game.switchPlayer();
      }

      await message.edit({ embeds: [game.drawBoardEmbed()] });

      collector.on('collect', async (reaction, user) => {
        await handlePuissance4Reaction(reaction, user, game, message, bot);
      });

      collector.on('end', async () => {
        if (!game.winner) {
          game.winner = game.lastPlayer;
          await interaction.followUp(`${game.winner.user.username} a gagné car le temps est écoulé !`);
        }
        await message.reactions.removeAll();
      });
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande :', error);
      await interaction.reply('Une erreur est survenue lors de l\'exécution de la commande.');
    }
  },
};