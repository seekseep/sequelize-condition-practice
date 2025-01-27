const { DataTypes } = require('sequelize');
const sequelize = require('../interface/sequelize');

const ItemGroup = sequelize.define('ItemGroup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ItemGroups',
  freezeTableName: false,
});

module.exports = ItemGroup
