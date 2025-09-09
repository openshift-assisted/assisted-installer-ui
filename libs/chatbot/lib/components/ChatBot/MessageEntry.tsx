import * as React from 'react';
import { Message as MessageType } from '@redhat-cloud-services/ai-client-state';
import { LightSpeedCoreAdditionalProperties } from '@redhat-cloud-services/lightspeed-client';
import { Message } from '@patternfly/chatbot';
import { saveAs } from 'file-saver';
import { Button, Stack, StackItem } from '@patternfly-6/react-core';
import { DownloadIcon, ExternalLinkAltIcon } from '@patternfly-6/react-icons';

import { isToolArgStreamEvent, isToolResponseStreamEvent, StreamEvent } from './types';
import { getToolAction, MsgAction } from './helpers';
import FeedbackForm from './FeedbackCard';
import { FeedbackRequest } from './BotMessage';

export type MessageEntryProps = {
  openClusterDetails: (clusterId: string) => void;
  message: MessageType<LightSpeedCoreAdditionalProperties>;
  avatar: string;
  onApiCall: typeof fetch;
};

const MessageEntry = ({ message, avatar, openClusterDetails, onApiCall }: MessageEntryProps) => {
  const [openFeedback, setOpenFeedback] = React.useState(false);
  const onFeedbackSubmit = React.useCallback(
    async (req: FeedbackRequest): Promise<void> => {
      const resp = await onApiCall('/v1/feedback', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: message.additionalAttributes?.conversationId,
          user_question: 'TODO',
          user_feedback: req.userFeedback,
          llm_response: message.answer,
          sentiment: req.sentiment,
          category: req.category,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!resp.ok) {
        throw new Error(`${resp.status} ${resp.statusText}`);
      }
    },
    [onApiCall, message],
  );

  const messageDate = `${message.date?.toLocaleDateString()} ${message.date?.toLocaleTimeString()}`;
  const isLoading = message.role === 'bot' && message.answer === '';

  const toolArgs: { [key: string]: { [key: string]: string } } = {};
  const actions =
    message.role === 'user' || isLoading
      ? []
      : (message.additionalAttributes?.toolCalls as StreamEvent[])?.reduce<MsgAction[]>(
          (acc, ev) => {
            if (isToolArgStreamEvent(ev)) {
              toolArgs[ev.data.id] = ev.data.token.arguments;
            } else if (isToolResponseStreamEvent(ev)) {
              const action = getToolAction({
                toolName: ev.data.token.tool_name,
                response: ev.data.token.response,
                args: toolArgs[ev.data.id],
              });
              if (action) {
                acc.push(action);
              }
            }
            return acc;
          },
          [],
        );

  const feedback =
    message.role === 'user' || isLoading
      ? undefined
      : {
          positive: {
            ariaLabel: 'Good response',
            tooltipContent: 'Good response',
            clickedTooltipContent: 'Feedback sent',
            onClick: () => {
              void onFeedbackSubmit({
                userFeedback: '',
                sentiment: 1,
              });
            },
          },
          negative: {
            ariaLabel: 'Bad response',
            tooltipContent: 'Bad response',
            clickedTooltipContent: 'Feedback sent',
            onClick: () => setOpenFeedback(true),
          },
          copy: {
            isDisabled: !message.answer,
            onClick: () => {
              void navigator.clipboard.writeText(message.answer || '');
            },
          },
        };

  return (
    <>
      <Message
        id={`message-${message.id}`}
        // Don't want users to paste MD and display it
        isMarkdownDisabled={message.role === 'user'}
        isLoading={isLoading}
        role={message.role}
        avatar={avatar}
        content={message.answer}
        aria-label={`${message.role === 'user' ? 'Your message' : 'AI response'}: ${
          message.answer
        }`}
        timestamp={messageDate}
        actions={feedback}
        extraContent={{
          afterMainContent: (
            <>
              {actions?.length && (
                <Stack hasGutter>
                  {actions.map(({ title, url, clusterId }, idx) => (
                    <StackItem key={idx}>
                      {url && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            try {
                              saveAs(url);
                            } catch (error) {
                              // eslint-disable-next-line
                              console.error('Download failed: ', error);
                            }
                          }}
                          variant="secondary"
                          component="a"
                          href={url}
                          icon={<DownloadIcon />}
                        >
                          {title}
                        </Button>
                      )}
                      {clusterId && (
                        <Button
                          onClick={() => openClusterDetails(clusterId)}
                          variant="secondary"
                          icon={<ExternalLinkAltIcon />}
                        >
                          {title}
                        </Button>
                      )}
                    </StackItem>
                  ))}
                </Stack>
              )}
            </>
          ),
          endContent: openFeedback && (
            <FeedbackForm
              onFeedbackSubmit={async (req: FeedbackRequest) => {
                await onFeedbackSubmit(req);
                setOpenFeedback(false);
              }}
              onClose={() => setOpenFeedback(false)}
            />
          ),
        }}
      />
    </>
  );
};

export default MessageEntry;
