function parseAndValidateServices(rawOutput) {
    console.log("rawOutput typeof: ", typeof rawOutput)
    if (typeof rawOutput !== 'string') {
    throw new Error('❌ AT parseAndValidationMethod:  rawOutput must be a string');
  }
  const cleaned = rawOutput.toString().replace(/```json|```/g, '').trim();

  let services;
  try {
    services = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('❌ Failed to parse JSON from output field: ' + err.message);
  }

  const validServices = services.filter(service =>
    service.name?.trim() &&
    service.description?.trim() &&
    service.price?.toString().trim()
  );

  if (validServices.length === 0) {
    throw new Error('❌ No valid service entries found after validation.');
  }

  return validServices;
}

function addSessionId(service) {
  const sessionId = Date.now().toString();
  return {
    ...service,
    sessionId,
  };
}

module.exports = {
  parseAndValidateServices,
  addSessionId,
};
