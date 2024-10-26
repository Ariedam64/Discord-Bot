const { Player } = require('discord-player');
const { YoutubeiExtractor } = require("discord-player-youtubei")

module.exports = (client) => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  client.player = new Player(client, {
    initialVolume: 10,
    ytdlOptions: {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    }
  });

  client.player.extractors.register(YoutubeiExtractor, {
    authentication: process.env.OAUTH_TOKEN
  });
};