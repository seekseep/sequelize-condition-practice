const { Op, where } = require('sequelize');
const inquirer = require('@inquirer/prompts');
const { table } = require('table');
const { format } = require('date-fns');

const sequelize = require('../interface/sequelize');
const { User, Order, OrderDetail, Item, ItemGroup } = require('../models');

function showOrder (order) {
  console.log(table([
    ['注文ID', order.id],
    ['注文日時', format(order.createdAt, 'yyyy-MM-dd')]
  ]).trim())

  const data = [
    ['行番号', '指定方法', '商品分類', '商品名', '数量']
  ]

  for (let i = 0; i < order.orderDetails.length; i++) {
    const detail = order.orderDetails[i];
    const index = i + 1;
    const referedItem = detail.item;
    const referedItemGroup = referedItem?.itemGroup;
    const itemName = referedItem?.name ?? detail.itemName;
    const itemGroupName = referedItemGroup?.name ?? detail.itemGroupName;
    const amount = detail.amount
    const specifiedMethod = referedItem ? 'ID' : '名称'
    data.push([
      index,
      specifiedMethod,
      itemGroupName,
      itemName,
      amount
    ])
  }
  console.log(table(data))
}

async function requestFilterOptions ({users, itemGroups}) {
  const userChoices = users.map((user) => ({
    name: `${user.id}: ${user.name}`,
    value: user,
  }))

  const selectedUser = await inquirer.select({
    message: 'ユーザーを選んでください',
    choices: userChoices,
  })
  const selectedUserId = selectedUser.id;

  const defaultItemGroupName = itemGroups?.[0]?.name ?? 'Games';
  const inputtedItemGroupName = await inquirer.input({
    message: '商品分類名を入力してください',
    default: defaultItemGroupName
  })

  return {
    userId: selectedUserId,
    itemGroupName: inputtedItemGroupName
  }
}

(async () => {
  try {
    const users = await User.findAll();
    const itemGroups = await ItemGroup.findAll();

    const { userId, itemGroupName } = await requestFilterOptions({
      users,
      itemGroups
    });

    const itemGroupNameCondition = { [Op.like]: `%${itemGroupName}%` }

    const orders = await Order.findAll({
      attributes: ['id', 'createdAt'],
      where: {
        userId: { [Op.eq]: userId }
      },
      include: [{
        model: OrderDetail,
        as: 'orderDetails',
        attributes: ["itemName", "itemGroupName", "amount"],
        required: true,
        where: {
          [Op.or]: [{
            itemGroupName: itemGroupNameCondition
          }, {
            '$orderDetails.item.itemGroup.name$': itemGroupNameCondition
          }]
        },
        include: [{
          model: Item,
          as: 'item',
          attributes: ['name'],
          include: [{
            model: ItemGroup,
            as: 'itemGroup',
            attributes: ['name'],
          }]
        }],
      }],
    });

    console.info(`${orders.length}件の注文が見つかりました`);

    const confirmed = await inquirer.confirm({
      message: '注文を表示しますか？',
      default: false,
    });
    if (!confirmed) return;

    for (const order of orders) showOrder(order);
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    await sequelize.close();
  }
})();
