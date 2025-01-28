const { Op, literal } = require('sequelize');
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
    ['行番号', '指定方法', '商品分類', '商品名']
  ]

  for (let i = 0; i < order.orderDetails.length; i++) {
    const detail = order.orderDetails[i];
    const index = i + 1;
    const referedItem = detail.item;
    const referedItemGroup = referedItem?.itemGroup;
    const itemName = referedItem?.name ?? detail.itemName;
    const itemGroupName = referedItemGroup?.name ?? detail.itemGroupName;
    const specifiedMethod = referedItem ? 'ID' : '名称'
    data.push([
      index,
      specifiedMethod,
      itemGroupName,
      itemName,
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
    default: defaultItemGroupName,
  })

  return {
    userId: selectedUserId,
    itemGroupName: inputtedItemGroupName
  }
}

async function listOrders ({
  userId, offset = 0, limit = 5, itemGroupName
}) {
  const { count, rows: orders } = await Order.findAndCountAll({
    attributes: ['id', 'createdAt'],
    where: {
      userId: { [Op.eq]: userId },
    },
    include: [{
      model: OrderDetail,
      as: 'orderDetails',
      attributes: ["itemName", "itemGroupName"],
      required: true,
      where: {
        [Op.or]: [
          { itemGroupName: { [Op.like]: `%${itemGroupName}%` } },
          literal(`EXISTS (
            SELECT 1 FROM Items AS item
            INNER JOIN ItemGroups AS itemGroup ON item.itemGroupId = itemGroup.id
            WHERE itemGroup.name LIKE '%${itemGroupName}%'
            AND item.id = orderDetails.itemId
          )`),
        ]
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
    limit,
    offset
  });

  return { count, orders };
}


(async () => {
  try {
    const users = await User.findAll();
    const itemGroups = await ItemGroup.findAll();

    const { userId, itemGroupName } = await requestFilterOptions({
      users,
      itemGroups
    });

    let nextExists = true;
    const limit = 5;
    let offset = 0;
    while (nextExists) {
      const { count, orders } = await listOrders({ userId, itemGroupName, limit, offset });
      for (const order of orders) showOrder(order);
      console.log(`全${count}件中${offset + 1}件〜${offset + orders.length}件を表示中`);

      offset += limit;
      nextExists = count > offset;

      if (nextExists) {
        const next = await inquirer.confirm({
          message: '次のページを表示しますか？',
          default: true,
        })
        if (!next) break
      }
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    await sequelize.close();
  }
})();
