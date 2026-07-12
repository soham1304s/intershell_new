import { tokenizeText } from "./textProcessor.js";

/**
 * Calculates Jaccard Similarity between two arrays of tokens.
 * @param {string[]} tokens1 
 * @param {string[]} tokens2 
 * @returns {number} Score between 0 and 1.
 */
export const calculateJaccardSimilarity = (tokens1, tokens2) => {
  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

/**
 * Calculates Token Overlap score (how many tokens from query exist in target).
 * @param {string[]} queryTokens 
 * @param {string[]} targetTokens 
 * @returns {number} Score between 0 and 1.
 */
export const calculateTokenOverlap = (queryTokens, targetTokens) => {
  if (queryTokens.length === 0) return 0;
  
  const targetSet = new Set(targetTokens);
  let matchCount = 0;
  
  for (const token of queryTokens) {
    if (targetSet.has(token)) {
      matchCount++;
    } else {
      // Allow partial matches (e.g. 'develop' matches 'development')
      for (const targetToken of targetSet) {
        if (targetToken.includes(token) || token.includes(targetToken)) {
          matchCount += 0.5; // partial match weight
          break;
        }
      }
    }
  }

  return Math.min(1, matchCount / queryTokens.length);
};

/**
 * Main scoring function to compare user input against a knowledge base entry.
 * @param {string} normalizedUserText 
 * @param {Object} knowledgeEntry - Item from chatbotKnowledge.json
 * @returns {number} Confidence score.
 */
export const scoreKnowledgeEntry = (normalizedUserText, knowledgeEntry) => {
  const userTokens = tokenizeText(normalizedUserText);
  let maxScore = 0;

  // 1. Check exact question matches (highest priority)
  for (const q of knowledgeEntry.questions) {
    const normQ = q.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    if (normalizedUserText === normQ) {
      return 100; // Perfect match
    }

    const qTokens = tokenizeText(normQ);
    
    // Calculate similarities
    const jaccard = calculateJaccardSimilarity(userTokens, qTokens);
    const overlap = calculateTokenOverlap(userTokens, qTokens);
    
    const combinedScore = (jaccard * 0.4) + (overlap * 0.6);
    if (combinedScore > maxScore) {
      maxScore = combinedScore;
    }
  }

  // 2. Check keyword matches
  if (knowledgeEntry.keywords && knowledgeEntry.keywords.length > 0) {
    const keywordOverlap = calculateTokenOverlap(userTokens, knowledgeEntry.keywords);
    // Keywords boost the score slightly but shouldn't overpower an exact sentence match
    maxScore = Math.max(maxScore, keywordOverlap * 0.8);
  }

  return maxScore * 100; // Return score as percentage (0-100)
};
