const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Suppression des commandes globales...');

    const commands = await rest.get(Routes.applicationCommands(clientId));

    for (const command of commands) {
      await rest.delete(`${Routes.applicationCommands(clientId)}/${command.id}`);
      console.log(`Commande supprimée : ${command.name}`);
    }

    console.log('Toutes les commandes globales ont été supprimées.');
  } catch (error) {
    console.error(error);
  }
})();