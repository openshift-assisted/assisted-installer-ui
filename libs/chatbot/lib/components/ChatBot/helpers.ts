import isString from 'lodash-es/isString.js';
import { Message } from '@patternfly-6/chatbot';

export type MsgProps = React.ComponentProps<typeof Message>;

export const MESSAGE_BAR_ID = 'assisted-chatbot__message-bar';
export const botRole = 'bot';
export const userRole = 'user';

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'Unexpected error';
};

export const focusSendMessageInput = () => {
  requestAnimationFrame(() => {
    const inputElement = document.querySelector(`#${MESSAGE_BAR_ID}`) as HTMLElement;
    if (inputElement) {
      inputElement.focus();
    }
  });
};

// Helper function to get the user question for a bot message
export const getUserQuestionForBotAnswer = (
  messages: MsgProps[],
  messageIndex: number,
): string | undefined => {
  if (messageIndex === 0) {
    return undefined;
  }
  // Look backwards from the previous message to find the most recent user message
  for (let i = messageIndex - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === userRole && msg.content) {
      return String(msg.content);
    }
  }

  return undefined;
};
