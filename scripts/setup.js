const { faker, de } = require('@faker-js/faker');
const { startOfMonth, endOfMonth, sub, add, format } = require('date-fns');
const inquirer = require('@inquirer/prompts');

const sequelize = require('../interface/sequelize')
const {
  User,
  Item,
  ItemGroup,
  Order,
  OrderDetail,
} = require('../models');

(async () => {

  const userNames = [
    "山田 太郎",
    "田中 花子",
    "佐藤 次郎",
    "鈴木 三郎",
  ];
  const itemGroupInputs = [
    {
      id: 1,
      name: "ゲーム",
      itemNames: [
        "スプラトゥーン",
        "モンスターハンター",
        "ドラゴンクエスト",
        "ファイナルファンタジー",
        "ゼルダの伝説",
      ]
    },
    {
      id: 2,
      name: "食品",
      itemNames: [
        "りんご",
        "バナナ",
        "ぶどう",
        "いちご",
        "みかん",
      ]
    },
    {
      id: 3,
      name: "家電",
      itemNames: [
        "テレビ",
        "冷蔵庫",
        "洗濯機",
        "掃除機",
        "エアコン",
      ]
    },
    {
      id: 4,
      name: "書籍",
      itemNames: [
        "ハリーポッター",
        "名探偵コナン",
        "鬼滅の刃",
        "ONE PIECE",
        "NARUTO",
      ]
    }
  ]

  try {
    await sequelize.sync({ force: true });
    console.log('Database synced.');
    await User.destroy({ truncate: true });
    console.info(`Succeed to destroy User`)
    await Item.destroy({ truncate: true });
    console.info(`Succeed to destroy Item`)
    await ItemGroup.destroy({ truncate: true });
    console.info(`Succeed to destroy ItemGroup`)
    await Order.destroy({ truncate: true });
    console.info(`Succeed to destroy Order`)
    await OrderDetail.destroy({ truncate: true });
    console.info(`Succeed to destroy OrderDetail`);

    const userById = {}
    const itemById = {}
    const itemByGroupIdAndId = {}
    const itemsByGroupId = {}
    const itemGroupById = {}

    for (const name of userNames) {
      const user = await User.create({ name });
      userById[user.id] = user;
    }

    for (const itemGroupInput of itemGroupInputs) {
      const itemGroup = await ItemGroup.create({
        id: itemGroupInput.id,
        name: itemGroupInput.name
      });
      itemGroupById[itemGroup.id] = itemGroup;
      itemsByGroupId[itemGroup.id] = [];
      for (const itemName of itemGroupInput.itemNames) {
        const item = await Item.create({ name: itemName, itemGroupId: itemGroup.id });
        itemById[item.id] = item;
        itemsByGroupId[itemGroup.id].push(item);
      }
    }


    function createOrderDetailInput (method, itemGroupId, itemIndex) {
      const asId = method === 'id';
      const items = itemsByGroupId[itemGroupId];
      const item = items[itemIndex]
      const itemGroup = itemGroupById[itemGroupId]
      if (asId) {
        const orderDetailInput = {
          itemId: item.id,
          itemName: null,
          itemGroupName: null,
        }
        return orderDetailInput
      }
      const orderDetailInput = {
        itemId: null,
        itemName: item.name,
        itemGroupName: itemGroup.name,
      }
      return orderDetailInput
    }

    function createOrderInput(userId, detailInputs) {
      const orderInput = {
        userId,
        detailInputs,
      }
      return orderInput
    }

    async function createOrder (input) {
      const { userId, detailInputs } = input
      const order = await Order.create({ userId });
      for (const detailInput of detailInputs) {
        const { itemId, itemName, itemGroupName } = detailInput
        await OrderDetail.create({
          orderId: order.id,
          itemId,
          itemName,
          itemGroupName,
        });
      }
    }


    const o = createOrderInput
    const d = createOrderDetailInput

    const orderInputs = [
      // NOTE: itemGroupId=1 (ゲーム) を1つ以上持つ
      o(1, [d('id', 1, 0), d('id', 2, 0), d('id', 3, 0)]),
      o(1, [d('name', 1, 1), d('name', 2, 1), d('name', 3, 1)]),
      o(1, [d('name', 1, 1), d('id', 2, 1), d('name', 3, 1), d('id', 4, 1)]),
      o(1, [d('id', 1, 2), d('id', 2, 2), d('id', 3, 2)]),

      // NOTE: itemGroupId=1 (ゲーム) を持たない
      o(1, [d('name', 2, 3), d('name', 3, 3), d('id', 4, 3)]),
      o(1, [d('name', 2, 4), d('id', 3, 4), d('name', 2, 4)]),
      o(1, [d('id', 2, 3), d('name', 2, 3), d('id', 4, 3)]),
      o(1, [d('id', 3, 3), d('name', 4, 3), d('id', 3, 3)]),

      // NOTE: 他のユーザー
      o(2, [d('id', 1, 0), d('id', 2, 0), d('id', 3, 0)]),
      o(3, [d('name', 1, 1), d('name', 2, 1), d('name', 3, 1)]),
      o(4, [d('name', 1, 1), d('name', 2, 1), d('name', 3, 1)]),
    ]
    for (const input of orderInputs) await createOrder(input)

  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
})();
