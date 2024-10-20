# Discord Bot - Arie

## Description
Arie est un bot Discord multifonction que vous pouvez utiliser pour des interactions amusantes, des jeux comme Puissance 4, des réponses automatiques à des mentions grâce à l'API OpenAI (GPT), et bien plus encore. Ce bot est hébergé sur Heroku et peut être maintenu en ligne 24/7 à l'aide de services comme UptimeRobot.

## Prérequis
- Node.js (version 16.6.0 ou supérieure)
- NPM (ou Yarn)
- Un compte Heroku
- Un compte UptimeRobot (si vous souhaitez maintenir le bot actif sur Heroku)

## Fonctionnalités principales
- **Réponses automatiques GPT** : le bot peut répondre automatiquement aux messages qui le mentionnent, en utilisant OpenAI.
- **Jeux interactifs** : Jouez à des jeux comme Puissance 4 directement dans Discord avec vos amis.
- **Commandes slash personnalisées** : Interagissez avec le bot grâce à des commandes slash pratiques.
- **Hébergement sur Heroku** : Hébergez facilement le bot sur Heroku avec une configuration automatique.
- **Maintien en ligne avec UptimeRobot** : Gardez le bot en ligne 24/7 grâce à des pings réguliers via UptimeRobot.

## Installation locale
1. Clonez le projet
    ```bash
    git clone https://github.com/ton-utilisateur/nom-du-repo.git
    cd nom-du-repo
    ```
2. Installez les dépendances
    ```bash
    npm install
    ```
3. Créez un fichier `.env`
    Créez un fichier `.env` à la racine du projet avec les variables suivantes :
    ```makefile
    DISCORD_TOKEN=ton-token-discord
    OPENAI_API_KEY=ta-cle-openai
    CLIENT_ID=ton-client-id
    GUILD_ID=ton-guild-id
    HEROKU_API_KEY=ta-cle-heroku
    HEROKU_APP_NAME=nom-de-ton-app-heroku
    UPTIME_ROBOT_API_KEY=ta-cle-uptimerobot
    ```
4. Déploiement local
    Pour lancer le bot en local, exécutez la commande suivante :
    ```bash
    npm start
    ```
    Le bot se connectera à Discord et sera prêt à être utilisé.

## Déploiement sur Heroku
1. Installation de l'Heroku CLI
    Si vous ne l'avez pas encore, téléchargez et installez l'outil CLI de Heroku depuis [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

2. Créez une application Heroku
    ```bash
    heroku create nom-de-ton-bot
    ```
3. Définissez les variables d'environnement pour Discord et OpenAI :
    ```bash
    heroku config:set DISCORD_TOKEN=ton-token-discord
    heroku config:set OPENAI_API_KEY=ta-cle-openai
    heroku config:set CLIENT_ID=ton-client-id
    heroku config:set GUILD_ID=ton-guild-id
    heroku config:set HEROKU_API_KEY=ta-cle-heroku
    heroku config:set HEROKU_APP_NAME=nom-de-ton-app-heroku
    heroku config:set UPTIME_ROBOT_API_KEY=ta-cle-uptimerobot
    ```

4. Démarrez les dynos sur Heroku Exécutez les commandes suivantes pour démarrer les dynos web et worker sur Heroku :
    ```bash
    heroku ps:scale web=1
    heroku ps:scale worker=1
    ```
5. Déployez sur Heroku
    Poussez votre code vers Heroku pour déployer votre bot :
    ```bash
    git push heroku master
    ```

6. Utilisation d'UptimeRobot pour maintenir le bot en ligne
    Configurez UptimeRobot pour pinger l'URL de votre application Heroku toutes les 5 minutes afin de la maintenir active.

## Structure du Projet
- [index.js] : fichier principal où le bot est initialisé.
- [commands] : contient les fichiers de commandes slash personnalisées.
- [events] : contient les événements auxquels le bot réagit.
- [utils] : contient des fonctions utilitaires.
- [embeds] : gestion des messages formatés en embed pour une meilleure présentation sur Discord.

## Technologies utilisées
- **Discord.js** : pour l'interaction avec l'API Discord.
- **Express** : utilisé pour créer un serveur léger pour les pings UptimeRobot.
- **Heroku** : plateforme d'hébergement du bot.
- **OpenAI API** : pour les réponses GPT aux utilisateurs.

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à soumettre une issue ou à ouvrir une pull request.