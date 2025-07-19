const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Addon = sequelize.define('Addon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false }, // duration in minutes
}, {
  timestamps: false,
});

module.exports = Addon;

