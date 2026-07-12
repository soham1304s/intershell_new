import chatbotIntents from "../data/chatbotIntents.json";

/**
 * Matches a normalized string against predefined intents.
 * @param {string} normalizedUserText 
 * @returns {Object|null} The matched intent object or null if none found.
 */
export const matchIntent = (normalizedUserText) => {
  for (const intentObj of chatbotIntents) {
    for (const pattern of intentObj.patterns) {
      // Use exact match or check if pattern is a prominent part of the string
      // Normalizing the pattern first just in case
      const normPattern = pattern.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
      
      // Simple logic: if the user text is exactly the intent pattern,
      // or if it strongly starts with it
      if (normalizedUserText === normPattern || 
          normalizedUserText.startsWith(`${normPattern} `) ||
          normalizedUserText.endsWith(` ${normPattern}`)) {
        return intentObj;
      }
    }
  }
  
  return null;
};
