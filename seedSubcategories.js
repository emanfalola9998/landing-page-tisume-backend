const sequelize = require('./db');
const BusinessSubCategory = require('./models/businessSubCategory');

async function seed() {
  await sequelize.sync();

  const subcategories = [
    // Hair & Styling
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

    // Lash (Eyebrow & Eyelash Services)
    { subCategory: 'Eyelash Extensions', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 1 },
    { subCategory: 'Eyelash Lifts', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 2 },
    { subCategory: 'Eyelash Tinting', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 3 },
    { subCategory: 'Eyelash Waxing', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 4 },
    { subCategory: 'Eyelash Threading', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 5 },
    { subCategory: 'Microblading', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 6 },
    { subCategory: 'Brow Lamination', parentCategory: 'Lash (Eyebrow & Eyelash Services', order: 7 },

    // Aestheticians (Skincare & Beauty Treatments)
    { subCategory: 'Facials', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 1 },
    { subCategory: 'Microdermabrasion', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 2 },
    { subCategory: 'Chemical Peels', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 3 },
    { subCategory: 'Waxing (Body, Face, Bikini)', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 4 },
    { subCategory: 'Dermaplaning', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 5 },
    { subCategory: 'Body Treatments', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 6 },
    { subCategory: 'Skin Rejuvenation', parentCategory: 'Aestheticians (Skincare & Beauty Treatments)', order: 7 },
  ];

  for (const subcat of subcategories) {
    await BusinessSubCategory.findOrCreate({
      where: { subCategory: subcat.subCategory, parentCategory: subcat.parentCategory },
      defaults: subcat
    });
  }

  console.log('Subcategories seeded!');
  process.exit();
}

seed().catch(console.error);
