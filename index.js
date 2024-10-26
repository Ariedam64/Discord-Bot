const { Client, GatewayIntentBits } = require('discord.js');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const playerHandler = require('./handlers/playerHandler');
const interactionHandler = require('./handlers/interactionHandler');
const { loadConfig } = require('./handlers/configHandler');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});


(async () => {
  loadConfig(); //Charger le fichier de configuration au démarrage
  await commandHandler(client);
  eventHandler(client);
  playerHandler(client);
  interactionHandler(client);

  client.login(process.env.DISCORD_TOKEN);
})();