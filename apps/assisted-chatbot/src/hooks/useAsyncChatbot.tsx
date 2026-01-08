import React from 'react';
import { createClientStateManager } from '@redhat-cloud-services/ai-client-state';
import { Message as MessageType } from '@redhat-cloud-services/ai-client-state';
import {
  LightSpeedCoreAdditionalProperties,
  LightspeedClient,
} from '@redhat-cloud-services/lightspeed-client';
import { ScalprumComponent, ScalprumComponentProps } from '@scalprum/react-core';

import { Models, StateManagerConfiguration, UseManagerHook } from '../types';
import ARH_BOT_ICON from '../assets/Ask_Red_Hat_OFFICIAL-whitebackground.svg';
import { AsyncMessagePlaceholder } from '../components/AsyncMessagePlaceholder/AsyncMessagePlaceholder';
import { Message } from '@patternfly/chatbot';
import { getBaseUrl } from '../config';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

type LightspeedMessage = ScalprumComponentProps<
  Record<string, unknown>,
  {
    message: MessageType<LightSpeedCoreAdditionalProperties>;
    avatar: string;
    conversationId: string | undefined;
  }
>;

const AsyncMessageError = () => (
  <Message
    avatar={ARH_BOT_ICON}
    role="bot"
    content="Unable to load content"
    error={{
      title: 'unable to load message component',
      children: 'Please try again later or contact support',
      variant: 'danger',
    }}
  />
);

const LSCMessageEntry = ({
  message,
  avatar,
  conversationId,
}: {
  message: MessageType<LightSpeedCoreAdditionalProperties>;
  avatar: string;
  conversationId: string;
}) => {
  const messageProps: LightspeedMessage = {
    message,
    avatar: message.role === 'user' ? avatar : ARH_BOT_ICON,
    scope: 'assistedInstallerApp',
    module: './ChatbotMessageEntry',
    fallback: null,
    conversationId,
  };
  return (
    <ScalprumComponent
      {...messageProps}
      ErrorComponent={<AsyncMessageError />}
      fallback={<AsyncMessagePlaceholder />}
    />
  );
};

const useIsAuthenticated = () => {
  const chrome = useChrome();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      const api = new URL(getBaseUrl());
      const token = await chrome.auth.getToken();
      try {
        const response = await fetch(`https://assisted-chat.${api.hostname}/v1/conversations`, {
          method: 'GET',
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isAuthenticated,
    isLoading,
  };
};

const useStateManager = (): UseManagerHook => {
  const chrome = useChrome();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const manager = React.useMemo(() => {
    const api = new URL(getBaseUrl());
    const client = new LightspeedClient({
      baseUrl: `https://assisted-chat.${api.hostname}`,
      fetchFunction: async (input, init) => {
        const token = await chrome.auth.getToken();
        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      },
    });
    const stateManager = createClientStateManager(client);
    const config: StateManagerConfiguration<LightspeedClient> = {
      model: Models.OAI,
      stateManager,
      historyManagement: true,
      streamMessages: true,
      modelName: 'OpenShift Assisted Installer',
      docsUrl:
        'https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/2025/html/installing_openshift_container_platform_with_the_assisted_installer/index',
      selectionTitle: 'OpenShift Assisted Installer',
      selectionDescription:
        'Create, configure, and install OpenShift Container Platform clusters using the Assisted Installer.',
      MessageEntryComponent: LSCMessageEntry,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      handleNewChat: async (toggleDrawer) => {
        // can't use hooks here, we are not yet within the correct React context
        await stateManager.createNewConversation();
        toggleDrawer(false);
      },
      isPreview: true,
      welcome: {
        buttons: [
          {
            title: 'Create a new OpenShift cluster',
            value: 'Create a new OpenShift cluster',
          },
          {
            title: 'List my OpenShift clusters',
            value: 'List my OpenShift clusters',
          },
          {
            title: 'List available OpenShift versions',
            value: 'List available OpenShift versions',
          },
        ],
      },
      routes: ['/openshift/assisted-installer/*'],
    };

    return config;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return { manager: null, loading: true };
  }
  if (!isAuthenticated) {
    return { manager: null, loading: false };
  }

  return { manager, loading: false };
};

export default useStateManager;
