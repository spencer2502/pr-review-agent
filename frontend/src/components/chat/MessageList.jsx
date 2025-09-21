import React from "react";

const MessageList = ({ messages, isTyping }) => {
  const suggestedQuestions = [
    "What security issues did you find?",
    "How can I fix these problems?",
    "Explain the Time Machine predictions",
  ];

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">🤖</div>
          <p className="text-lg font-medium">Ready to help with your PR!</p>
          <div className="mt-4 space-y-2">
            <p className="text-sm">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-md px-4 py-3 rounded-2xl shadow-sm ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : message.role === "system"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            {message.role === "assistant" && message.mentor_name && (
              <div className="text-xs text-gray-600 mb-1 font-medium">
                {message.mentor_name}
              </div>
            )}
            <p className="text-sm leading-relaxed">{message.content}</p>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
