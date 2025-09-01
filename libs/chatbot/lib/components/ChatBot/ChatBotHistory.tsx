import * as React from 'react';
import {
  ChatbotConversationHistoryNav,
  ChatbotDisplayMode,
  Conversation,
} from '@patternfly/chatbot';
import { Alert, MenuItemAction } from '@patternfly-6/react-core';
import { getErrorMessage } from './helpers';
import { TrashAltIcon } from '@patternfly-6/react-icons';
import DeleteConversationModal from './DeleteConversationModal';

type ConversationHistory = { conversations: { conversation_id: string; created_at: string }[] };

type ChatBotHistoryProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onApiCall: typeof fetch;
  startNewConversation: (closeDrawer?: boolean) => void;
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
  const [deleteConversation, setDeleteConversation] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [error, setError] = React.useState<string>();

  const fetchConversations = React.useCallback(
    async (signal?: AbortSignal) => {
      const resp = await onApiCall('/v1/conversations', { signal });
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
    },
    [onApiCall],
  );

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const abortController = new AbortController();
    setIsLoading(true);
    setError(undefined);
    void (async () => {
      try {
        await fetchConversations(abortController.signal);
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
  }, [isOpen, fetchConversations]);

  return (
    <>
      <ChatbotConversationHistoryNav
        setIsDrawerOpen={setIsOpen}
        isDrawerOpen={isOpen}
        drawerContent={children}
        displayMode={ChatbotDisplayMode.default}
        onDrawerToggle={() => {
          setIsOpen(!isOpen);
        }}
        isLoading={isLoading}
        conversations={conversations.map<Conversation>((c) => ({
          ...c,
          additionalProps: {
            actions: (
              <MenuItemAction
                icon={<TrashAltIcon />}
                actionId="delete"
                onClick={() => setDeleteConversation(c.id)}
                aria-label={`Delete conversation from ${c.text}`}
              />
            ),
          },
        }))}
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
      {deleteConversation && (
        <DeleteConversationModal
          conversation={conversations.find(({ id }) => id === deleteConversation) as Conversation}
          onClose={() => setDeleteConversation(undefined)}
          onDelete={async () => {
            const resp = await onApiCall(`/v1/conversations/${deleteConversation}`, {
              method: 'DELETE',
            });
            if (!resp.ok) {
              let errMsg = `Unexpected response code ${resp.status}`;
              try {
                const errDetail = (await resp.json()) as { detail?: { cause?: string } };
                if (errDetail.detail?.cause) {
                  errMsg = errDetail.detail.cause;
                }
              } catch {
                //failed to get err cause
              }
              throw errMsg;
            }
            const deleteResult = (await resp.json()) as { success: boolean; response: string };
            if (!deleteResult.success) {
              throw deleteResult.response;
            }

            // if current conversationId is deleted, start a new conversation
            if (deleteConversation === conversationId) {
              startNewConversation(false);
            }

            await fetchConversations();
          }}
        />
      )}
    </>
  );
};

export default ChatBotHistory;
