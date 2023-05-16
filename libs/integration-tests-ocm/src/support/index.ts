import './commands';
import './interceptors';
import './selectors';
import './variables/index';
import * as utils from './utils';
import installLogsCollector from 'cypress-terminal-report/src/installLogsCollector';

installLogsCollector();

export { utils };
