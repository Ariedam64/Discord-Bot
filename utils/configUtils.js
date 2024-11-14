const fs = require('fs');
const path = require('path');

let config = {};
const configPath = path.resolve(__dirname, '../config.json');

function loadConfig() {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return { success: true, message: 'Configuration file loaded successfully.' };
    } catch (error) {
        console.error('An error occurred while loading the configuration file:', error);
        return { success: false, message: 'An error occurred while loading the configuration file:',error };
    }
}

function getConfig() {
    return config;
}

module.exports = {
    loadConfig,
    getConfig
};