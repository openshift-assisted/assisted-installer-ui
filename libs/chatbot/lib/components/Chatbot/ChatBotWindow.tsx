import {
  Chatbot,
  ChatbotContent,
  ChatbotDisplayMode,
  ChatbotFooter,
  ChatbotWelcomePrompt,
  Message,
  MessageBar,
  MessageBox,
} from '@patternfly-6/chatbot';
import * as React from 'react';

import AIAvatar from '../../assets/rh-logo.svg';
import UserAvatar from '../../assets/avatarimg.svg';

type MsgProps = React.ComponentProps<typeof Message>;

const ChatBotWindow = () => {
  const [messages, setMessages] = React.useState<MsgProps[]>([]);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);
  const isVisible = true;
  const displayMode = ChatbotDisplayMode.default;

  // you will likely want to come up with your own unique id function; this is for demo purposes only
  const generateId = () => {
    const id = Date.now() + Math.random();
    return id.toString();
  };

  const handleSend = (message: string | number) => {
    setIsSendButtonDisabled(true);
    const newMessages: MsgProps[] = [];
    // We can't use structuredClone since messages contains functions, but we can't mutate
    // items that are going into state or the UI won't update correctly
    messages.forEach((message) => newMessages.push(message));
    // It's important to set a timestamp prop since the Message components re-render.
    // The timestamps re-render with them.
    const date = new Date();
    newMessages.push({
      id: generateId(),
      role: 'user',
      content: `${message}`,
      name: 'User',
      avatar: UserAvatar,
      timestamp: date.toLocaleString(),
      avatarProps: { isBordered: true },
    });
    newMessages.push({
      id: generateId(),
      role: 'bot',
      content: 'API response goes here',
      name: 'Bot',
      isLoading: true,
      avatar: AIAvatar,
      timestamp: date.toLocaleString(),
    });
    setMessages(newMessages);
    // make announcement to assistive devices that new messages have been added
    setAnnouncement(`Message from User: ${message}. Message from Bot is loading.`);

    // this is for demo purposes only; in a real situation, there would be an API response we would wait for
    setTimeout(() => {
      const loadedMessages: MsgProps[] = [];
      // We can't use structuredClone since messages contains functions, but we can't mutate
      // items that are going into state or the UI won't update correctly
      newMessages.forEach((message) => loadedMessages.push(message));
      loadedMessages.pop();
      loadedMessages.push({
        id: generateId(),
        role: 'bot',
        content: 'API response goes here',
        name: 'Bot',
        isLoading: false,
        avatar: AIAvatar,
        timestamp: date.toLocaleString(),
      });
      setMessages(loadedMessages);
      // make announcement to assistive devices that new message has loaded
      setAnnouncement(`Message from Bot: API response goes here`);
      setIsSendButtonDisabled(false);
    }, 5000);
  };

  return (
    <div style={{ height: '400px' }}>
      <Chatbot displayMode={displayMode} isVisible={isVisible}>
        <ChatbotContent>
          <MessageBox announcement={announcement} position={'top'}>
            {messages.length === 0 && (
              <ChatbotWelcomePrompt
                title="Hi, ChatBot User!"
                description="How can I help you today?"
              />
            )}
            {messages.map((message, index) => {
              const msg = <Message key={message.id} {...message} />;

              if (index === messages.length - 1) {
                return (
                  <>
                    <div ref={scrollToBottomRef} />
                    {msg}
                  </>
                );
              }
              return msg;
            })}
          </MessageBox>
        </ChatbotContent>
        <ChatbotFooter>
          <MessageBar
            onSendMessage={handleSend}
            hasMicrophoneButton
            isSendButtonDisabled={isSendButtonDisabled}
          />
        </ChatbotFooter>
      </Chatbot>
    </div>
  );
};

export default ChatBotWindow;
