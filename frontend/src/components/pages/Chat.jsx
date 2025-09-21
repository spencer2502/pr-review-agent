import React from "react";
import MentorSelector from "../chat/MentorSelector";
import ChatInterface from "../chat/ChatInterface";

const Chat = ({ analysis, selectedMentor, setSelectedMentor }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <MentorSelector
          selectedMentor={selectedMentor}
          setSelectedMentor={setSelectedMentor}
        />
      </div>
      <div className="lg:col-span-3">
        <ChatInterface analysis={analysis} selectedMentor={selectedMentor} />
      </div>
    </div>
  );
};

export default Chat;
