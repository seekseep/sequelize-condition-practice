const { DataTypes } = require('sequelize');
const sequelize = require('../interface/sequelize');

const OrderDetail = sequelize.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  index: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  itemName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  itemGroupName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Items',
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'OrderDetails',
  freezeTableName: false,
});

module.exports = OrderDetail;
