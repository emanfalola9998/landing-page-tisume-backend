    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const Service = require('./models/services');
    const sequelize = require('./db');

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
const FormData = require('form-data');
const upload = multer(); // handles multipart/form-data

// 🔥 Put this BEFORE express.json middleware
app.post('/api/proxy/service-submit', upload.single('data'), async (req, res) => {
  try {
    const form = new FormData();

    form.append('data', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await fetch('https://ronaldo9860.app.n8n.cloud/webhook-test/service-submit', {
      method: 'POST',
      headers: form.getHeaders(),
      body: form,
    });

    const result = await response.text();
    res.status(response.status).send(result);
  } catch (err) {
    console.error('❌ Proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed' });
  }
});

// 🧨 Move this below the upload route
app.use(express.json());


    app.post('/api/service-submit', async (req, res) => {
        try{
            const {
                id,
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

            if (!id) {
                id = Math.random()
            }

            const newService = await Service.create({
                id,
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
            });
            res.status(201).json(newService);
        }
        catch (err) {
            console.error('❌ Error saving beer:', err);
            res.status(500).send('Internal Server Error');
        }
    })

    const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });

