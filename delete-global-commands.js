const { REST, Routes } = require('discord.js');
require('dotenv').config();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Suppression des commandes globales...');

    const commands = await rest.get(Routes.applicationCommands(DISCORD_CLIENT_ID));

    for (const command of commands) {
      await rest.delete(`${Routes.applicationCommands(DISCORD_CLIENT_ID)}/${command.id}`);
      console.log(`Commande supprimée : ${command.name}`);
    }

    console.log('Toutes les commandes globales ont été supprimées.');
  } catch (error) {
    console.error(error);
  }
})();