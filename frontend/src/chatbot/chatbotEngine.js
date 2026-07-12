import { normalizeText } from "./textProcessor.js";
import { scoreKnowledgeEntry } from "./similarity.js";
import { matchIntent } from "./intentMatcher.js";
import chatbotKnowledge from "../data/chatbotKnowledge.json";

// Thresholds for confidence
const HIGH_CONFIDENCE = 70;
const MEDIUM_CONFIDENCE = 40;

/**
 * Processes a user message and returns a chatbot response object.
 * @param {string} userMessage - The raw user input.
 * @returns {Object} { text: string, action?: Object, suggestedQuestions?: string[] }
 */
export const processMessage = (userMessage) => {
  const normalized = normalizeText(userMessage);

  // 1. Check Intents first (greetings, goodbyes, etc.)
  const intentMatch = matchIntent(normalized);
  if (intentMatch) {
    // Pick a random response from the intent
    const randomResponse = intentMatch.responses[Math.floor(Math.random() * intentMatch.responses.length)];
    return {
      text: randomResponse,
      suggestedQuestions: intentMatch.suggestedQuestions || []
    };
  }

  // 2. Search Knowledge Base
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of chatbotKnowledge) {
    const score = scoreKnowledgeEntry(normalized, entry);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  // 3. Determine Response based on Confidence
  if (bestMatch && highestScore >= HIGH_CONFIDENCE) {
    return {
      text: bestMatch.answer,
      action: bestMatch.action,
      suggestedQuestions: bestMatch.relatedQuestions || []
    };
  } else if (bestMatch && highestScore >= MEDIUM_CONFIDENCE) {
    return {
      text: `I think you're asking about ${bestMatch.category || 'this'}. ${bestMatch.answer}`,
      action: bestMatch.action,
      suggestedQuestions: bestMatch.relatedQuestions || []
    };
  }

  // 4. Smart Fallback (Low Confidence)
  return {
    text: "I couldn't find an exact answer to that in my current knowledge base. You can try asking about our services, pricing, or support.",
    suggestedQuestions: [
      "What services do you offer?",
      "How do I request a service?",
      "How do I contact support?"
    ]
  };
};
