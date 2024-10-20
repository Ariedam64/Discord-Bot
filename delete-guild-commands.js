const { REST, Routes } = require('discord.js');
require('dotenv').config();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Suppression des commandes spécifiques au serveur...');

    const commands = await rest.get(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID));

    for (const command of commands) {
      await rest.delete(`${Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID)}/${command.id}`);
      console.log(`Commande supprimée : ${command.name}`);
    }

    console.log('Toutes les commandes spécifiques au serveur ont été supprimées.');
  } catch (error) {
    console.error(error);
  }
})();