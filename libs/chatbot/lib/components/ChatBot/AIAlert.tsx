import { Alert, AlertActionCloseButton, Stack, StackItem } from '@patternfly-6/react-core';
import * as React from 'react';
import ExternalLink from './ExternalLink';

const CHAT_ALERT_LOCAL_STORAGE_KEY = 'assisted.hide.chat.alert';

const AIAlert = () => {
  const [isAlertVisible, setIsAlertVisible] = React.useState(
    localStorage.getItem(CHAT_ALERT_LOCAL_STORAGE_KEY) !== 'true',
  );

  if (!isAlertVisible) {
    return null;
  }

  return (
    <Alert
      variant="info"
      isInline
      title={
        <Stack>
          <StackItem>
            This feature uses AI technology. Do not include personal or sensitive information in
            your input. Interactions may be used to improve Red Hat's products or services.
          </StackItem>
          <StackItem>
            <ExternalLink href="https://www.redhat.com/en/about/privacy-policy">
              Red Hat Privacy Statement
            </ExternalLink>
          </StackItem>
        </Stack>
      }
      actionClose={
        <AlertActionCloseButton
          onClose={() => {
            localStorage.setItem(CHAT_ALERT_LOCAL_STORAGE_KEY, 'true');
            setIsAlertVisible(false);
          }}
        />
      }
    />
  );
};

export default AIAlert;
