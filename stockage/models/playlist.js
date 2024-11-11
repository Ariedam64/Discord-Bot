const { DataTypes } = require('sequelize');
const { sequelize } = require('../database.js');

const Playlist = sequelize.define('Playlist', {
  serverId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Song = sequelize.define('Song', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Playlist.hasMany(Song, { as: 'songs' });
Song.belongsTo(Playlist);

module.exports = { Playlist, Song };