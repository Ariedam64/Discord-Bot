const { SlashCommandBuilder } = require('discord.js');
const { createErrorEmbed, createDetailAnimeEmbed } = require('../../templates/embedTemplates');
const { searchAnime } = require('../../utils/animeUtils');
const { addWithOptions } = require('date-fns/fp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('searchanime')
    .setDescription('Rechcerche un anime par son nom.')
    .addStringOption(option => 
        option.setName('anime')
          .setDescription('Le nom de l\'anime à rechercher.')
          .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('type')
          .setDescription('Le type de l\'anime à rechercher.')
          .setRequired(false)
          .addChoices(
              { name: 'TV', value: 'TV' },
              { name: 'Film', value: 'Movie' },
              { name: 'OVA', value: 'OVA' },
              { name: 'Special', value: 'Special' },
              { name: 'ONA', value: 'ONA' },
              { name: 'Musique', value: 'Music' },
            )
    )
    .addIntegerOption(option =>
        option.setName('limit')
          .setDescription('Le nombre de résultats à afficher. (entre 1 et 10)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(10)
    ),

    async execute(interaction) {
        try {

            const animeName = interaction.options.getString('anime');
            const animeType = interaction.options.getString('type');
            const animeLimit = interaction.options.getInteger('limit');
            const animeDataList = await searchAnime(animeName,animeLimit,animeType);

            if (animeDataList === null) {
            const errorEmbed = createErrorEmbed('Aucun anime trouvé avec ce nom.',);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            return;
            }

            const { embeds } = animeDataList.data.reduce((acc, anime) => {
                if (!acc.seenIds.has(anime.mal_id)) {
                    acc.seenIds.add(anime.mal_id);  
                    acc.embeds.push(createDetailAnimeEmbed(anime));  
                }
                return acc;  
            }, { seenIds: new Set(), embeds: [] });

            await interaction.reply({ embeds: [embeds[0]], ephemeral: false });
            for (let i = 1; i < embeds.length; i++) {
                await interaction.followUp({ embeds: [embeds[i]], ephemeral: false });
            }

            //const animeId = animeDataList.data[0].mal_id;
            //const animeDetails = await getAnimeDetails(animeId);

            //console.log(animeDetails);
        
            //const animeEmbed = createDetailAnimeEmbed(animeDetails);
            //await interaction.reply({ embeds: [animeEmbed], ephemeral: false });

        } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'anime :', error);

        const errorEmbed = createErrorEmbed(
            'Erreur de récupération',
            'Impossible de récupérer les détails de l\'anime.'
        );

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};