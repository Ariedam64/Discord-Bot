const { getConfig } = require('./configUtils');
const { OpenAI } = require('openai');
require('dotenv').config();


let messageHistory = [];
let messagesLimit = 20;
const configData = getConfig();
let currentContext = getConfig().bot.default_context;
let botName = getConfig().bot.name;
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function changeBotContext(chosenContext) {
    if (configData.contexts[chosenContext]) {
        setCurrentContext(chosenContext);
        resetMessageHistory()
        const description = configData.contexts[chosenContext].description;
        return description;
    }
}

async function generateImage(description) {
    try {
        const response = await client.images.generate({
        model: "dall-e-2",
        prompt: description,
        n: 1, 
        size: "512x512",
        });

        const imageUrl = response.data[0].url;
        return imageUrl;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}


const addMessageToHistory = (user, content) => {
    messageHistory.push({ user, content });
    if (messageHistory.length > messagesLimit) {
        messageHistory.shift();
    }
};

const cleanAssistantMessage = (content) => {
    const regex = new RegExp(`^${botName}\\s*:\\s*`, 'i');
    return content.replace(regex, '');
}

const resetMessageHistory = () => {
    messageHistory = [];
};

const setCurrentContext = (context) => {
    currentContext = context;
};

const getMessageHistory = (receivedMessage) => {
    return messageHistory.map(msg => ({
        role: msg.user === receivedMessage.client.user.username ? 'assistant' : 'user',
        content: `${msg.user}: ${msg.content}`
    }));
}

const getContextMessages = () => getConfig().contexts[currentContext].messages;

const getCurrentContext = () => currentContext;

const getBotName = () => botName;





module.exports = {
    getMessageHistory,
    addMessageToHistory,
    resetMessageHistory,
    setCurrentContext,
    getCurrentContext,
    getContextMessages,
    getBotName,
    cleanAssistantMessage,
    generateImage,
    client,
    changeBotContext,
};