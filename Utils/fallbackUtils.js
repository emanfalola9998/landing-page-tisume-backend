function applyFallbacks(services) {
  const fallbackFields = [
    'category',
    'aftercareDescription',
    'serviceFor',
    'duration',
    'priceType',
    'pricingName'
  ];

  return services.map(service => {
    const updated = { ...service };

    fallbackFields.forEach(field => {
      if (!updated[field]) {
        updated[field] = 'N/A';
      }
    });

    return updated;
  });
}

module.exports = { applyFallbacks };
