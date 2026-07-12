const STORAGE_KEY = "internshell_chatbot_history";
const MAX_MESSAGES = 50;

/**
 * Loads conversation history from localStorage.
 * @returns {Array} Array of message objects.
 */
export const loadHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load chat history", error);
  }
  return [];
};

/**
 * Saves conversation history to localStorage.
 * @param {Array} history - Array of message objects.
 */
export const saveHistory = (history) => {
  try {
    // Keep only the latest messages to avoid localStorage quota issues
    const trimmedHistory = history.slice(-MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Failed to save chat history", error);
  }
};

/**
 * Clears the conversation history from localStorage.
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat history", error);
  }
};
