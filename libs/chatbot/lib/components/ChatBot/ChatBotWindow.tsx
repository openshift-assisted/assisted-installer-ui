import * as React from 'react';
import {
  Chatbot,
  ChatbotAlert,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotHeader,
  ChatbotHeaderTitle,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from '@patternfly-6/chatbot';
import {
  Alert,
  AlertActionCloseButton,
  Button,
  Flex,
  FlexItem,
  Tooltip,
} from '@patternfly-6/react-core';
import { ExternalLinkAltIcon } from '@patternfly-6/react-icons/dist/js/icons/external-link-alt-icon';
import { PlusIcon } from '@patternfly-6/react-icons/dist/js/icons/plus-icon';
import { TimesIcon } from '@patternfly-6/react-icons/dist/js/icons/times-icon';

import BotMessage, { FeedbackRequest } from './BotMessage';
import ConfirmNewChatModal from './ConfirmNewChatModal';
import {
  focusSendMessageInput as focusNewMessageBox,
  getErrorMessage,
  getUserQuestionForBotAnswer,
  MESSAGE_BAR_ID,
  botRole,
  userRole,
  MsgProps,
} from './helpers';
import AIAvatar from '../../assets/rh-logo.svg';
import UserAvatar from '../../assets/avatarimg.svg';

type StreamEvent =
  | { event: 'start'; data: { conversation_id: string } }
  | { event: 'token'; data: { token: string; role: string } }
  | { event: 'end' };

const CHAT_ALERT_LOCAL_STORAGE_KEY = 'assisted.hide.chat.alert';

export type ChatBotWindowProps = {
  conversationId: string | undefined;
  setConversationId: (id: string | undefined) => void;
  setMessages: React.Dispatch<React.SetStateAction<MsgProps[]>>;
  messages: MsgProps[];
  onApiCall: typeof fetch;
  username: string;
  onClose: () => void;
};

const ChatBotWindow = ({
  conversationId,
  setConversationId,
  messages,
  setMessages,
  onApiCall,
  onClose,
  username,
}: ChatBotWindowProps) => {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();
  const [isAlertVisible, setIsAlertVisible] = React.useState(
    localStorage.getItem(CHAT_ALERT_LOCAL_STORAGE_KEY) !== 'true',
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = React.useRef(false);

  const startNewChat = () => {
    setConversationId(undefined);
    setMessages([]);
    setIsConfirmModalOpen(false);
    focusNewMessageBox();
  };

  const handleNewChat = () => {
    // Only show confirmation if there are existing messages
    if (messages.length > 0) {
      setIsConfirmModalOpen(true);
    } else {
      startNewChat();
    }
  };

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    scrollToBottomRef.current?.scrollIntoView({ behavior });
  }, []);

  React.useEffect(() => {
    // Determine scroll behavior: auto for initial render with existing messages, smooth for new content
    const scrollBehavior = !hasInitiallyScrolled.current && messages.length > 0 ? 'auto' : 'smooth';
    scrollToBottom(scrollBehavior);
    hasInitiallyScrolled.current = true;
  }, [messages, scrollToBottom]);

  const handleSend = async (message: string | number) => {
    setError(undefined);
    setIsLoading(true);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined = undefined;
    try {
      setMessages((msgs) => [
        ...msgs,
        {
          role: userRole,
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

      if (!resp.ok) {
        const errMsg = (await resp.json()) as { detail: string };
        throw Error(errMsg.detail);
      }

      reader = resp.body?.getReader();
      const decoder = new TextDecoder();

      const timestamp = new Date().toLocaleString();

      let completeMsg = '';
      while (reader) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunks = decoder.decode(value, { stream: true }).split('\n');
        for (const chunk of chunks) {
          if (!chunk.startsWith('data: ')) {
            continue;
          }
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
                lastMsg.timestamp === timestamp && lastMsg.role === botRole ? lastMsg : undefined;
              if (!msg) {
                return [
                  ...msgs,
                  {
                    role: botRole,
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

  const onFeedbackSubmit = React.useCallback(
    async (req: FeedbackRequest): Promise<void> => {
      const botMessageIdx = req.messageIndex;

      if (botMessageIdx < 0 || botMessageIdx >= messages.length) {
        throw new Error(`Invalid message index: ${botMessageIdx}`);
      }

      const resp = await onApiCall('/v1/feedback', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: conversationId,
          user_question: getUserQuestionForBotAnswer(messages, botMessageIdx),
          user_feedback: req.userFeedback,
          llm_response: messages[botMessageIdx].content || '',
          sentiment: req.sentiment,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!resp.ok) {
        throw new Error(`Failed to submit feedback: ${resp.status} ${resp.statusText}`);
      }

      // Resolve the promise to avoid unhandled rejection
      await resp.json();
    },
    [onApiCall, conversationId, messages],
  );

  return (
    <Chatbot displayMode={ChatbotDisplayMode.default}>
      <ChatbotHeader>
        <ChatbotHeaderTitle>
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            className="pf-v6-u-w-100"
          >
            <FlexItem>
              <Tooltip content="New chat">
                <Button
                  variant="plain"
                  aria-label="New chat"
                  id="new-chat-button"
                  icon={<PlusIcon size={40} />}
                  onClick={handleNewChat}
                />
              </Tooltip>
            </FlexItem>
            <FlexItem>
              <Tooltip content="Close chat">
                <Button
                  variant="plain"
                  aria-label="Close chat"
                  id="close-chat-button"
                  icon={<TimesIcon size={40} />}
                  onClick={onClose}
                />
              </Tooltip>
            </FlexItem>
          </Flex>
        </ChatbotHeaderTitle>
      </ChatbotHeader>
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
          {messages.map((message, index) => {
            const messageKey = conversationId ? `${conversationId}-${index}` : index;
            const isBotMessage = message.role === botRole;
            if (isBotMessage) {
              return (
                <BotMessage
                  key={messageKey}
                  messageIndex={index}
                  message={message}
                  onFeedbackSubmit={onFeedbackSubmit}
                  onScrollToBottom={scrollToBottom}
                />
              );
            }

            return <Message key={messageKey} {...message} />;
          })}
          {isLoading && <Message isLoading role={botRole} avatar={AIAvatar} />}
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
          id={MESSAGE_BAR_ID}
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
      {isConfirmModalOpen && (
        <ConfirmNewChatModal
          onConfirm={startNewChat}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </Chatbot>
  );
};

export default ChatBotWindow;
