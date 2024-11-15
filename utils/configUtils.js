const fs = require('fs');
const path = require('path');

let config = {};
const configPath = path.resolve(__dirname, '../config.json');

function loadConfig() {
    try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return { success: true, title: 'Rechargement du fichier de configuration', message: 'Le fichier de configuration a été chargé !' };
    } catch (error) {
        console.error('An error occurred while loading the configuration file:', error);
        return { success: false, title: 'Rechargement du fichier de configuration', message: 'Une erreur est survenue lors du chargement du fichier de configuration:', error };
    }
}

function getConfig() {
    return config;
}

module.exports = {
    loadConfig,
    getConfig
};