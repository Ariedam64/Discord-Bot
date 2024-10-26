const fs = require('fs');
const path = require('path');
const { Collection, REST, Routes } = require('discord.js');

module.exports = async (client) => {
  client.commands = new Collection();
  const commands = [];

  const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));

  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, `../commands/${folder}`)).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};