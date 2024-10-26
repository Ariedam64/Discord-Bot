const fs = require('fs');
const path = require('path');

let config = {};
const configPath = path.resolve(__dirname, '../config.json');

function loadConfig() {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function reloadConfig() {
    loadConfig();
}

function getConfig() {
    return config;
}

loadConfig();

module.exports = {
    loadConfig,
    reloadConfig,
    getConfig
};