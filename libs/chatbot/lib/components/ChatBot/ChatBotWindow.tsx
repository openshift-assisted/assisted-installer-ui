import * as React from 'react';
import isString from 'lodash-es/isString.js';
import {
  Chatbot,
  ChatbotAlert,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from '@patternfly-6/chatbot';
import { Alert, AlertActionCloseButton, Button } from '@patternfly-6/react-core';
import { ExternalLinkAltIcon } from '@patternfly-6/react-icons/dist/js/icons/external-link-alt-icon';

import AIAvatar from '../../assets/rh-logo.svg';
import UserAvatar from '../../assets/avatarimg.svg';

type StreamEvent =
  | { event: 'start'; data: { conversation_id: string } }
  | { event: 'token'; data: { token: string; role: string } }
  | { event: 'end' };

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'Unexpected error';
};

const CHAT_ALERT_LOCAL_STORAGE_KEY = 'assisted.hide.chat.alert';

type MsgProps = React.ComponentProps<typeof Message>;

export type ChatBotWindowProps = {
  conversationId: string | undefined;
  setConversationId: (id: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<MsgProps[]>>;
  messages: MsgProps[];
  onApiCall: typeof fetch;
  username: string;
};

const ChatBotWindow = ({
  conversationId,
  setConversationId,
  messages,
  setMessages,
  onApiCall,
  username,
}: ChatBotWindowProps) => {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();
  const [isAlertVisible, setIsAlertVisible] = React.useState(
    localStorage.getItem(CHAT_ALERT_LOCAL_STORAGE_KEY) !== 'true',
  );
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  const handleSend = async (message: string | number) => {
    setError(undefined);
    setIsLoading(true);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined = undefined;
    try {
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'user',
          content: `${message}`,
          name: username,
          avatar: UserAvatar,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setAnnouncement(`Message from User: ${message}. Message from Bot is loading.`);

      let convId = '';

      const resp = await onApiCall('/v1/streaming_query', {
        method: 'POST',
        body: JSON.stringify({
          query: `${message}`,
          conversation_id: conversationId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      reader = resp.body?.getReader();
      const decoder = new TextDecoder();

      const timestamp = new Date().toLocaleString();

      let completeMsg = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const ev = JSON.parse(chunk.slice(5).trim()) as StreamEvent;
        if (ev.event === 'start') {
          convId = ev.data.conversation_id;
        } else if (ev.event === 'token' && ev.data.role === 'inference') {
          setIsLoading(false);
          setIsStreaming(true);
          const token = ev.data.token;
          completeMsg = `${completeMsg}${token}`;
          setMessages((msgs) => {
            const lastMsg = msgs[msgs.length - 1];
            const msg =
              lastMsg.timestamp === timestamp && lastMsg.role === 'bot' ? lastMsg : undefined;
            if (!msg) {
              return [
                ...msgs,
                {
                  role: 'bot',
                  content: token,
                  name: 'AI',
                  avatar: AIAvatar,
                  timestamp: timestamp,
                },
              ];
            }

            const allButLast = msgs.slice(0, -1);
            return [
              ...allButLast,
              {
                ...msg,
                content: `${msg.content || ''}${token}`,
              },
            ];
          });
        }
      }

      setConversationId(convId);
      setAnnouncement(`Message from Bot: ${completeMsg}`);
    } catch (e) {
      if (reader) {
        try {
          await reader.cancel('An error occured');
        } catch (e) {
          // eslint-disable-next-line
          console.warn('Failed to cancel reader:', e);
        }
      }
      setError(getErrorMessage(e));
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    scrollToBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Chatbot displayMode={ChatbotDisplayMode.default}>
      <ChatbotContent>
        <MessageBox announcement={announcement} position={'top'}>
          {isAlertVisible && (
            <Alert
              variant="info"
              isInline
              title={
                <>
                  This feature uses AI technology. Do not include personal or sensitive information
                  in your input. Interactions may be used to improve Red Hat's products or services.
                  For more information about Red Hat's privacy practices, please refer to the
                  <Button
                    variant="link"
                    isInline
                    icon={<ExternalLinkAltIcon />}
                    component="a"
                    href="https://www.redhat.com/en/about/privacy-policy"
                    iconPosition="end"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Red Hat Privacy Statement
                  </Button>
                </>
              }
              actionClose={
                <AlertActionCloseButton
                  onClose={() => {
                    localStorage.setItem(CHAT_ALERT_LOCAL_STORAGE_KEY, 'true');
                    setIsAlertVisible(false);
                  }}
                />
              }
            />
          )}
          {messages.length === 0 && (
            <ChatbotWelcomePrompt
              title={`Hi, ${username}!`}
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
          isSendButtonDisabled={isLoading || isStreaming}
          hasAttachButton={false}
        />
        <ChatbotFootnote
          label="Always review AI generated content prior to use"
          popover={{
            title: 'Feature preview',
            description: `This tool is a preview, and while we strive for accuracy, there's always a possibility of errors. We recommend that you review AI generated content prior to use.`,
          }}
        />
      </ChatbotFooter>
    </Chatbot>
  );
};

export default ChatBotWindow;
