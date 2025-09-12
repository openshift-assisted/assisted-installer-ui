import * as React from 'react';
import {
  Chatbot,
  ChatbotAlert,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotFootnote,
  ChatbotHeader,
  ChatbotHeaderActions,
  ChatbotHeaderCloseButton,
  ChatbotHeaderMain,
  ChatbotHeaderMenu,
  ChatbotHeaderTitle,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
  MessageBoxHandle,
} from '@patternfly/chatbot';
import { Brand, EmptyState, Spinner } from '@patternfly-6/react-core';

import BotMessage from './BotMessage';
import { MESSAGE_BAR_ID, botRole, userRole, MsgProps } from './helpers';
import AIAlert from './AIAlert';

import LightSpeedLogo from '../../assets/lightspeed-logo.svg';
import UserAvatar from '../../assets/avatarimg.svg';
import ChatBotHistory from './ChatBotHistory';
import PreviewBadge from './PreviewBadge';

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
  isLoading: boolean;
  loadConversation: (convId: string) => Promise<unknown>;
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
  isLoading,
  loadConversation,
}: ChatBotWindowProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [triggerScroll, setTriggerScroll] = React.useState(0);
  const [msg, setMsg] = React.useState('');
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);
  const lastUserMsgRef = React.useRef<HTMLDivElement>(null);
  const msgBoxRef = React.useRef<MessageBoxHandle>(null);
  const msgBarRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    if (!isDrawerOpen) {
      requestAnimationFrame(() => msgBarRef.current?.focus());
    }
  }, [isDrawerOpen, isLoading]);

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
  }, [triggerScroll, isLoading]);

  const getVisibleHeight = () => {
    if (lastUserMsgRef.current && msgBoxRef.current) {
      return msgBoxRef.current.clientHeight - lastUserMsgRef.current.clientHeight - 64;
    }
    return undefined;
  };

  const lastUserMsg = [...messages].reverse().findIndex((msg) => msg.pfProps.role === userRole);

  return (
    <Chatbot displayMode={ChatbotDisplayMode.default}>
      <ChatBotHistory
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        onApiCall={onApiCall}
        startNewConversation={(closeDrawer = true) => {
          startNewConversation();
          closeDrawer && setIsDrawerOpen(false);
        }}
        loadConversation={(id) => {
          setTriggerScroll(0);
          return loadConversation(id);
        }}
        conversationId={conversationId}
      >
        <>
          <ChatbotHeader>
            <ChatbotHeaderMain>
              <ChatbotHeaderMenu
                aria-expanded={isDrawerOpen}
                onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
              />
              <ChatbotHeaderTitle className="ai-chatbot__brand">
                <Brand
                  src={LightSpeedLogo}
                  alt="OpenShift Lightspeed"
                  style={{ height: 46, width: 46, maxHeight: 46 }}
                />
              </ChatbotHeaderTitle>
            </ChatbotHeaderMain>
            <ChatbotHeaderActions>
              <PreviewBadge />
              <ChatbotHeaderCloseButton onClick={onClose} />
            </ChatbotHeaderActions>
          </ChatbotHeader>
          <ChatbotContent>
            {isLoading ? (
              <EmptyState titleText="Loading conversation" headingLevel="h4" icon={Spinner} />
            ) : (
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
                      innerRef={
                        index === messages.length - 1 - lastUserMsg ? lastUserMsgRef : undefined
                      }
                      avatar={UserAvatar}
                      name={username}
                      hasRoundAvatar={false}
                      avatarProps={{
                        style: {
                          height: 48,
                          width: 48,
                        },
                      }}
                      isMarkdownDisabled
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
            )}
          </ChatbotContent>
          <ChatbotFooter>
            <MessageBar
              id={MESSAGE_BAR_ID}
              onSendMessage={() => {
                void sentMessage(msg);
                setTriggerScroll((prev) => prev + 1);
                setMsg('');
              }}
              isSendButtonDisabled={isStreaming || !msg.trim() || isLoading}
              hasAttachButton={false}
              onChange={(_, value) => setMsg(`${value}`)}
              ref={msgBarRef}
            />
            <ChatbotFootnote label="Always review AI generated content prior to use" />
          </ChatbotFooter>
        </>
      </ChatBotHistory>
    </Chatbot>
  );
};

export default ChatBotWindow;
