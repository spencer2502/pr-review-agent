import { useState } from "react";

const mentorPersonas = [
  {
    persona_id: "balanced",
    name: "AI Reviewer",
    description: "Balanced, comprehensive code review",
  },
  {
    persona_id: "sarah_lead",
    name: "Sarah (Team Lead)",
    description: "Architecture & team standards focused",
  },
  {
    persona_id: "alex_security",
    name: "Alex (Security Expert)",
    description: "Security vulnerabilities & compliance",
  },
  {
    persona_id: "jordan_perf",
    name: "Jordan (Performance Guru)",
    description: "Performance optimization & scalability",
  },
];

export const useAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(mentorPersonas[0]);

  return {
    analysis,
    setAnalysis,
    analyzing,
    setAnalyzing,
    selectedMentor,
    setSelectedMentor,
    mentorPersonas,
  };
};
