import { Message } from '@patternfly-6/chatbot';

export type QueryResponse = { response: string; conversation_id: string };
export type QueryErr = { detail?: string };

export const isQueryErr = (resp: Response, msg: QueryResponse | QueryErr): msg is QueryErr =>
  !resp.ok;

export type MsgProps = React.ComponentProps<typeof Message>;
