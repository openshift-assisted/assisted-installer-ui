import * as React from 'react';
import { ChatBotWindowProps } from '../components/ChatBot/ChatBotWindow';
import { botRole, getErrorMessage, getToolAction, userRole } from '../components/ChatBot/helpers';

import UserAvatar from '../assets/avatarimg.svg';
import AIAvatar from '../assets/rh-logo.svg';
import {
  isEndStreamEvent,
  isInferenceStreamEvent,
  isStartStreamEvent,
  isToolArgStreamEvent,
  isToolResponseStreamEvent,
  StreamEvent,
} from '../components/ChatBot/types';

export const useMessages = ({
  username,
  onApiCall,
}: {
  username: string;
  onApiCall: typeof fetch;
}) => {
  const [error, setError] = React.useState<string>();
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState<string>();
  const [messages, setMessages] = React.useState<ChatBotWindowProps['messages']>([]);
  const [conversationId, setConversationId] = React.useState<string>();

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
              name: username,
              avatar: UserAvatar,
              timestamp,
            },
          },
          {
            pfProps: {
              role: botRole,
              content: '',
              name: 'AI',
              avatar: AIAvatar,
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
          credentials: 'include',
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
    [conversationId, onApiCall, username],
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
  };
};
