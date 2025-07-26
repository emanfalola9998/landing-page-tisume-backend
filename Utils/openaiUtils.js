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

module.exports = { buildPrompt }