function parseAndValidateServices(rawOutput) {
  const cleaned = rawOutput.replace(/```json|```/g, '').trim();

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

function addSessionId(item) {
  const sessionId = Date.now().toString();
  item.sessionId = sessionId;
  return item;
}

// Usage inside n8n function node
const input = items[0].json;
const updated = addSessionId(input);

return [{ json: updated }];


module.exports = {
  parseAndValidateServices,
  addSessionId,
};
