const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

global.configData = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
global.botName = "Arie"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Charger les commandes
client.slashCommands = new Collection();
const slashCommandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
  const command = require(`./commands/${file}`);
  client.slashCommands.set(command.data.name, command);
}

// Charger les événements
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    const command = client.slashCommands.get(interaction.commandName);
  
    if (!command) return;
  
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Il y a eu une erreur en exécutant cette commande!', ephemeral: true });
    }
  });

client.login(DISCORD_TOKEN);
