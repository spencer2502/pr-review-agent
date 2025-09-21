import React from "react";
import { Send } from "lucide-react";

const MessageInput = ({
  currentMessage,
  setCurrentMessage,
  onSendMessage,
  isTyping,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage(currentMessage);
  };

  return (
    <div className="p-4 border-t bg-gray-50 rounded-b-xl">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Ask me about the PR analysis..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!currentMessage.trim() || isTyping}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
