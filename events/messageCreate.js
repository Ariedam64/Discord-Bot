const { OpenAI } = require('openai');
const { getConfig } = require('../handlers/configHandler');
const { getMessageHistory, addMessageToHistory, getContextMessages, cleanAssistantMessage } = require('../handlers/GPTHandler');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    var userMessage = message.content.trim();
    var userName = message.author.username;

    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach((user) => {
        userMessage = userMessage.replace(`<@${user.id}>`, `@${user.username}`);
      });
    }

    if (message.embeds.length < 1) {
      addMessageToHistory(userName, userMessage);
    }

    if (message.mentions.has(message.client.user) && !message.author.bot) {

      try {
        
        const contextMessages = getContextMessages();
        const historyMessages = getMessageHistory(message);

        const gptResponse = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            ...contextMessages,
            ...historyMessages,
            { role: 'user', content: userMessage }
          ],
        });

        const gptMessage = cleanAssistantMessage(gptResponse.choices[0].message.content);

        const maxMessageLength = 2000;
        let messageParts = [];

        for (let i = 0; i < gptMessage.length; i += maxMessageLength) {
          messageParts.push(gptMessage.slice(i, i + maxMessageLength));
        }

        for (const part of messageParts) {
          await message.reply(part);
        }

      } catch (error) {
        if (error.code === 50013) {
          console.error("Le bot n'a pas les permissions pour envoyer un message dans ce canal.");
        } else {
          console.error("Erreur avec GPT :", error);
        }
      }
    }
  },
};
