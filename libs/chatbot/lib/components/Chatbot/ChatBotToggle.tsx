import { ChatbotToggle } from '@patternfly-6/chatbot';
import * as React from 'react';

const ChatBotToggle = ({
  chatbotVisible,
  setChatbotVisible,
}: {
  chatbotVisible: boolean;
  setChatbotVisible: (visible: boolean) => void;
}) => {
  return (
    <ChatbotToggle
      tooltipLabel="Chatbot"
      isChatbotVisible={chatbotVisible}
      onToggleChatbot={() => setChatbotVisible(!chatbotVisible)}
    />
  );
};

export default ChatBotToggle;
