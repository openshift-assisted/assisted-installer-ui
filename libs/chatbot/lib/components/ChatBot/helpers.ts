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
