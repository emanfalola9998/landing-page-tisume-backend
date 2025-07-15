const { DataTypes } = require('sequelize');
const sequelize = require('../db');


const Service = sequelize.define('Service', {
    id: {type: DataTypes.INTEGER, allowNull: false},
    name: { type: DataTypes.STRING, allowNull: false },
    icon: {type: DataTypes.STRING},
    category: {type: DataTypes.STRING},
    description: { type: DataTypes.STRING },
    aftercareDescription: { type: DataTypes.TEXT },
    serviceFor: { type: DataTypes.STRING },
    duration: { type: DataTypes.STRING },
    priceType: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    order: { type: DataTypes.INTEGER },
    pricingName: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE },
    businessSubcategory: { type: DataTypes.INTEGER },
    businessId: { type: DataTypes.INTEGER }
    }, {
    timestamps: false,
});

module.exports = Service;
