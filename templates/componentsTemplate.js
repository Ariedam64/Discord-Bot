const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createMusicComponents(isPlaying = true, isShuffle= false, isLoop= false,isLoopOne= false, isPreviousSong= false, isNextSong= false,isMinVolume= true, isMaxVolume= false ) { 

    const playerRow1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('music_previous')
                .setEmoji('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!isPreviousSong),
            new ButtonBuilder()
                .setCustomId('music_rewind')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_pause')
                .setEmoji(isPlaying ? '⏸️' : '▶️')
                .setStyle(ButtonStyle.Secondary),   
            new ButtonBuilder()
                .setCustomId('music_forward')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_next')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!isNextSong),
        );

    const playerRow2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('music_shuffle')
                .setEmoji('🔀')
                .setStyle(isShuffle ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_loop')
                .setEmoji('🔁')
                .setStyle(isLoop ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_loop_one')
                .setEmoji('🔂')
                .setStyle(isLoopOne ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_volume_down')
                .setEmoji('🔉')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isMinVolume),
            new ButtonBuilder()
                .setCustomId('music_volume_up')
                .setEmoji('🔊')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isMaxVolume)
        );
    
    return [playerRow1, playerRow2];
}

module.exports = { createMusicComponents };