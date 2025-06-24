import {
  Chatbot,
  ChatbotAlert,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from '@patternfly-6/chatbot';
import * as React from 'react';
import isString from 'lodash-es/isString.js';

import AIAvatar from '../../assets/rh-logo.svg';
import UserAvatar from '../../assets/avatarimg.svg';
import { isQueryErr, MsgProps, QueryErr, QueryResponse } from './types';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'Unexpected error';
};

// Type for the API call function that consumers need to provide
export type ApiCallFunction = (body: {
  query: string;
  conversation_id: string | undefined;
}) => Promise<Response>;

const ChatBotWindow = ({
  conversationId,
  setConversationId,
  messages,
  setMessages,
  onApiCall,
}: {
  conversationId: string | undefined;
  setConversationId: (id: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<MsgProps[]>>;
  messages: MsgProps[];
  onApiCall: ApiCallFunction;
}) => {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  const handleSend = async (message: string | number) => {
    setError(undefined);
    setIsLoading(true);
    try {
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'user',
          content: `${message}`,
          name: 'User',
          avatar: UserAvatar,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setAnnouncement(`Message from User: ${message}. Message from Bot is loading.`);

      const resp = await onApiCall({
        query: `${message}`,
        conversation_id: conversationId,
      });

      const msg = (await resp.json()) as QueryResponse | QueryErr;
      if (isQueryErr(resp, msg)) {
        setError(msg.detail || 'An error occured');
        return;
      }
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'bot',
          content: `${msg.response}`,
          name: 'AI',
          avatar: AIAvatar,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setConversationId(msg.conversation_id);
      setAnnouncement(`Message from Bot: ${msg.response}`);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isLoading]);

  return (
    <div style={{ height: '400px' }}>
      <Chatbot displayMode={ChatbotDisplayMode.default}>
        <ChatbotContent>
          <MessageBox announcement={announcement} position={'top'}>
            {messages.length === 0 && (
              <ChatbotWelcomePrompt
                title="Hi, Assisted Installer User!"
                description="How can I help you today?"
              />
            )}
            {messages.map((message, index) => (
              <Message key={conversationId ? `${conversationId}-${index}` : index} {...message} />
            ))}
            {isLoading && <Message isLoading role="bot" avatar={AIAvatar} />}
            {error && (
              <ChatbotAlert
                variant="danger"
                onClose={() => setError(undefined)}
                title="Failed to send the message"
              >
                {error}
              </ChatbotAlert>
            )}
            <div ref={scrollToBottomRef} />
          </MessageBox>
        </ChatbotContent>
        <ChatbotFooter>
          <MessageBar
            onSendMessage={(msg) => void handleSend(msg)}
            isSendButtonDisabled={isLoading}
            hasAttachButton={false}
          />
        </ChatbotFooter>
      </Chatbot>
    </div>
  );
};

export default ChatBotWindow;
