import * as React from 'react';
import { Message } from '@patternfly-6/chatbot';
import MessageLoading from '@patternfly-6/chatbot/dist/cjs/Message/MessageLoading';
import { MsgProps } from './helpers';
import { Button, Stack, StackItem } from '@patternfly-6/react-core';
import { saveAs } from 'file-saver';
import { DownloadIcon, ExternalLinkAltIcon } from '@patternfly-6/react-icons';
import FeedbackForm from './FeedbackCard';

import AIAvatar from '../../assets/lightspeed-logo.svg';

// eslint-disable-next-line
// @ts-ignore
const MsgLoading = () => <MessageLoading loadingWord="Loading message" />;

export type FeedbackRequest = {
  userFeedback: string;
  sentiment: number;
  category?: string;
};

export type BotMessageProps = {
  message: MsgProps;
  isLoading: boolean;
  isLastMsg: boolean;
  initHeight?: number;
  onApiCall: typeof fetch;
  conversationId: string | undefined;
  userMsg: string;
  openClusterDetails: (clusterId: string) => void;
};

const BotMessage = ({
  onApiCall,
  message,
  isLoading,
  initHeight,
  isLastMsg,
  conversationId,
  userMsg,
  openClusterDetails,
}: BotMessageProps) => {
  const [openFeedback, setOpenFeedback] = React.useState(false);
  const [height, setHeight] = React.useState(initHeight);
  const msgRef = React.useRef<HTMLDivElement>(null);

  const onFeedbackSubmit = React.useCallback(
    async (req: FeedbackRequest): Promise<void> => {
      const resp = await onApiCall('/v1/feedback', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: conversationId,
          user_question: userMsg,
          user_feedback: req.userFeedback,
          llm_response: message.pfProps.content || '',
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
    [onApiCall, conversationId, message, userMsg],
  );

  // run on every re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    if (height && !isLoading && msgRef.current && msgRef.current.scrollHeight > height) {
      setHeight(undefined);
    }
  });

  return (
    <>
      <Message
        {...message.pfProps}
        name="Red Hat Lightspeed"
        avatarProps={{
          style: {
            height: 48,
            width: 48,
          },
        }}
        avatar={AIAvatar}
        hasRoundAvatar={false}
        style={height && isLastMsg ? { minHeight: height } : undefined}
        actions={
          isLoading
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
                  isDisabled: !message.pfProps.content,
                  onClick: () => {
                    void navigator.clipboard.writeText(message.pfProps.content || '');
                  },
                },
              }
        }
        innerRef={msgRef}
        extraContent={{
          afterMainContent: (
            <>
              {isLoading && <MsgLoading />}
              {!isLoading && message.actions?.length && (
                <Stack hasGutter>
                  {message.actions.map(({ title, url, clusterId }, idx) => (
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

export default BotMessage;
