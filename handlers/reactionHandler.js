
async function handlePuissance4Reaction(reaction, user, game, message, bot) {
  const reactions = game.reactions;
  const col = reactions.indexOf(reaction.emoji.name);

  reaction.users.remove(user);

  if (user.id !== game.getCurrentPlayer().user.id) { return; }

  if (!game.placeDisc(col, game.getCurrentPlayer().color)) {
    return;
  }

  if (game.checkWin()) {
    game.winner = game.getCurrentPlayer();
    await message.edit({ embeds: [game.drawBoardEmbed()] });
    message.reactions.removeAll();
    return;
  }

  game.switchPlayer();

  if (game.getCurrentPlayer().user.id === bot.id) {
    const bestMove = game.findBestMove();
    game.placeDisc(bestMove, game.players[1].color);

    if (game.checkWin()) {
      game.winner = game.getCurrentPlayer();
      await message.edit({ embeds: [game.drawBoardEmbed()] });
      message.reactions.removeAll();
      return;
    }

    game.switchPlayer();
  }

  await message.edit({ embeds: [game.drawBoardEmbed()] });
}

module.exports = {
  handlePuissance4Reaction
};