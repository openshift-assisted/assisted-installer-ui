import * as React from 'react';
import { Button, Icon, Popover } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import LightSpeedLogo from '../../assets/lightspeed-logo.svg';

const CHAT_NEWS_LOCAL_STORAGE_KEY = 'assisted.hide.chat.news';

const ChatBotButton = ({
  chatbotVisible,
  setChatbotVisible,
}: {
  chatbotVisible: boolean;
  setChatbotVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const defaultVal = localStorage.getItem(CHAT_NEWS_LOCAL_STORAGE_KEY);
  const [isVisible, setIsVisible] = React.useState<boolean | undefined>(
    defaultVal === null ? undefined : defaultVal !== 'true',
  );

  React.useEffect(() => {
    const id = setTimeout(
      () => setIsVisible((visible) => (visible === undefined ? true : false)),
      2000,
    );
    return () => window.clearTimeout(id);
  }, []);

  const closeToolbar = () => {
    setIsVisible(false);
    localStorage.setItem(CHAT_NEWS_LOCAL_STORAGE_KEY, 'true');
  };
  return (
    <Popover
      isVisible={!!isVisible}
      headerContent={
        <div>
          <Icon status="info">
            <InfoCircleIcon />
          </Icon>{' '}
          Speed up your workflow with AI
        </div>
      }
      bodyContent={
        <>
          <p>
            <b>Red Hat OpenShift Lightspeed</b> helps you work smarter, not harder. Get instant
            answers, step-by-step guidance, and personalized assistance for OpenShift Assisted
            Installer process.
          </p>
          <p>Ready to give it a try ?</p>
        </>
      }
      position="top-end"
      withFocusTrap={false}
      onHide={closeToolbar}
      shouldClose={closeToolbar}
    >
      <Button
        aria-label={chatbotVisible ? 'Close chat' : 'Open chat'}
        aria-haspopup="dialog"
        aria-expanded={chatbotVisible}
        aria-controls="ai-chatbot-panel"
        onClick={() => {
          setChatbotVisible((v) => !v);
          closeToolbar();
        }}
        icon={
          <img src={LightSpeedLogo} alt="OpenShift Lightspeed" style={{ height: 46, width: 46 }} />
        }
        variant="plain"
        hasNoPadding
        className="ai-chatbot__button"
      />
    </Popover>
  );
};

export default ChatBotButton;
