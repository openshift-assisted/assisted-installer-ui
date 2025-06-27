import '@patternfly-6/patternfly/dist/patternfly.css';
import '@patternfly-6/patternfly/dist/patternfly-addons.css';
import '@patternfly-6/patternfly/dist/patternfly-base.css';
import '@patternfly-6/react-core/dist/styles/base.css';
import '@patternfly-6/chatbot/dist/css/main.css';
import '@patternfly-6/patternfly/dist/base/patternfly-variables.css';

import { ChatBot as LibChatBot } from '@openshift-assisted/chatbot';

const ChatBot = () => <LibChatBot />;
export default ChatBot;
