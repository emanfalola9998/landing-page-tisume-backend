    require('dotenv').config();
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

app.use(express.json()); // Make sure this is BEFORE the route handlers


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

function validateService(service) {
  return (
    typeof service.name === 'string' &&
    typeof service.description === 'string' &&
    service.name.trim() !== '' &&
    service.description.trim() !== '' &&
    typeof service.price !== 'undefined' &&
    typeof service.businessSubcategory === 'string' &&
    typeof service.category === 'string'
  );
}


app.post('/webhook/service-upload', async (req, res) => {
  const textContent = req.body.textContent;

  if (!textContent) {
    return res.status(400).json({ error: 'Missing textContent field' });
  }

  try {
    const prompt = buildPrompt(textContent);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
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

    let parsedServices;
    try {
      parsedServices = JSON.parse(jsonToParse);
    } catch (parseErr) {
      console.error('❌ JSON parsing failed:', parseErr.message);
      console.error('🪵 Raw JSON string:', jsonToParse);
      return res.status(400).json({ error: 'Malformed JSON from OpenAI.' });
    }

    // Fallbacks and validation
    const validServices = parsedServices
      .filter(s => s.name?.trim() && s.description?.trim() && s.price !== undefined)
      .map(applyFallbacks);

    if (validServices.length === 0) {
      return res.status(400).json({ error: 'No valid service entries found.' });
    }

    const submitRes = await axios.post(
      'https://landing-page-tisume-backend-production.up.railway.app/api/service-submit',
      validServices
    );

    console.log('✅ Submitted services:', validServices);
    return res.status(200).json({
      success: true,
      message: 'Services submitted to backend',
      backendResponse: submitRes.data
    });

  } catch (err) {
    console.error('❌ Internal Error:', err.message || err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});



    /**
 * Build the OpenAI system prompt
 */
function buildPrompt(text) {
    return `
You are processing a plain text file that may contain multiple service entries.

Each service begins with a line that contains the word **"Appointment"** (e.g. "Appointment:", "Appointment -", "Appointment for").

Please split the input text using these lines as markers of a new service.

Given the following services page content, extract all relevant service information and output as a valid JSON array.

Each object in the array should include:

- name
- icon
- category
- description
- aftercareDescription
- serviceFor (like Adults, Teens, etc.)
- duration (in minutes or hours)
- priceType ("fixed" or "range")
- price
- order (just increment 1, 2, 3...)
- pricingName (optional)
- createdAt (use "2023-07-19" format)
- businessSubcategory
- businessId (randomly generated number)

servicePage:
{{ $json.body.textContent }}

1. Hair & Styling
Subcategories:

Wigs

Braids

Locs

Extensions

Natural Hair

Ponytail

Sewins

Tape INs

Tape In

Wigs Contactless booking

2. Lash (Eyebrow & Eyelash Services)
Subcategories:

Eyelash Extensions

Eyelash Lifts

Eyelash Tints

Eyebrow Waxing

Eyebrow Threading

Microblading

Brow Lamination

3. Aestheticians (Skincare & Beauty Treatments)
Subcategories:

Facials

Microdermabrasion

Chemical Peel

Waxing (Body, Face, Bikini)

Dermaplaning

Body Treatments

Skin Rejuvenation

Assign the category field using only one of the three category names shown above.

Assign the subcategory field using only one value from the valid subcategories under the selected category.

Do not make up new categories or subcategories. Use the closest match.

Add any extra context or nuances that don’t fit the subcategory into the description field.

Subcategory must be relevant to the service name and description.


If the service description or appointment text includes any optional services or features that increase price or duration, treat them as “Add Ons”.

Extract them into an array called addons, with each add-on having:
- name
- price
- duration (in minutes)

Add this array as a field in the service JSON object like:

"addons": [
  {
    "name": "Hot Oil Treatment",
    "price": 10,
    "duration": 15
  }
]



Return ONLY a JSON array. 
Do not use markdown, explanation, or wrap it in triple backticks. 
If you are unsure about a field, use empty string, 0, or null.

    servicePage:
    ${text}
    `.trim();
}

/**
 * Fallbacks for missing fields
 */
function applyFallbacks(service) {
return {
    ...service,
    category: service.category || 'N/A',
    aftercareDescription: service.aftercareDescription || 'N/A',
    serviceFor: service.serviceFor || 'N/A',
    duration: typeof service.duration === 'number' ? service.duration : 0,
    priceType: service.priceType || 'N/A',
    pricingName: service.pricingName || 'N/A',
    addons: Array.isArray(service.addons) ? service.addons.map(a => ({
        name: a.name || 'Untitled Addon',
        price: a.price || 0,
        duration: typeof a.duration === 'number' ? a.duration : 0,
        description: a.description || ''
    })) : []
    };
}


module.exports = {
  Service,
  Addon,
  AppointmentAddon,
};

// old route: https://ronaldo9860.app.n8n.cloud/webhook-test/service-submit
    

    const PORT = process.env.PORT || 3001;  // fallback to 3001 if PORT is not set locally

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });

