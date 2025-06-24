import '@patternfly-6/patternfly/dist/patternfly.css';
import '@patternfly-6/patternfly/dist/patternfly-addons.css';
import '@patternfly-6/patternfly/dist/patternfly-base.css';
import '@patternfly-6/react-core/dist/styles/base.css';
import '@patternfly-6/chatbot/dist/css/main.css';
import '@patternfly-6/patternfly/dist/base/patternfly-variables.css';

import { ChatBot as LibChatBot, ApiCallFunction } from '@openshift-assisted/chatbot';
import axios from 'axios';

const axiosApiCall: ApiCallFunction = async (body) => {
  const axiosResponse = await axios.post('/chat/v1/query', JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AIUI_APP_TOKEN}`,
    },
  });

  // Convert axios response to fetch-like Response object
  return {
    json: async () => Promise.resolve(axiosResponse.data),
    ok: axiosResponse.status >= 200 && axiosResponse.status < 300,
    status: axiosResponse.status,
  } as Response;
};

const ChatBot = () => <LibChatBot onApiCall={axiosApiCall} />;
export default ChatBot;
