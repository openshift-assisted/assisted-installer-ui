import * as React from 'react';
import { Message } from '@patternfly-6/chatbot';
import { UserFeedbackProps } from '@patternfly-6/chatbot/dist/cjs/Message/UserFeedback/UserFeedback';

type MsgProps = React.ComponentProps<typeof Message>;

type SentimentActionClick = (isPositive: boolean) => void;

export type FeedbackRequest = {
  messageIndex: number;
  userFeedback: string;
  sentiment: number;
};

const getActions = (text: string, onActionClick: SentimentActionClick) => ({
  positive: {
    ariaLabel: 'Good response',
    tooltipContent: 'Good response',
    clickedTooltipContent: 'Feedback sent',
    onClick: () => {
      onActionClick(true);
    },
  },
  negative: {
    ariaLabel: 'Bad response',
    tooltipContent: 'Bad response',
    clickedTooltipContent: 'Feedback sent',
    onClick: () => {
      onActionClick(false);
    },
  },
  copy: {
    onClick: () => {
      void navigator.clipboard.writeText(text);
    },
  },
});

const userFeedbackForm = (
  onSubmit: (quickResponse: string | undefined, additionalFeedback: string | undefined) => void,
  onClose: VoidFunction,
) => ({
  onClose,
  onSubmit,
  title: 'Please provide feedback',
  textAreaAriaLabel: 'Additional feedback',
  textAreaPlaceholder: 'Add details here',
  hasTextArea: true,
  closeButtonAriaLabel: 'Close feedback form',
  focusOnLoad: false,
});

export type BotMessageProps = {
  onFeedbackSubmit: (req: FeedbackRequest) => Promise<void>;
  messageIndex: number;
  message: MsgProps;
  onScrollToBottom: () => void;
};

const BotMessage = ({
  onFeedbackSubmit,
  messageIndex,
  message,
  onScrollToBottom,
}: BotMessageProps) => {
  const [isNegativeFeedback, setIsNegativeFeedback] = React.useState<boolean>(false);

  // Scroll to bottom when negative feedback form opens
  React.useEffect(() => {
    if (isNegativeFeedback) {
      // Use requestAnimationFrame to ensure the form is rendered and painted
      requestAnimationFrame(() => {
        // Double RAF to ensure layout is complete
        requestAnimationFrame(() => {
          onScrollToBottom();
        });
      });
    }
  }, [isNegativeFeedback, onScrollToBottom]);

  const actions = React.useMemo(() => {
    return getActions(message.content || '', (positiveFeedback) => {
      if (positiveFeedback) {
        const submitPositiveFeedback = async () => {
          try {
            await onFeedbackSubmit({
              messageIndex,
              userFeedback: '',
              sentiment: 1,
            });
          } finally {
            setIsNegativeFeedback(false);
          }
        };
        void submitPositiveFeedback();
      } else {
        setIsNegativeFeedback(true);
      }
    });
  }, [message.content, onFeedbackSubmit, messageIndex]);

  const userFeedbackFormConfig = React.useMemo<UserFeedbackProps | undefined>(() => {
    return isNegativeFeedback
      ? userFeedbackForm(
          (_quickResponse: string | undefined, additionalFeedback: string | undefined) => {
            const submitNegativeFeedback = async () => {
              try {
                await onFeedbackSubmit({
                  messageIndex,
                  userFeedback: additionalFeedback || '',
                  sentiment: -1,
                });
              } finally {
                setIsNegativeFeedback(false);
              }
            };
            void submitNegativeFeedback();
          },
          () => {
            setIsNegativeFeedback(false);
          },
        )
      : undefined;
  }, [isNegativeFeedback, onFeedbackSubmit, messageIndex]);

  return <Message {...message} actions={actions} userFeedbackForm={userFeedbackFormConfig} />;
};

export default BotMessage;
