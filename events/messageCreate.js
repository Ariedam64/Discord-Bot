const { createErrorEmbed } = require('../embeds/errorEmbed');
const { suffix } = require('../config.json')

module.exports = {
    name: 'messageCreate',
    execute(message) {
      if (!message.content.startsWith(suffix) || message.author.bot) return;
  
      const args = message.content.slice(1).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (!message.client.commands.has(commandName)) {
        const errorEmbed = createErrorEmbed(`La commande !${commandName} n\'existe pas`);
        return message.channel.send({ embeds: [errorEmbed] });
      }
  
      const command = message.client.commands.get(commandName);
  
      if (!command) return;
  
      try {
        command.execute(message, args);
      } catch (error) {
        console.error(error);
        const errorEmbed = createErrorEmbed(`Il y a eu une erreur lors de l\'exécution de la commande !${commandName}`);
        message.channel.send({ embeds: [errorEmbed] });
      }
    },
  };
  