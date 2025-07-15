require('dotenv').config();

const { Sequelize } = require('sequelize');

console.log('DB Host:', process.env.MYSQL_HOST || process.env.MYSQLHOST);
console.log('DB User:', process.env.MYSQL_USER || process.env.MYSQLUSER);
console.log('DB Name:', process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE);

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE,
  process.env.MYSQL_USER || process.env.MYSQLUSER,
  process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQL_HOST || process.env.MYSQLHOST,
    port: process.env.MYSQL_PORT || process.env.MYSQLPORT,
    dialect: 'mysql',
    logging: false,  // optional: to silence SQL logs
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;
