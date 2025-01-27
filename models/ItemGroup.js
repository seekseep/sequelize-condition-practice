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
}, {
  tableName: 'ItemGroups',
  freezeTableName: false,
  timestamps: false,
});

module.exports = ItemGroup
