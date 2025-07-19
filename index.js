    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const Service = require('./models/services');
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

    app.post('/api/seed-subcategories', async (req, res) => {
  try {
    const seedData = [
    { subCategory: 'Wigs', parentCategory: 'Hair & Styling', order: 1 },
    { subCategory: 'Braids', parentCategory: 'Hair & Styling', order: 2 },
    { subCategory: 'Locs', parentCategory: 'Hair & Styling', order: 3 },
    { subCategory: 'Extensions', parentCategory: 'Hair & Styling', order: 4 },
    { subCategory: 'Natural Hair', parentCategory: 'Hair & Styling', order: 5 },
    { subCategory: 'Ponytail', parentCategory: 'Hair & Styling', order: 6 },
    { subCategory: 'Sewins', parentCategory: 'Hair & Styling', order: 7 },
    { subCategory: 'Tape INs', parentCategory: 'Hair & Styling', order: 8 },
    { subCategory: 'Tape In', parentCategory: 'Hair & Styling', order: 9 },
    { subCategory: 'Wigs - Contactless bookings', parentCategory: 'Hair & Styling', order: 10 },

    { subCategory: 'Eyelash Extensions', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 1 },
    { subCategory: 'Eyelash Lifts', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 2 },
    { subCategory: 'Eyelash Tinting', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 3 },
    { subCategory: 'Eyelash Waxing', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 4 },
    { subCategory: 'Eyelash Threading', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 5 },
    { subCategory: 'Microblading', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 6 },
    { subCategory: 'Brow Lamination', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 7 },

    { subCategory: 'Facials', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 1 },
    { subCategory: 'Microdermabrasion', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 2 },
    { subCategory: 'Chemical Peels', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 3 },
    { subCategory: 'Waxing (Body, Face, Bikini)', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 4 },
    { subCategory: 'Dermaplaning', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 5 },
    { subCategory: 'Body Treatments', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 6 },
    { subCategory: 'Skin Rejuvenation', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 7 },
    ];

    await BusinessSubCategory.bulkCreate(seedData, { ignoreDuplicates: true });
    res.status(200).json({ message: '✅ Subcategories seeded successfully' });
  } catch (err) {
    console.error('❌ Error seeding subcategories:', err);
    res.status(500).json({ error: 'Failed to seed' });
  }
});
    

    const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });

