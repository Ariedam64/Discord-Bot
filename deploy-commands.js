const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('fs');

const commands = [];

// Charger les slash commands du dossier commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Déploiement des slash commands...');

    // Enregistrer les commandes pour un serveur spécifique (Guild commands)
    // await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log('Commandes enregistrées avec succès.');
  } catch (error) {
    console.error(error);
  }
})();