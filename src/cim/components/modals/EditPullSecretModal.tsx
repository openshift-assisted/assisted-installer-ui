import * as React from 'react';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  ButtonVariant,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import { LoadingState, PullSecretField, pullSecretValidationSchema } from '../../../common';
import { EditPullSecretFormikValues } from './types';
import { getWarningMessage } from './utils';

const validationSchema = Yup.object({
  pullSecret: pullSecretValidationSchema.required('Pull secret is a required field.'),
});

type EditPullSecretFormProps = {
  onClose: VoidFunction;
  pullSecret: SecretK8sResource | undefined;
  pullSecretError: string | undefined;
  pullSecretLoading: boolean;
  hasAgents: boolean;
  hasBMHs: boolean;
  error?: string;
};

const EditPullSecretForm: React.FC<EditPullSecretFormProps> = ({
  pullSecret,
  pullSecretError,
  pullSecretLoading,
  onClose,
  error: submitError,
  hasAgents,
  hasBMHs,
}) => {
  const { isSubmitting, isValid, submitForm, setFieldValue } = useFormikContext<
    EditPullSecretFormikValues
  >();

  React.useEffect(() => {
    if (!pullSecretLoading && !pullSecretError) {
      const pullSecretValue = atob(pullSecret?.data?.['.dockerconfigjson'] || '');
      setFieldValue('pullSecret', pullSecretValue);
      if (!pullSecret) {
        setFieldValue('createSecret', true);
      }
    }
  }, [pullSecret, pullSecretLoading, pullSecretError, setFieldValue]);

  const warningMsg = getWarningMessage(hasAgents, hasBMHs);

  let body = (
    <Stack hasGutter>
      <StackItem>
        <Alert isInline variant="warning" title={warningMsg} />
      </StackItem>
      <StackItem>
        <PullSecretField isOcm={false} />
      </StackItem>
    </Stack>
  );
  if (pullSecretLoading) {
    body = <LoadingState />;
  } else if (pullSecretError) {
    body = <Alert title={pullSecretError} variant="danger" isInline />;
  }
  return (
    <>
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>{body}</StackItem>
        </Stack>
        {submitError && (
          <StackItem>
            <Alert title={submitError} variant="danger" isInline />
          </StackItem>
        )}
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          onClick={submitForm}
          isDisabled={pullSecretLoading || !!pullSecretError || isSubmitting || !isValid}
        >
          Save pull secret
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary}>
          Cancel
        </Button>
      </ModalBoxFooter>
    </>
  );
};

export type EditPullSecretModalProps = EditPullSecretFormProps & {
  onSubmit: (
    values: EditPullSecretFormikValues,
    infraEnv: InfraEnvK8sResource,
  ) => Promise<InfraEnvK8sResource>;
  isOpen: boolean;
  infraEnv: InfraEnvK8sResource;
};

const EditPullSecretModal: React.FC<EditPullSecretModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  infraEnv,
  ...rest
}) => {
  const [error, setError] = React.useState<string | undefined>();
  return (
    <Modal
      aria-label="Edit pull secret dialog"
      title="Edit pull secret"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="edit-pull-secret-modal"
    >
      <Formik<EditPullSecretFormikValues>
        initialValues={{
          pullSecret: undefined,
          createSecret: false,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          try {
            await onSubmit(values, infraEnv);
            onClose();
          } catch (err) {
            setError(err?.message || 'An error occured');
          }
        }}
        validateOnMount
      >
        <EditPullSecretForm {...rest} onClose={onClose} error={error} />
      </Formik>
    </Modal>
  );
};

export default EditPullSecretModal;
