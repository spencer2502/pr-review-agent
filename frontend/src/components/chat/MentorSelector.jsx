import React from "react";
import { Bot, User } from "lucide-react";

const mentorPersonas = [
  {
    persona_id: "balanced",
    name: "AI Reviewer",
    description: "Balanced, comprehensive code review",
    personality: "helpful AI assistant providing comprehensive code review",
  },
  {
    persona_id: "sarah_lead",
    name: "Sarah (Team Lead)",
    description: "Architecture & team standards focused",
    personality: "patient mentor who explains the 'why' behind recommendations",
  },
  {
    persona_id: "alex_security",
    name: "Alex (Security Expert)",
    description: "Security vulnerabilities & compliance",
    personality: "direct and focused on identifying security risks",
  },
  {
    persona_id: "jordan_perf",
    name: "Jordan (Performance Guru)",
    description: "Performance optimization & scalability",
    personality: "data-driven optimizer who loves performance metrics",
  },
];

const MentorSelector = ({ selectedMentor, setSelectedMentor }) => {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">
        Choose Your AI Mentor
      </h3>
      <div className="space-y-3">
        {mentorPersonas.map((mentor) => (
          <button
            key={mentor.persona_id}
            onClick={() => setSelectedMentor(mentor)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedMentor?.persona_id === mentor.persona_id
                ? "border-purple-500 bg-purple-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center mb-2">
              {mentor.persona_id === "balanced" ? (
                <Bot className="w-6 h-6 mr-3 text-gray-600" />
              ) : (
                <User className="w-6 h-6 mr-3 text-gray-600" />
              )}
              <div className="font-medium text-gray-900">{mentor.name}</div>
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {mentor.description}
            </div>
            <div className="text-xs text-purple-600 font-medium">
              {mentor.personality}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MentorSelector;
