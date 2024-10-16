const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Suppression des commandes spécifiques au serveur...');

    const commands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

    for (const command of commands) {
      await rest.delete(`${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`);
      console.log(`Commande supprimée : ${command.name}`);
    }

    console.log('Toutes les commandes spécifiques au serveur ont été supprimées.');
  } catch (error) {
    console.error(error);
  }
})();