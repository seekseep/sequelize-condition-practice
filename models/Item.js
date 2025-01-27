const { DataTypes } = require('sequelize');
const sequelize = require('../interface/sequelize');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  itemGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'Items',
  freezeTableName: false,
  timestamps: false,
});

module.exports = Item
