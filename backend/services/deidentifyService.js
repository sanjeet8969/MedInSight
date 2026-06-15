// Removes personal information from medical text before sending to AI
const deidentifyText = (text) => {
  let cleaned = text;

  // Remove names (patterns like "Patient Name: John Doe" or "Name: ...")
  cleaned = cleaned.replace(/\b(patient\s*name|name)\s*[:\-]?\s*[A-Za-z\s]{2,40}/gi, 'Patient Name: [REDACTED]');

  // Remove age patterns
  cleaned = cleaned.replace(/\b(age|aged?)\s*[:\-]?\s*\d{1,3}\s*(years?|yrs?|y\.?o\.?)?/gi, 'Age: [REDACTED]');

  // Remove sex/gender
  cleaned = cleaned.replace(/\b(sex|gender)\s*[:\-]?\s*(male|female|m|f|other)\b/gi, 'Sex: [REDACTED]');

  // Remove date of birth
  cleaned = cleaned.replace(/\b(dob|date\s*of\s*birth|d\.o\.b)\s*[:\-]?\s*[\d\/\-\.]+/gi, 'DOB: [REDACTED]');

  // Remove phone numbers
  cleaned = cleaned.replace(/(\+?\d[\d\s\-\(\)]{8,15}\d)/g, '[PHONE REDACTED]');

  // Remove email addresses
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');

  // Remove address patterns
  cleaned = cleaned.replace(/\b(address|addr|residence|city|state|pin|pincode|zip)\s*[:\-]?\s*.{2,60}/gi, 'Address: [REDACTED]');

  // Remove Aadhar/ID numbers
  cleaned = cleaned.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[ID REDACTED]');

  // Remove common Indian names at start of sentences (titles like Mr/Mrs/Dr followed by name)
  cleaned = cleaned.replace(/\b(mr|mrs|ms|dr|prof|shri|smt)\.\s+[A-Za-z\s]{2,30}/gi, '[NAME REDACTED]');

  return cleaned;
};

module.exports = { deidentifyText };
