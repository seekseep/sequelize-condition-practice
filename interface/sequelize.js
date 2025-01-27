const { resolve } = require('path');
const Sequelize = require('sequelize');
const sqlFormatter = require('sql-formatter')

const storagPath = resolve(__dirname, '../data/', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagPath,
  logging: (msg) => {
    const [head, body] = msg.split(":")

    const formatted = sqlFormatter.format(body)

    console.log(head + ":\n" + formatted)
  }
});

module.exports = sequelize
