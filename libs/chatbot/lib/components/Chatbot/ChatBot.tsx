import * as React from 'react';

import ChatBotToggle from './ChatBotToggle';
import ChatBotWindow, { ApiCallFunction } from './ChatBotWindow';

import './Chatbot.css';
import { MsgProps } from './types';

const ChatBot = ({ onApiCall }: { onApiCall: ApiCallFunction }) => {
  const [conversationId, setConversationId] = React.useState<string>();
  const [messages, setMessages] = React.useState<MsgProps[]>([]);
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);
  return (
    <div id="chatbot-overlay" className="ai-chatbot">
      <ChatBotToggle chatbotVisible={chatbotVisible} setChatbotVisible={setChatbotVisible} />
      {chatbotVisible && (
        <ChatBotWindow
          setMessages={setMessages}
          messages={messages}
          conversationId={conversationId}
          setConversationId={setConversationId}
          onApiCall={onApiCall}
        />
      )}
    </div>
  );
};

export default ChatBot;
