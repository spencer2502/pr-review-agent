import React from "react";
import { Shield, Clock, MessageSquare, Zap } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Risk Dashboard", icon: Shield },
    { id: "timemachine", label: "Time Machine", icon: Clock },
    { id: "chat", label: "AI Mentor Chat", icon: MessageSquare },
    { id: "fixes", label: "Auto-Fixes", icon: Zap },
  ];

  return (
    <div className="flex space-x-1 mb-8 bg-white rounded-lg p-2 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <tab.icon className="w-4 h-4 mr-2" />
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
