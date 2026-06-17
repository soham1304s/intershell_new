const tokenize = (value = "") =>
  [...new Set(value.toLowerCase().match(/[a-z][a-z+#.]{2,}/g) || [])];

export function analyzeResume({ resumeText = "", jobDescription = "", targetRole = "" }) {
  const resumeWords = tokenize(resumeText);
  const jobWords = tokenize(`${jobDescription} ${targetRole}`);
  const important = jobWords.filter(
    (word) => !["with", "that", "from", "your", "this", "will", "have", "role"].includes(word)
  );
  const matched = important.filter((word) => resumeWords.includes(word));
  const missing = important.filter((word) => !resumeWords.includes(word)).slice(0, 10);
  const keywordScore = important.length
    ? Math.round((matched.length / important.length) * 100)
    : 62;
  const sectionSignals = ["experience", "education", "skills", "project", "summary"];
  const sections = sectionSignals.filter((section) => resumeText.toLowerCase().includes(section));
  const structureScore = Math.min(100, 45 + sections.length * 11);
  const score = Math.round(keywordScore * 0.7 + structureScore * 0.3);

  return {
    score: Math.max(score, 34),
    keywordScore,
    structureScore,
    matchedKeywords: matched.slice(0, 12),
    missingKeywords: missing,
    sectionsFound: sections,
    suggestions: [
      missing.length
        ? `Naturally include relevant terms such as ${missing.slice(0, 3).join(", ")}.`
        : "Keyword alignment is strong; keep phrasing natural and specific.",
      "Lead each experience bullet with a clear action verb.",
      "Quantify outcomes with scale, speed, revenue, quality, or user impact.",
      sections.includes("project")
        ? "Connect project outcomes directly to the target role."
        : "Add a focused projects section with links and measurable outcomes."
    ]
  };
}

export const interviewQuestions = (role, type = "behavioral") => {
  const bank = {
    technical: [
      `How would you design a reliable feature for a ${role}?`,
      "Tell me about a difficult bug you diagnosed. What was your process?",
      "How do you balance delivery speed with maintainability?",
      "Describe a technical decision you changed your mind about.",
      "How would you test a critical user workflow end to end?"
    ],
    behavioral: [
      `Why does this ${role} opportunity interest you?`,
      "Tell me about a time you received difficult feedback.",
      "Describe a project where the requirements were unclear.",
      "How do you prioritize when several tasks feel urgent?",
      "What kind of team environment helps you do your best work?"
    ],
    hr: [
      "Walk me through your background in two minutes.",
      "What are you looking for in your next opportunity?",
      "What is one strength and one area you are actively improving?",
      "How do you handle disagreement with a teammate?",
      "Where would you like your career to be in two years?"
    ]
  };
  return bank[type] || bank.behavioral;
};

export const scoreAnswer = (answer = "") => {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const hasExample = /\b(example|project|when|situation|task|result)\b/i.test(answer);
  const hasImpact = /\b(\d+%?|\d+x|improved|reduced|increased|delivered)\b/i.test(answer);
  const score = Math.min(96, 35 + Math.min(words.length, 80) / 2 + (hasExample ? 12 : 0) + (hasImpact ? 10 : 0));
  return {
    score: Math.round(score),
    feedback: [
      words.length < 45 ? "Add enough context for the interviewer to understand the stakes." : "Your answer has useful context and a clear flow.",
      hasExample ? "The concrete example makes your answer credible." : "Ground the answer in one specific example.",
      hasImpact ? "You made the outcome measurable." : "Close with a measurable result or what changed."
    ]
  };
};
