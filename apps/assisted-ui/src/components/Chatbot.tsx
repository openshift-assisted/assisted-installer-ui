import * as React from 'react';
import { ChatBot as AIChatBot, ChatBotWindowProps } from '@openshift-assisted/chatbot';
import { useNavigate } from 'react-router-dom-v5-compat';

import '@patternfly-6/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import '@patternfly-6/patternfly/patternfly-addons.css';

export const refreshToken =
  (import.meta.env.AIUI_OCM_REFRESH_TOKEN as string | undefined) || window.OCM_REFRESH_TOKEN;
let expiration = Date.now();
let token = '';

export const getOcmToken = async () => {
  // if token expires in less than 5s, refresh it
  if (Date.now() > expiration - 5000) {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken || '');
    params.append('client_id', 'cloud-services');

    try {
      const response = await fetch('/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = (await response.json()) as { access_token: string; expires_in: number };
      token = data.access_token;
      expiration = Date.now() + data.expires_in * 1000;
    } catch (error) {
      // eslint-disable-next-line
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }
  return token;
};

const ChatBot = () => {
  const navigate = useNavigate();
  const onApiCall = React.useCallback<ChatBotWindowProps['onApiCall']>(async (input, init) => {
    const token = await getOcmToken();
    return fetch(`/chatbot${input.toString()}`, {
      ...(init || {}),
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }, []);

  const openClusterDetails = React.useCallback<ChatBotWindowProps['openClusterDetails']>(
    (id) => navigate(`/assisted-installer/clusters/${id}`),
    [navigate],
  );

  return (
    <AIChatBot
      onApiCall={onApiCall}
      username={'Assisted Installer user'}
      openClusterDetails={openClusterDetails}
    />
  );
};

export default ChatBot;
