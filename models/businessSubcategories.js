const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BusinessSubCategory = sequelize.define('business_subCategories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subCategory: { type: DataTypes.STRING, allowNull: false },
    parentCategory: { type: DataTypes.STRING, allowNull: false },
    order: { type: DataTypes.INTEGER },
    businessId: { type: DataTypes.INTEGER }
}, {
    timestamps: false
    });

module.exports = BusinessSubCategory;