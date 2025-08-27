import { Alert, AlertActionCloseButton, Button, Stack, StackItem } from '@patternfly-6/react-core';
import { ExternalLinkAltIcon } from '@patternfly-6/react-icons/dist/js/icons/external-link-alt-icon';
import * as React from 'react';

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
            <Button
              variant="link"
              isInline
              icon={<ExternalLinkAltIcon />}
              component="a"
              href="https://www.redhat.com/en/about/privacy-policy"
              iconPosition="end"
              target="_blank"
              rel="noopener noreferrer"
            >
              Red Hat Privacy Statement
            </Button>
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
