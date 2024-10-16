const { OpenAI } = require('openai');
const  { config } = require('dotenv');

config()

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
  });

// Créer un objet pour stocker les conversations (clé : ID utilisateur)
const conversations = {};

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.mentions.has(message.client.user) && !message.author.bot) {
      const userId = message.author.id;
      const userName = message.author.userName
      const userMessage = message.content.replace(`<@${message.client.user.id}>`, '').trim();

      if (userMessage.length === 0) {
        return message.reply('?');
      }

      if (!conversations[userId]) {
        conversations[userId] = [
            { role: 'system', content: 'You are a very sarcastic and rude AI. You speak with a lot of humor, irony, and you don\'t hold back from using vulgar or familiar language. You often tease users with crude jokes, and you don\'t care about politeness, but always keep your responses short and to the point.' }
        ];
      }

      conversations[userId].push({ role: 'user', content: `${userName} said: ${userMessage}` });

      if (conversations[userId].length > 10) {
        conversations[userId].shift();
      }

      try {
        const gptResponse = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: conversations[userId],
        });

        const gptMessage = gptResponse.choices[0].message.content;

        conversations[userId].push({ role: 'assistant', content: gptMessage });

        await message.reply(gptMessage);
      } catch (error) {
        console.error('Erreur avec GPT :', error);
        await message.reply('Je suis désolé, il y a eu une erreur en traitant ta demande.');
      }
    }
  },
};