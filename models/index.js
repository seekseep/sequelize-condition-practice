const sequelize = require('../interface/sequelize');

const Item = require('./Item');
const ItemGroup = require('./ItemGroup');
const User = require('./User');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');

ItemGroup.hasMany(Item, { foreignKey: 'itemGroupId', as: 'items' });
Item.belongsTo(ItemGroup, { foreignKey: 'itemGroupId', as: 'itemGroup' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderDetail, { foreignKey: 'orderId', as: 'orderDetails' });
OrderDetail.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderDetail.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

const models = {
  Item,
  ItemGroup,
  User,
  Order,
  OrderDetail,
}

module.exports = models;
