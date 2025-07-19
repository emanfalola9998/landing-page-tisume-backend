    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const Service = require('./models/services');
    const sequelize = require('./db');
    const BusinessSubCategory = require('./models/businessSubCategory');

    const app = express();

    const FRONTEND_ORIGIN = "https://landingpageaiexample.netlify.app"

    app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    }));


    // Sync the model (creates table if needed)
    Service.sync();

const multer = require('multer');
// const FormData = require('form-data');
// const upload = multer(); // handles multipart/form-data

app.use(express.json()); // Make sure this is BEFORE the route handlers

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
        try{
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
                businessId
            } = req.body

                // Lookup subcategory ID using both subCategory and parentCategory (optional but recommended)
                const subcat = await BusinessSubCategory.findOne({
                where: {
                    subCategory: businessSubcategory,
                    parentCategory: category,
                    businessId: businessId || null
                }
                });

                if (!subcat) {
                    return res.status(400).json({ error: `Subcategory "${businessSubcategory}" not found under category "${category}"` });
                }

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
            res.status(201).json(newService);
        }
        catch (err) {
            console.error('❌ Error saving Tisume Service:', err);
            res.status(500).send('Internal Server Error');
        }
    })

    const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });

