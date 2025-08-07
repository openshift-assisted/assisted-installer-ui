import isString from 'lodash-es/isString.js';
import { Message } from '@patternfly-6/chatbot';

export type MsgProps = {
  pfProps: React.ComponentProps<typeof Message>;
  actions?: { title: string; url: string }[];
};

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
    if (msg?.pfProps.role === userRole && msg.pfProps.content) {
      return String(msg.pfProps.content);
    }
  }

  return undefined;
};

type GetToolActionArgs = {
  toolName: string;
  response: string;
  args?: { [key: string]: string };
};

export const getToolAction = ({
  toolName,
  response,
  args,
}: GetToolActionArgs): { title: string; url: string } | undefined => {
  switch (toolName) {
    case 'cluster_iso_download_url': {
      if (!response) {
        return undefined;
      }
      let res: { url: string }[] | undefined = undefined;
      try {
        res = JSON.parse(response) as {
          url: string;
        }[];
      } catch {
        return undefined;
      }

      const url = res?.length ? res[0].url : undefined;
      if (url) {
        return {
          title: 'Download ISO',
          url,
        };
      }
    }
    case 'cluster_credentials_download_url': {
      if (!response) {
        return undefined;
      }
      let res: { url: string } | undefined = undefined;
      try {
        res = JSON.parse(response) as { url: string };
      } catch {
        return undefined;
      }

      if (res?.url) {
        return {
          title: `Download ${args?.file_name || 'credentials'}`,
          url: res.url,
        };
      }
    }
  }
  return undefined;
};
