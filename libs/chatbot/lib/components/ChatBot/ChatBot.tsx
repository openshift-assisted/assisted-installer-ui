import * as React from 'react';
import { ChatbotToggle } from '@patternfly-6/chatbot';

import ChatBotWindow, { ChatBotWindowProps } from './ChatBotWindow';

import './Chatbot.css';

type ChatBotProps = Pick<ChatBotWindowProps, 'onApiCall' | 'username'>;

const ChatBot = ({ onApiCall, username }: ChatBotProps) => {
  const [conversationId, setConversationId] = React.useState<string>();
  const [messages, setMessages] = React.useState<ChatBotWindowProps['messages']>([]);
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);
  return (
    <div className="ai-chatbot">
      <ChatbotToggle
        tooltipLabel="Chatbot"
        isChatbotVisible={chatbotVisible}
        onToggleChatbot={() => setChatbotVisible(!chatbotVisible)}
      />
      {chatbotVisible && (
        <ChatBotWindow
          setMessages={setMessages}
          messages={messages}
          conversationId={conversationId}
          setConversationId={setConversationId}
          onClose={() => {
            setChatbotVisible(false);
            setMessages([]);
            setConversationId(undefined);
          }}
          onApiCall={onApiCall}
          username={username}
        />
      )}
    </div>
  );
};

export default ChatBot;
