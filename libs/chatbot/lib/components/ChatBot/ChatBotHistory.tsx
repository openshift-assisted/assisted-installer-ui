import * as React from 'react';
import {
  ChatbotConversationHistoryNav,
  ChatbotDisplayMode,
  Conversation,
} from '@patternfly/chatbot';
import { Alert } from '@patternfly-6/react-core';
import { getErrorMessage } from './helpers';

type ConversationHistory = { conversations: { conversation_id: string; created_at: string }[] };

type ChatBotHistoryProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApiCall: typeof fetch;
  startNewConversation: VoidFunction;
  loadConversation: (id: string) => Promise<unknown>;
  conversationId?: string;
};

const ChatBotHistory = ({
  isOpen,
  setIsOpen,
  children,
  onApiCall,
  conversationId,
  startNewConversation,
  loadConversation,
}: React.PropsWithChildren<ChatBotHistoryProps>) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const abortController = new AbortController();
    setIsLoading(true);
    setError(undefined);
    void (async () => {
      try {
        const resp = await onApiCall('/v1/conversations', { signal: abortController.signal });
        if (!resp.ok) {
          throw Error(`Unexpected response code: ${resp.status}`);
        }
        const cnvs = (await resp.json()) as ConversationHistory;
        setConversations(
          cnvs.conversations
            .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
            .map(({ conversation_id, created_at }) => ({
              id: conversation_id,
              text: new Date(created_at).toLocaleString(),
            })),
        );
      } catch (e) {
        // aborting fetch throws 'AbortError', we can ignore it
        if (abortController.signal.aborted) {
          return;
        }
        setError(getErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    })();
    return () => abortController.abort();
  }, [isOpen, onApiCall]);

  return (
    <ChatbotConversationHistoryNav
      setIsDrawerOpen={setIsOpen}
      isDrawerOpen={isOpen}
      drawerContent={children}
      displayMode={ChatbotDisplayMode.default}
      onDrawerToggle={() => {
        setIsOpen(!isOpen);
      }}
      isLoading={isLoading}
      conversations={conversations}
      onNewChat={startNewConversation}
      onSelectActiveItem={(_, itemId) => {
        itemId !== undefined && void loadConversation(`${itemId}`);
        setIsOpen(!isOpen);
      }}
      activeItemId={conversationId}
      errorState={
        error
          ? {
              bodyText: (
                <Alert variant="danger" isInline title="Failed to load conversation history">
                  {error}
                </Alert>
              ),
            }
          : undefined
      }
      emptyState={
        !isLoading && !conversations.length
          ? {
              bodyText: 'No conversation history',
            }
          : undefined
      }
    />
  );
};

export default ChatBotHistory;
