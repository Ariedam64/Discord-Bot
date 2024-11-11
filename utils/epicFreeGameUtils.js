const { EpicFreeGames } = require('epic-free-games');
const cron = require('node-cron');
const { createGameEmbed } = require('../templates/embedTemplates');
const { format } = require('date-fns');
const { fr } = require('date-fns/locale');

const epicFreeGames = new EpicFreeGames({ country: 'FR', locale: 'fr', includeAll: true })

let currentGames = [];
let nextGames = [];

const extractGameDetails = (game) => {
    const Thumbnail = game.keyImages.find(image => image.type === 'Thumbnail');
    const promotionalOffers = game.promotions.promotionalOffers[0]?.promotionalOffers[0] || {};
    const upcomingPromotionalOffers = game.promotions.upcomingPromotionalOffers[0]?.promotionalOffers[0] || {};

    const formatDate = (date) => date ? format(new Date(date), 'dd MMM', { locale: fr }) : 'N/A';

    return {
        title: game.title,
        description: game.description,
        gameImage: Thumbnail?.url,
        startDate: formatDate(promotionalOffers.startDate),
        endDate: formatDate(promotionalOffers.endDate),
        upcomingStartDate: formatDate(upcomingPromotionalOffers.startDate),
        upcomingEndDate: formatDate(upcomingPromotionalOffers.endDate),
        originalPrice: game.price.totalPrice.fmtPrice.originalPrice,
    };
};

const fetchFreeGames = async () => {
    try {
        const res = await epicFreeGames.getGames();
        currentGames = res.currentGames.map(extractGameDetails);
        nextGames = res.nextGames.map(extractGameDetails);
        return { currentGames, nextGames };
    } catch (err) {
        console.log(err);
        return { currentGames: [], nextGames: [] };
    }
};

const sendGamesToChannel = async (client, channelName) => {

    const channel = client.channels.cache.find(channel => channel.name === channelName);

    if (!channel) {
        console.log(`Channel "${channelName}" not found`);
        return;
    }

    //Check if the last message is the same as the last game
    const lastMessage = await channel.messages.fetch({ limit: 1 });
    const lastMessageContent = lastMessage.first()?.embeds[0]?.title;
    const lastGameContent = nextGames[nextGames.length-1].title;
    if (lastMessageContent === lastGameContent) {
        //No new games
        return;
    }
    

    for (const game of currentGames) {
        const embed = createGameEmbed(game, false);
        await channel.send({ embeds: [embed] });
    }

    for (const game of nextGames) {
        const embed = createGameEmbed(game, true);
        await channel.send({ embeds: [embed] });
    }
}

const scheduleFreeGamesNotification = async (client) => {

    // Fetch and send free games
    await fetchFreeGames();
    sendGamesToChannel(client, process.env.EPIC_GAMES_FREE_GAMES_CHANNEL);

    // Schedule to send free games every Thursday at 6:00 AM
    cron.schedule('0 6 * * 4', async () => {
        await fetchFreeGames();
        await sendGamesToChannel(client, process.env.EPIC_GAMES_FREE_GAMES_CHANNEL);
    });
};

const getCurrentGames = () => currentGames;
const getNextGames = () => nextGames;

module.exports = { 
    getCurrentGames, 
    getNextGames,
    fetchFreeGames,
    sendGamesToChannel,
    scheduleFreeGamesNotification
};