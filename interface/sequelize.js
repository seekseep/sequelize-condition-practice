const { resolve } = require('path');
const Sequelize = require('sequelize');
const sqlFormatter = require('sql-formatter');

const storagPath = resolve(__dirname, '../data/', 'database.sqlite');

function formatSQLIfCan (message, throwError = false) {
  try {
    return formatted = sqlFormatter.format(body);
  } catch (err) {
    if (throwError) throw err;
  }

  try {
    const [head,body] = message.split(":");
    const formattedBody = sqlFormatter.format(body);
    return head + ":\n" + formattedBody;
  } catch (err) {
    if (throwError) throw err;
    return message
  }
}


const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagPath,
  logging: (msg) => console.info(formatSQLIfCan(msg)),
});

module.exports = sequelize;
