const axios = require('axios');
//const { translateSynopsis } = require('./translateUtils');

const API_URL = 'https://api.jikan.moe/v4';

async function searchAnime(animeTitle, limit = 1, type='tv', order_by='title', sort='asc') {
    try {
        const response = await axios.get(`${API_URL}/anime`, {
            params: {
                q: animeTitle,
                limit: limit,
                type: type,
                //order_by: order_by,
                //sort: sort
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching anime data from Jikan:', error);
        throw error;
    }
}

async function getAnimeDetails(animeId) {
    try {
        const response = await axios.get(`${API_URL}/anime/${animeId}/full`);
        return response.data;
    } catch (error) {
        console.error('Error fetching anime data from Jikan:', error);
        throw error;
    }
}


module.exports = {
    getAnimeDetails,
    searchAnime,
};