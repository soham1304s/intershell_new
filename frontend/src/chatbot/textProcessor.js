const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by",
  "for", "if", "in", "into", "is", "it",
  "no", "not", "of", "on", "or", "such",
  "that", "the", "their", "then", "there", "these",
  "they", "this", "to", "was", "will", "with"
]);

/**
 * Normalizes user input for better matching.
 * @param {string} text - The raw text input.
 * @returns {string} The normalized text.
 */
export const normalizeText = (text) => {
  if (!text) return "";
  
  let normalized = text.toLowerCase();
  
  // Handle common contractions
  normalized = normalized.replace(/can't/g, "cannot");
  normalized = normalized.replace(/won't/g, "will not");
  normalized = normalized.replace(/n't/g, " not");
  normalized = normalized.replace(/'re/g, " are");
  normalized = normalized.replace(/'s/g, " is");
  normalized = normalized.replace(/'d/g, " would");
  normalized = normalized.replace(/'ll/g, " will");
  normalized = normalized.replace(/'t/g, " not");
  normalized = normalized.replace(/'ve/g, " have");
  normalized = normalized.replace(/'m/g, " am");

  // Remove punctuation
  normalized = normalized.replace(/[^\w\s]/g, "");

  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
};

/**
 * Tokenizes normalized text and optionally removes stop words.
 * @param {string} text - The normalized text.
 * @param {boolean} removeStopWords - Whether to filter out stop words.
 * @returns {string[]} An array of tokens.
 */
export const tokenizeText = (text, removeStopWords = true) => {
  const tokens = text.split(" ").filter(token => token.length > 0);
  
  if (removeStopWords) {
    return tokens.filter(token => !STOP_WORDS.has(token));
  }
  
  return tokens;
};
