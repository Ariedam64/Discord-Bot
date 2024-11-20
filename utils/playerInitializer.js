const { Player } = require('discord-player');
const { YoutubeiExtractor } = require("discord-player-youtubei")

module.exports = (client) => {
  client.player = new Player(client, {
    ytdlOptions: {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    }
  });

  client.player.extractors.register(YoutubeiExtractor, {
  });
};