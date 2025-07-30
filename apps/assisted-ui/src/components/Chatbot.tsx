import { ChatBot as AIChatBot, ChatBotWindowProps } from '@openshift-assisted/chatbot';

import '@patternfly-6/react-core/dist/styles/base.css';
import '@patternfly-6/chatbot/dist/css/main.css';
import '@patternfly-6/patternfly/dist/patternfly-addons.css';

export const getOcmToken = () =>
  (import.meta.env.AIUI_OCM_TOKEN as string | undefined) || window.OCM_TOKEN;

const ChatBot = () => {
  const onApiCall: ChatBotWindowProps['onApiCall'] = async (input, init) => {
    return fetch(`/chatbot${input.toString()}`, {
      ...(init || {}),
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${getOcmToken() || ''}`,
      },
    });
  };

  return <AIChatBot onApiCall={onApiCall} username={'Assisted Installer user'} />;
};

export default ChatBot;
