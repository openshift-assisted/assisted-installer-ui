type StartStreamEvent = { event: 'start'; data: { conversation_id: string } };
type EndStreamEvent = { event: 'end' };
type InferenceStreamEvent = { event: 'token'; data: { token: string; role: 'inference' } };
type ToolArgStreamEvent = {
  event: 'tool_call';
  data: {
    id: number;
    token: { tool_name: string; arguments: { [key: string]: string } };
    role: string;
  };
};
type ToolResponseStreamEvent = {
  event: 'tool_call';
  data: {
    id: number;
    token: { tool_name: string; response: string };
    role: string;
  };
};

export type StreamEvent =
  | StartStreamEvent
  | EndStreamEvent
  | InferenceStreamEvent
  | ToolArgStreamEvent
  | ToolResponseStreamEvent;

export const isStartStreamEvent = (e: StreamEvent): e is StartStreamEvent => e.event === 'start';
export const isEndStreamEvent = (e: StreamEvent): e is EndStreamEvent => e.event === 'end';
export const isInferenceStreamEvent = (e: StreamEvent): e is InferenceStreamEvent =>
  e.event === 'token' && e.data.role === 'inference';

export const isToolArgStreamEvent = (e: StreamEvent): e is ToolArgStreamEvent =>
  e.event === 'tool_call' && typeof e.data.token === 'object' && 'arguments' in e.data.token;

export const isToolResponseStreamEvent = (e: StreamEvent): e is ToolResponseStreamEvent =>
  e.event === 'tool_call' && typeof e.data.token === 'object' && 'response' in e.data.token;
