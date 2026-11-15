export const TUTOR_MODES = [
  {
    value: "guided",
    label: "Guided learning",
    description: "Learn step by step with questions that build understanding.",
    starters: [
      "Teach me how fractions work, starting from the basics",
      "Help me understand photosynthesis",
      "I want to learn what a derivative really means",
    ],
  },
  {
    value: "explain",
    label: "Explain a concept",
    description: "Clear explanations at your level, with examples.",
    starters: [
      "Explain Newton's third law with everyday examples",
      "What is supply and demand?",
      "Explain recursion like I'm new to programming",
    ],
  },
  {
    value: "hint",
    label: "Hints only",
    description: "Stuck on a problem? Get nudges, not answers.",
    starters: [
      "I'm stuck solving 2x + 5 = 17",
      "How should I start proving the angles of a triangle add to 180°?",
      "Give me a hint for balancing H2 + O2 → H2O",
    ],
  },
  {
    value: "practice",
    label: "Practice",
    description: "Questions at the right difficulty, with feedback.",
    starters: [
      "Give me 3 practice questions on percentages",
      "Quiz me on the periodic table",
      "Practice questions on Python lists",
    ],
  },
  {
    value: "exam",
    label: "Exam preparation",
    description: "Plan revision and practise exam-style questions.",
    starters: [
      "Help me plan revision for my exam",
      "What topics usually come up in a statistics exam?",
      "Give me an exam-style question and mark my answer",
    ],
  },
  {
    value: "coding",
    label: "Coding mentor",
    description: "Understand and debug code without just copying answers.",
    starters: [
      "Why does my loop run one time too many?",
      "Explain what this does: [x*2 for x in range(5)]",
      "How do I start learning JavaScript?",
    ],
  },
] as const;

export type TutorMode = (typeof TUTOR_MODES)[number]["value"];

export function isTutorMode(value: unknown): value is TutorMode {
  return TUTOR_MODES.some((mode) => mode.value === value);
}

export function tutorModeLabel(value: string): string {
  return TUTOR_MODES.find((mode) => mode.value === value)?.label ?? "Guided learning";
}

/** Title for a conversation from the learner's first message. */
export function titleFromText(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "New conversation";
  return clean.length > 60 ? `${clean.slice(0, 57).trimEnd()}…` : clean;
}
