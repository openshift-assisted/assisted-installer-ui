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
  MessageBoxHandle,
} from '@patternfly-6/chatbot';
import { Button, Flex, FlexItem, Tooltip } from '@patternfly-6/react-core';
import { PlusIcon } from '@patternfly-6/react-icons/dist/js/icons/plus-icon';
import { TimesIcon } from '@patternfly-6/react-icons/dist/js/icons/times-icon';

import BotMessage from './BotMessage';
import ConfirmNewChatModal from './ConfirmNewChatModal';
import { MESSAGE_BAR_ID, botRole, userRole, MsgProps } from './helpers';
import AIAlert from './AIAlert';

export type ChatBotWindowProps = {
  error?: string;
  resetError: VoidFunction;
  conversationId: string | undefined;
  messages: MsgProps[];
  onApiCall: typeof fetch;
  username: string;
  onClose: () => void;
  sentMessage: (msg: string) => Promise<unknown>;
  startNewConversation: VoidFunction;
  isStreaming: boolean;
  announcement: string | undefined;
  openClusterDetails: (clusterId: string) => void;
};

const ChatBotWindow = ({
  conversationId,
  messages,
  onApiCall,
  onClose,
  username,
  sentMessage,
  startNewConversation,
  isStreaming,
  announcement,
  error,
  resetError,
  openClusterDetails,
}: ChatBotWindowProps) => {
  const [triggerScroll, setTriggerScroll] = React.useState(0);
  const [msg, setMsg] = React.useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);
  const lastUserMsgRef = React.useRef<HTMLDivElement>(null);
  const msgBoxRef = React.useRef<MessageBoxHandle>(null);
  const msgBarRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    if (!isConfirmModalOpen) {
      msgBarRef.current?.focus();
    }
  }, [isConfirmModalOpen]);

  React.useEffect(() => {
    if (triggerScroll === 0) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: 'auto' });
    } else {
      const msgTop = lastUserMsgRef.current?.offsetTop;
      if (msgTop !== undefined && msgBoxRef.current) {
        msgBoxRef.current.scrollTo({
          top: msgTop,
          behavior: 'smooth',
        });
      }
    }
  }, [triggerScroll]);

  const getVisibleHeight = () => {
    if (lastUserMsgRef.current && msgBoxRef.current) {
      return msgBoxRef.current.clientHeight - lastUserMsgRef.current.clientHeight - 64;
    }
    return undefined;
  };

  const lastUserMsg = [...messages].reverse().findIndex((msg) => msg.pfProps.role === userRole);

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
                  onClick={() => setIsConfirmModalOpen(true)}
                  isDisabled={messages.length === 0}
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
        <MessageBox announcement={announcement} position={'top'} ref={msgBoxRef}>
          <AIAlert />
          {messages.length === 0 && (
            <ChatbotWelcomePrompt
              title={`Hi, ${username}!`}
              description="How can I help you today?"
            />
          )}
          {messages.map((message, index) => {
            const isLastMsg = index === messages.length - 1;
            const messageKey = conversationId ? `${conversationId}-${index}` : index;
            const isBotMessage = message.pfProps.role === botRole;
            if (isBotMessage) {
              return (
                <BotMessage
                  key={messageKey}
                  message={message}
                  onApiCall={onApiCall}
                  conversationId={conversationId}
                  userMsg={index > 0 ? messages[index - 1].pfProps.content || '' : ''}
                  isLoading={index === messages.length - 1 && isStreaming}
                  initHeight={isLastMsg ? getVisibleHeight() : undefined}
                  isLastMsg={isLastMsg}
                  openClusterDetails={openClusterDetails}
                />
              );
            }

            return (
              <Message
                key={messageKey}
                {...message.pfProps}
                innerRef={index === messages.length - 1 - lastUserMsg ? lastUserMsgRef : undefined}
              />
            );
          })}
          {error && (
            <ChatbotAlert variant="danger" onClose={resetError} title="An error occurred">
              {error}
            </ChatbotAlert>
          )}
          <div ref={scrollToBottomRef} />
        </MessageBox>
      </ChatbotContent>
      <ChatbotFooter>
        <MessageBar
          id={MESSAGE_BAR_ID}
          onSendMessage={() => {
            void sentMessage(msg);
            setTriggerScroll(triggerScroll + 1);
            setMsg('');
          }}
          isSendButtonDisabled={isStreaming || !msg.trim()}
          hasAttachButton={false}
          onChange={(_, value) => setMsg(`${value}`)}
          ref={msgBarRef}
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
          onConfirm={() => {
            startNewConversation();
            setIsConfirmModalOpen(false);
          }}
          onCancel={() => {
            setIsConfirmModalOpen(false);
          }}
        />
      )}
    </Chatbot>
  );
};

export default ChatBotWindow;
