import * as React from 'react';
import { ChatbotToggle } from '@patternfly-6/chatbot';

import ChatBotWindow, { ChatBotWindowProps } from './ChatBotWindow';

import './Chatbot.css';
import { useMessages } from '../../hooks/use-message';

type ChatBotProps = Pick<ChatBotWindowProps, 'onApiCall' | 'username'>;

const ChatBot = ({ onApiCall, username }: ChatBotProps) => {
  const messagesProps = useMessages({
    onApiCall,
    username,
  });
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
          {...messagesProps}
          onClose={() => {
            setChatbotVisible(false);
          }}
          onApiCall={onApiCall}
          username={username}
        />
      )}
    </div>
  );
};

export default ChatBot;
