const { OpenAI } = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

global.messageHistory = [];
global.currentContext = "lambda_discord";

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    const userId = message.author.id;
    const userName = message.author.username;
    var userMessage = message.content.trim();


    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach((user) => {
        userMessage = userMessage.replace(`<@${user.id}>`, `@${user.username}`);
      });
    }

    if (message.embeds.length < 1) {
      global.messageHistory.push({
        user: userName,
        content: userMessage,
      });
    }

    if (global.messageHistory.length > 20) {
      global.messageHistory.shift();
    }

    if (message.mentions.has(message.client.user) && !message.author.bot) {

      let historyContext = '';
      global.messageHistory.forEach((msg) => {
        historyContext += `${msg.user}: ${msg.content}\n`;
      });

      try {
        const historyMessages = messageHistory.map(msg => ({
          role: msg.user === message.client.user.username ? 'assistant' : 'user',
          content: msg.user === message.client.user.username ? msg.content : `${msg.user}: ${msg.content}`
        }));

        const contextMessages = global.configData.contexts[currentContext].messages;

        const gptResponse = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            ...contextMessages,
            ...historyMessages,
            { role: 'user', content: userMessage }
          ],
        });

        const gptMessage = gptResponse.choices[0].message.content;

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
