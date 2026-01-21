import * as React from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { MessageEntry, MessageEntryProps } from '@openshift-assisted/chatbot';
import { getBaseUrl } from '../../config';

const ChatbotMessageEntry = (
  props: Omit<MessageEntryProps, 'onApiCall' | 'openClusterDetails'>,
) => {
  const { chromeHistory, auth } = useChrome();

  const onApiCall = React.useCallback<typeof fetch>(
    async (input, init) => {
      const userToken = await auth.getToken();
      const api = new URL(getBaseUrl());
      return fetch(`https://assisted-chat.${api.hostname}${String(input)}`, {
        ...init,
        headers: {
          ...init?.headers,
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const openClusterDetails = React.useCallback(
    (id: string) => {
      chromeHistory.push(`/openshift/assisted-installer/clusters/${id}`);
    },
    [chromeHistory],
  );

  return <MessageEntry onApiCall={onApiCall} openClusterDetails={openClusterDetails} {...props} />;
};

export default ChatbotMessageEntry;
