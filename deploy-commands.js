const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const commands = [];

// Charger les slash commands du dossier commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Déploiement des slash commands...');

    // Enregistrer les commandes pour un serveur spécifique (Guild commands)
    // await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });

    console.log('Commandes enregistrées avec succès.');
  } catch (error) {
    console.error(error);
  }
})();