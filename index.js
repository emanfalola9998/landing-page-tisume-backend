    require('dotenv').config()
    const { applyFallbacks } = require('./Utils/fallbackUtils');
    const { parseAndValidateServices, addSessionId } = require('./Utils/serviceUtils');
    const { buildPrompt } = require('./Utils/openaiUtils');
    const express = require('express');
    const cors = require('cors');
    const Service = require('./models/services');
    const Addon = require('./models/addon');
    const AppointmentAddon = require('./models/appointmentAddon');
    const sequelize = require('./db');
    const BusinessSubCategory = require('./models/businessSubcategory');
    const { OpenAI } = require('openai'); // implementation without n8n

    const axios = require('axios');
    
    const app = express();

    // implementation without n8n

    app.use(express.json({ limit: '2mb' })); // for JSON
    app.use(express.urlencoded({ extended: true })); // for form submissions
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// end --- implementation without n8n


    const FRONTEND_ORIGIN = "https://landingpageaiexample.netlify.app"

    app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    }));

    // After defining Service and Addon...
    Service.belongsToMany(Addon, { through: AppointmentAddon, foreignKey: 'appointmentId', otherKey: 'addonId' });
    Addon.belongsToMany(Service, { through: AppointmentAddon, foreignKey: 'addonId', otherKey: 'appointmentId' });


    // Sync the model (creates table if needed)
    Service.sync();
    BusinessSubCategory.sync()
    Addon.sync()
    AppointmentAddon.sync()


// app.options('*', (req, res) => {
//   if (
//     req.headers.origin === 'https://landingpageaiexample.netlify.app' &&
//     req.headers['access-control-request-method']
//   ) {
//     res.setHeader('Access-Control-Allow-Origin', 'https://landingpageaiexample.netlify.app');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     return res.sendStatus(204);
//   }

//   res.sendStatus(404);
// });


app.post('/api/proxy/service-submit', async (req, res) => {
  try {
    const { textContent } = req.body;

    if (!textContent) {
      return res.status(400).json({ error: 'No textContent provided' });
    }

    const response = await fetch('https://landing-page-tisume-backend-production.up.railway.app/webhook/service-upload', {
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

    console.log("createdServices: ", createdServices)

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
            appointmentId: newService.id,
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

// implementation without n8n




app.post('/webhook/service-upload', async (req, res) => {
  const textContent = req.body.textContent;

  if (!textContent) {
    return res.status(400).json({ error: 'Missing textContent field' });
  }

//   const textWithSessionID = addSessionId(textContent)

  try {
        
    const prompt = buildPrompt(textWithSessionID);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    let rawOutput = completion.choices[0].message.content.trim();
    console.log('🧪 Raw OpenAI Output:', rawOutput);

    // Clean code blocks and isolate JSON
    rawOutput = rawOutput.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

    // Extract the first JSON array
    const match = rawOutput.match(/\[\s*{[\s\S]*}\s*]/);
    if (!match) {
      console.error('❌ No valid JSON array found');
      return res.status(400).json({ error: 'Invalid JSON format from OpenAI.' });
    }



    const jsonToParse = match[0];
    console.log("match: ", match)


    const serviceWithSessionID = addSessionId(jsonToParse)
    let parsedServices = parseAndValidateServices(serviceWithSessionID)


    // try {
    //   parsedServices = JSON.parse(jsonToParse);
    // } catch (parseErr) {
    //   console.error('❌ JSON parsing failed:', parseErr.message);
    //   console.error('🪵 Raw JSON string:', jsonToParse);
    //   return res.status(400).json({ error: 'Malformed JSON from OpenAI.' });
    // }

    // // Fallbacks and validation
    // const validServices = parsedServices
    //   .filter(s => s.name?.trim() && s.description?.trim() && s.price !== undefined)
    //   .map(applyFallbacks);

    // if (validServices.length === 0) {
    //   return res.status(400).json({ error: 'No valid service entries found.' });
    // }

    validatedServices = applyFallbacks(parsedServices)

    try {
  console.log('🚀 Submitting services:', JSON.stringify(validatedServices, null, 2));

  const submitRes = await axios.post(
    'https://landing-page-tisume-backend-production.up.railway.app/api/service-submit',
    validatedServices
  );

  console.log('🛠 Backend response:', submitRes.status, JSON.stringify(submitRes.data, null, 2));

  return res.status(200).json({
    success: true,
    message: 'Services submitted to backend',
    backendResponse: submitRes.data
  });

} catch (error) {
  console.error('❌ Error submitting to service-submit:', error.response?.data || error.message || error);
  return res.status(500).json({
    error: 'Failed to submit services to backend',
    details: error.response?.data || error.message
  });
}

  } catch (err) {
    console.error('❌ Internal Error:', err.message || err);
    return res.status(500).json({ error: 'Internal Server Error' });
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

