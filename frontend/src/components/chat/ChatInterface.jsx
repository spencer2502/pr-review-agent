import React, { useState, useEffect } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { chatApi } from "../../services/chatApi";

const ChatInterface = ({ analysis, selectedMentor }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Add welcome message when analysis changes
    if (analysis) {
      const welcomeMessage = {
        role: "assistant",
        content: `I've analyzed PR #${analysis.pr_id} and found ${
          analysis.issues?.length || 0
        } issues with a risk score of ${
          analysis.risk_score
        }/100. What would you like to know about this pull request?`,
        timestamp: new Date().toISOString(),
        mentor_name: selectedMentor?.name || "AI Reviewer",
      };
      setMessages([welcomeMessage]);
    }
  }, [analysis, selectedMentor]);

  const handleSendMessage = async (message) => {
    if (!message.trim() || isTyping || !analysis) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      const response = await chatApi.sendMessage(
        analysis.pr_id,
        message,
        selectedMentor.persona_id
      );

      const aiMessage = {
        role: "assistant",
        content: response.response || "Sorry, no response.",
        timestamp: response.timestamp || new Date().toISOString(),
        mentor_name: response.mentor_name || selectedMentor.name,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "I'm having trouble processing your message. Please try again.",
        timestamp: new Date().toISOString(),
        mentor_name: selectedMentor.name,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
        <div className="flex items-center">
          <div className="w-6 h-6 mr-3 text-blue-600">💬</div>
          <div>
            <div className="font-semibold text-gray-900">
              Chatting with {selectedMentor?.name}
            </div>
            <div className="text-sm text-gray-600">
              Ask about security, performance, or code quality
            </div>
          </div>
        </div>
      </div>

      <MessageList messages={messages} isTyping={isTyping} />

      <MessageInput
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
      />
    </div>
  );
};

export default ChatInterface;
