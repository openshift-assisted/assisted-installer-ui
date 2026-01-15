import * as React from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { MessageEntry, MessageEntryProps } from '@openshift-assisted/chatbot';
import { getBaseUrl } from '../../config';

const ChatbotMessageEntry = (
  props: Omit<MessageEntryProps, 'onApiCall' | 'openClusterDetails'>,
) => {
  const { chromeHistory, ...chrome } = useChrome();

  const onApiCall = React.useCallback<MessageEntryProps['onApiCall']>(async (input, init) => {
    const userToken = await chrome.auth.getToken();
    const api = new URL(getBaseUrl());
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return fetch(`https://assisted-chat.${api.hostname}${input}`, {
      ...(init || {}),
      headers: {
        ...(init?.headers || {}),
        ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openClusterDetails = React.useCallback<MessageEntryProps['openClusterDetails']>(
    (id) => {
      chromeHistory.push(`/openshift/assisted-installer/clusters/${id}`);
    },
    [chromeHistory],
  );

  return <MessageEntry onApiCall={onApiCall} openClusterDetails={openClusterDetails} {...props} />;
};

export default ChatbotMessageEntry;
