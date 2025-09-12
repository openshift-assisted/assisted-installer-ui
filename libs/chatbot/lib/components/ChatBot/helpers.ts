import isString from 'lodash-es/isString.js';
import { Message } from '@patternfly/chatbot';
import { validate as uuidValidate } from 'uuid';

export type MsgAction = { title: string; url?: string; clusterId?: string };

export type MsgProps = {
  pfProps: Pick<React.ComponentProps<typeof Message>, 'role' | 'content' | 'timestamp'>;
  actions?: MsgAction[];
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
}: GetToolActionArgs): MsgAction | undefined => {
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
      return undefined;
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
      return undefined;
    }
    case 'install_cluster': {
      if (args?.cluster_id) {
        return {
          title: 'Open cluster details page',
          clusterId: args.cluster_id,
        };
      }
      return undefined;
    }
    case 'create_cluster': {
      if (response && uuidValidate(response)) {
        return {
          title: 'Open cluster details page',
          clusterId: response,
        };
      }
      return undefined;
    }
  }
  return undefined;
};
