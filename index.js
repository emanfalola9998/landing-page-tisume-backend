    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const Service = require('./models/services');
    const Addon = require('./models/addon');
    const AppointmentAddon = require('./models/appointmentAddon');
    const sequelize = require('./db');
    const BusinessSubCategory = require('./models/businessSubcategory');

    const app = express();

    const FRONTEND_ORIGIN = "https://landingpageaiexample.netlify.app"

    app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    }));


    // Sync the model (creates table if needed)
    Service.sync();
    BusinessSubCategory.sync()
    Addon.sync()

app.use(express.json()); // Make sure this is BEFORE the route handlers

Service.belongsToMany(Addon, {
  through: AppointmentAddon,
  foreignKey: 'appointmentId',
  otherKey: 'addonId',
});

Addon.belongsToMany(Service, {
  through: AppointmentAddon,
  foreignKey: 'addonId',
  otherKey: 'appointmentId',
});

app.post('/api/proxy/service-submit', async (req, res) => {
  try {
    const { textContent } = req.body;

    if (!textContent) {
      return res.status(400).json({ error: 'No textContent provided' });
    }

    const response = await fetch('https://ronaldo9860.app.n8n.cloud/webhook-test/service-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textContent }),
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (err) {
    console.error('❌ Proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});


app.post('/api/service-submit', async (req, res) => {
  try {
    const services = Array.isArray(req.body) ? req.body : [req.body];

    const createdServices = [];

    for (const service of services) {
      const {
        name,
        icon,
        category,
        description,
        aftercareDescription,
        serviceFor,
        duration,
        priceType,
        price,
        order,
        pricingName,
        createdAt,
        businessSubcategory,
        businessId,
        addons // <-- get addons here
      } = service;

      // Find subcategory
      const subcat = await BusinessSubCategory.findOne({
        where: {
          subCategory: businessSubcategory,
          parentCategory: category,
        }
      });

      if (!subcat) {
        return res.status(400).json({
          error: `Subcategory "${businessSubcategory}" not found under category "${category}"`,
        });
      }

      // Create the service
      const newService = await Service.create({
        name,
        icon,
        category,
        description,
        aftercareDescription,
        serviceFor,
        duration,
        priceType,
        price,
        order,
        pricingName,
        createdAt,
        businessSubcategory: subcat.id,
        businessId
      });

      // Insert addons & link them - THIS MUST BE INSIDE THE FUNCTION
      if (addons && Array.isArray(addons)) {
        for (const addonData of addons) {
          let addon = await Addon.findOne({ where: { name: addonData.name } });

          if (!addon) {
            addon = await Addon.create({
              name: addonData.name,
              price: addonData.price,
              duration: addonData.duration || null,
              description: addonData.description || ''
            });
          }

          await AppointmentAddon.create({
            serviceId: newService.id,
            addonId: addon.id
          });
        }
      }

      createdServices.push(newService);
    }

    res.status(201).json(createdServices);
  } catch (err) {
    console.error('❌ Error saving Services:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = {
  Service,
  Addon,
  AppointmentAddon,
};
    

    const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });

