module.exports = {
    name: 'ping',
    description: 'Affiche la latence du bot.',
    async execute(message, args) {
      const sentMessage = await message.channel.send('Calcul du ping...');    
      const apiLatency = message.client.ws.ping; 
      const messageLatency = sentMessage.createdTimestamp - message.createdTimestamp;
      sentMessage.edit(`Message: \`${messageLatency}ms\`, API: \`${apiLatency}ms\``);
    },
  };