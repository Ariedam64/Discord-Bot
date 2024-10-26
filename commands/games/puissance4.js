const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Player, Game } = require('../../utils/commandLogic/puissance4.js');

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
      const bot = interaction.client.user; // Bot comme joueur IA

      if (adversaire.id === interaction.user.id) {
        return interaction.reply("Vous ne pouvez pas jouer contre vous-même !");
      }

      const joueur1 = new Player(interaction.user);
      const joueur2 = new Player(adversaire);
      const game = new Game(joueur1, joueur2);

      let embed = new EmbedBuilder()
        .setTitle(`Puissance 4 : ${joueur1.user.username} vs ${joueur2.user.username}`)
        .setDescription(game.displayBoard())
        .setFooter({ text: `${game.getCurrentPlayer().color.replace('‎ ', '')}C'est à ${game.getCurrentPlayer().user.username} de jouer.` });

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });

      const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
      for (const reaction of reactions) {
        await message.react(reaction);
      }

      const filter = (reaction, user) => {
        return reactions.includes(reaction.emoji.name) && 
                (user.id === joueur1.user.id || user.id === joueur2.user.id);
      };

      const collector = message.createReactionCollector({ filter, time: 300000 });

      if (game.getCurrentPlayer().user.id === bot.id) {
        const bestMove = game.findBestMove();
        game.placeDisc(bestMove, game.players[1].color);
        game.switchPlayer();
      }


      embed = new EmbedBuilder()
            .setTitle(`Puissance 4: ${joueur1.user.username} VS ${joueur2.user.username}`)
            .setDescription(game.displayBoard())
            .setFooter({ text: game.winner ? `${game.winner.user.username} a gagné !` : `${game.getCurrentPlayer().color.replace('‎ ', '')} C'est à ${game.getCurrentPlayer().user.username} de jouer.` });

      await message.edit({ embeds: [embed] });

      collector.on('collect', async (reaction, user) => {
        try {
          const col = reactions.indexOf(reaction.emoji.name); 
          reaction.users.remove(user); 

          if (user.id !== game.getCurrentPlayer().user.id) { return; }

          if (!game.placeDisc(col, game.getCurrentPlayer().color)) {
            await interaction.followUp(`${user.username}, cette colonne est pleine. Choisissez une autre colonne.`);
            return;
          }

          if (game.checkWin()) {

            game.winner = game.getCurrentPlayer(); 
            collector.stop();

          } else{

            game.switchPlayer(); 

            if (game.getCurrentPlayer().user.id === bot.id) {
              const bestMove = game.findBestMove();
              game.placeDisc(bestMove, game.players[1].color);
  
              // Vérifier si le bot a gagné
              if (game.checkWin()) {
                game.winner = game.getCurrentPlayer();
                embed.setDescription(game.displayBoard())
                  .setFooter({ text: `${bot.username} a gagné !` });
                await message.edit({ embeds: [embed] });
                collector.stop();
                return;
              }
  
              game.switchPlayer(); 
            }
          }

          embed = new EmbedBuilder()
            .setTitle(`Puissance 4 : ${joueur1.user.username} vs ${joueur2.user.username}`)
            .setDescription(game.displayBoard())
            .setFooter({ text: game.winner ? `${game.winner.user.username} a gagné !` : `${game.getCurrentPlayer().color.replace('‎ ', '')} C'est à ${game.getCurrentPlayer().user.username} de jouer.` });

          await message.edit({ embeds: [embed] });
        } catch (error) {
          console.error('Erreur avec le collecteur de réactions :', error);
        }
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