const { DataTypes } = require('sequelize');
const sequelize = require('../interface/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Users',
  freezeTableName: false,
});

module.exports = User;
