import {
  Alert,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextArea,
} from '@patternfly/react-core';
import * as React from 'react';
import { FeedbackRequest } from './BotMessage';
import { TimesIcon } from '@patternfly/react-icons';
import { getErrorMessage } from './helpers';

const categories: { [key: string]: string } = {
  incorrect: 'Incorrect',
  not_relevant: 'Not relevant',
  incomplete: 'Incomplete',
  outdated_information: 'Outdated information',
  unsafe: 'Unsafe',
  other: 'Other',
};

const FeedbackForm = ({
  onFeedbackSubmit,
  onClose,
}: {
  onFeedbackSubmit: (req: FeedbackRequest) => Promise<void>;
  onClose: VoidFunction;
}) => {
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [category, setCategory] = React.useState(Object.keys(categories)[0]);
  const [feedback, setFeedback] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const submit = async () => {
    setError(undefined);
    setIsSubmitting(true);
    try {
      await onFeedbackSubmit({
        sentiment: -1,
        userFeedback: feedback,
        category,
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card ouiaId="FeedbackCard" style={{ width: '100%' }}>
      <CardHeader
        actions={{
          actions: (
            <Button
              variant={ButtonVariant.plain}
              onClick={onClose}
              icon={<TimesIcon />}
              isDisabled={isSubmitting}
            />
          ),
        }}
      >
        <CardTitle>Please provide feedback</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Form>
              <FormGroup label="Category">
                <Select
                  id="select-category"
                  isOpen={categoryOpen}
                  selected={category}
                  onSelect={(_, val) => {
                    setCategory(`${val || ''}`);
                    setCategoryOpen(false);
                  }}
                  onOpenChange={setCategoryOpen}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      isExpanded={categoryOpen}
                      style={{
                        width: '100%',
                      }}
                      isDisabled={isSubmitting}
                    >
                      {categories[category]}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <SelectList>
                    {Object.keys(categories).map((key) => (
                      <SelectOption key={key} value={key}>
                        {categories[key]}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FormGroup>
              <FormGroup label="Feedback">
                <TextArea
                  id="feedback-text-area"
                  value={feedback}
                  onChange={(_, value) => setFeedback(value)}
                  ref={textAreaRef}
                  isDisabled={isSubmitting}
                  resizeOrientation="vertical"
                />
              </FormGroup>
            </Form>
          </StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant="danger" title="Failed to submit feedback">
                {error}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </CardBody>
      <CardFooter>
        <Button
          onClick={() => {
            void submit();
          }}
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedbackForm;
