const { faker } = require('@faker-js/faker');
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
  const userCount = await inquirer.number({
    message: 'ユーザーをいくつ作成しますか？',
    default: 3
  });
  const itemGroupCount = await inquirer.number({
    message: '商品分類をいくつ作成しますか？',
    default: 3
  });
  const itemCountPerGroup = await inquirer.number({
    message: '商品分類ごとの商品をいくつ作成しますか？',
    default: 100
  });
  const defaultOrderTermStartText = format(startOfMonth(sub(new Date(), { months: 1 })), 'yyyy-MM-dd');
  const defaultOrderTermEndText = format(endOfMonth(sub(new Date(), { months: 1 })), 'yyyy-MM-dd');

  const orderTermStartText = await inquirer.input({
    message: '注文作成の開始日を入力してください。',
    default: defaultOrderTermStartText,
  })
  const orderTermStart = new Date(orderTermStartText);

  const orderTermEndText = await inquirer.input({
    message: '注文作成の終了日を入力してください。',
    default: defaultOrderTermEndText,
  });
  const orderTermEnd = new Date(orderTermEndText);

  const orderDetailMinCount = await inquirer.number({
    message: '注文詳細の最小数を入力してください。',
    default: 2
  });
  const orderDetailMaxCount = await inquirer.number({
    message: '注文詳細の最大数を入力してください。',
    default: 5
  });

  const users = [];
  const itemGroups = [];
  const items = [];
  const itemGroupById = {};

  // NOTE: 商品の指定をランダムにする
  function getItemSpecification () {
    const specifiedAsId = Math.random() > 0.2;
    if (specifiedAsId) {
      const item = faker.helpers.arrayElement(items);
      return {
        itemId: item.id,
        itemName: null,
        itemGroupName: null,
      };
    }

    const item = faker.helpers.arrayElement(items);

    return {
      itemId: null,
      itemName: item.name,
      itemGroupName: itemGroupById[item.itemGroupId].name,
    }
  }

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
    console.info(`Succeed to destroy OrderDetail`)

    // NOTE: User
    for (let i = 0; i < userCount; i++) {
      const user = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      })
      users.push(user);
    }

    // NOTE: ItemGroup
    for (let i = 0; i < itemGroupCount; i++) {
      const itemGroup = await ItemGroup.create({
        name: faker.commerce.department(),
      });
      itemGroups.push(itemGroup);
      itemGroupById[itemGroup.id] = itemGroup;

      // NOTE: Item
      for (let i = 1; i <= itemCountPerGroup; i++) {
        const item = await Item.create({
          name: faker.commerce.productName(),
          itemGroupId: itemGroup.id
        });
        items.push(item);
      }
    }

    // NOTE: Order
    for (let createdAt = orderTermStart ; createdAt <= orderTermEnd; createdAt = add(createdAt, { days: 1 })) {
      console.info(`${format(createdAt, 'yyyy-MM-dd')}の注文を作成中...`);

      const user = faker.helpers.arrayElement(users);
      const order = await Order.create({
        userId: user.id,
        createdAt
      });

      const orderId = order.id;
      const orderDetailCount = faker.number.int({
        min: orderDetailMinCount,
        max: orderDetailMaxCount
      });
      for (let j = 0; j < orderDetailCount; j++) {
        const {
          itemId,
          itemName,
          itemGroupName,
        } = getItemSpecification()

        const index = j + 1;
        const amount = faker.number.int({ min: 1, max: 999 });

        await OrderDetail.create({
          index,
          amount,
          orderId,
          itemId,
          itemName,
          itemGroupName,
          createdAt,

        });
      }
    }
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
})();
