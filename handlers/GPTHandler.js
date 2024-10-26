const { getConfig } = require('./configHandler');

let messageHistory = [];
let messagesLimit = 20;
let currentContext = getConfig().bot.default_context;
let botName = getConfig().bot.name;

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
    cleanAssistantMessage
};