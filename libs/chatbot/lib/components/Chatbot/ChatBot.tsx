import * as React from 'react';

import './Chatbot.css';

import ChatBotToggle from './ChatBotToggle';
import ChatBotWindow from './ChatBotWindow';

const ChatBot = () => {
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);
  return (
    <div id="chatbot-overlay" className="ai-chatbot">
      <ChatBotToggle chatbotVisible={chatbotVisible} setChatbotVisible={setChatbotVisible} />
      {chatbotVisible && <ChatBotWindow />}
    </div>
  );
};

export default ChatBot;
