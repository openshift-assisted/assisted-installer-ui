import * as React from 'react';

import ChatBotWindow, { ChatBotWindowProps } from './ChatBotWindow';
import { useMessages } from '../../hooks/use-message';
import ChatBotButton from './ChatBotButton';

import './Chatbot.css';

type ChatBotProps = Pick<ChatBotWindowProps, 'onApiCall' | 'username' | 'openClusterDetails'>;

const ChatBot = ({ onApiCall, username, openClusterDetails }: ChatBotProps) => {
  const messagesProps = useMessages({
    onApiCall,
  });
  const [chatbotVisible, setChatbotVisible] = React.useState<boolean>(false);

  return (
    <div className="ai-chatbot">
      <ChatBotButton chatbotVisible={chatbotVisible} setChatbotVisible={setChatbotVisible} />
      {chatbotVisible && (
        <ChatBotWindow
          {...messagesProps}
          onClose={() => {
            setChatbotVisible(false);
          }}
          onApiCall={onApiCall}
          username={username}
          openClusterDetails={openClusterDetails}
        />
      )}
    </div>
  );
};

export default ChatBot;
