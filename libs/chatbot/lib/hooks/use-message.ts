import * as React from 'react';
import { ChatBotWindowProps } from '../components/ChatBot/ChatBotWindow';
import {
  botRole,
  getErrorMessage,
  getToolAction,
  MsgProps,
  userRole,
} from '../components/ChatBot/helpers';

import {
  isEndStreamEvent,
  isInferenceStreamEvent,
  isStartStreamEvent,
  isToolArgStreamEvent,
  isToolResponseStreamEvent,
  StreamEvent,
} from '../components/ChatBot/types';

type Conversation = {
  chat_history: {
    messages: { content: string; type: 'user' | 'assistant' }[];
    completed_at: string;
  }[];
};

export const useMessages = ({ onApiCall }: { onApiCall: typeof fetch }) => {
  const [error, setError] = React.useState<string>();
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();
  const [messages, setMessages] = React.useState<ChatBotWindowProps['messages']>([]);
  const [conversationId, setConversationId] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);

  const loadConversation = React.useCallback(
    async (convId: string) => {
      setIsLoading(true);
      setError(undefined);
      setConversationId(convId);
      setMessages([]);
      try {
        const resp = await onApiCall(`/v1/conversations/${convId}`);
        if (!resp.ok) {
          throw Error(`Unexpected response code: ${resp.status}`);
        }
        const conv = (await resp.json()) as Conversation;

        const msgs = conv.chat_history.flatMap(({ messages, completed_at }) => {
          const timestamp = new Date(completed_at).toLocaleString();
          return messages.map<MsgProps>(({ content, type }) => ({
            pfProps: {
              content,
              role: type === 'assistant' ? botRole : userRole,
              timestamp,
            },
          }));
        });
        setMessages(msgs);
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    },
    [onApiCall],
  );

  const sentMessage = React.useCallback(
    async (message: string) => {
      setError(undefined);
      setIsStreaming(true);
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined = undefined;
      let eventEnded = false;
      const timestamp = new Date().toLocaleString();
      try {
        setAnnouncement(`Message from User: ${message}. Message from Bot is loading.`);
        setMessages((msgs) => [
          ...msgs,
          {
            pfProps: {
              role: userRole,
              content: `${message}`,
              timestamp,
            },
          },
          {
            pfProps: {
              role: botRole,
              content: '',
              timestamp,
            },
          },
        ]);

        let convId = '';

        const resp = await onApiCall('/v1/streaming_query', {
          method: 'POST',
          body: JSON.stringify({
            query: `${message}`,
            conversation_id: conversationId,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!resp.ok) {
          let errMsg = 'Failed to send message';
          try {
            const detailMsg = ((await resp.json()) as { detail: string }).detail;
            if (detailMsg) {
              errMsg = detailMsg;
            }
          } catch {}
          setError(`${resp.status}: ${errMsg}`);
          return;
        }

        reader = resp.body?.getReader();
        const decoder = new TextDecoder();

        let completeMsg = '';
        let buffer = '';
        const toolArgs: { [key: number]: { [key: string]: string } } = {};
        while (reader) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            const lines = part.split('\n');
            let data = '';
            for (const line of lines) {
              if (line.startsWith('data:')) {
                data += line.slice(5).trim() + '\n';
              }
            }
            const ev = JSON.parse(data) as StreamEvent;
            if (isEndStreamEvent(ev)) {
              eventEnded = true;
            } else if (isStartStreamEvent(ev)) {
              convId = ev.data.conversation_id;
            } else if (isInferenceStreamEvent(ev)) {
              const token = ev.data.token;
              completeMsg = `${completeMsg}${token}`;
              setMessages((msgs) => {
                const lastMsg = msgs[msgs.length - 1];
                const allButLast = msgs.slice(0, -1);
                return [
                  ...allButLast,
                  {
                    ...lastMsg,
                    pfProps: {
                      ...lastMsg.pfProps,
                      content: `${lastMsg.pfProps.content || ''}${token}`,
                    },
                  },
                ];
              });
            } else if (isToolArgStreamEvent(ev)) {
              toolArgs[ev.data.id] = ev.data.token.arguments;
            } else if (isToolResponseStreamEvent(ev)) {
              const action = getToolAction({
                toolName: ev.data.token.tool_name,
                response: ev.data.token.response,
                args: toolArgs[ev.data.id],
              });
              if (action) {
                setMessages((msgs) => {
                  const lastMsg = msgs[msgs.length - 1];
                  const allButLast = msgs.slice(0, -1);
                  return [
                    ...allButLast,
                    {
                      ...lastMsg,
                      actions: lastMsg.actions ? [...lastMsg.actions, action] : [action],
                    },
                  ];
                });
              }
            }
          }
        }

        setConversationId(convId);
        setAnnouncement(`Message from Bot: ${completeMsg}`);
        if (!eventEnded) {
          setError('An error occurred retrieving response');
        }
      } catch (e) {
        if (reader) {
          try {
            await reader.cancel('An error occurred');
          } catch (e) {
            // eslint-disable-next-line
            console.warn('Failed to cancel reader:', e);
          }
        }
        setError(getErrorMessage(e));
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, onApiCall],
  );

  const startNewConversation = React.useCallback(() => {
    setConversationId(undefined);
    setMessages([]);
  }, []);

  const resetError = React.useCallback(() => setError(undefined), []);

  return {
    sentMessage,
    startNewConversation,
    messages,
    conversationId,
    isStreaming,
    announcement,
    error,
    resetError,
    isLoading,
    loadConversation,
  };
};
