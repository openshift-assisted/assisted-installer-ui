import * as React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
	Alert,
	Button,
	ButtonVariant,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalBoxBody,
	ModalBoxFooter,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { Formik, useFormikContext } from 'formik';
import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import { LoadingState, PullSecretField, pullSecretValidationSchema } from '../../../common';
import { EditPullSecretFormikValues } from './types';
import { getWarningMessage } from './utils';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const validationSchema = (t: TFunction) =>
  Yup.object({
    pullSecret: pullSecretValidationSchema.required(t('ai:Pull secret is a required field.')),
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
  const { isSubmitting, isValid, submitForm, setFieldValue } =
    useFormikContext<EditPullSecretFormikValues>();

  React.useEffect(() => {
    if (!pullSecretLoading && !pullSecretError) {
      const pullSecretValue = atob(pullSecret?.data?.['.dockerconfigjson'] || '');
      setFieldValue('pullSecret', pullSecretValue);
      if (!pullSecret) {
        setFieldValue('createSecret', true);
      }
    }
  }, [pullSecret, pullSecretLoading, pullSecretError, setFieldValue]);
  const { t } = useTranslation();
  const warningMsg = getWarningMessage(hasAgents, hasBMHs, t);

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
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={submitForm}
          isDisabled={pullSecretLoading || !!pullSecretError || isSubmitting || !isValid}
        >
          {t('ai:Save')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary}>
          {t('ai:Cancel')}
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
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Edit pull secret dialog')}
      title={t('ai:Edit pull secret')}
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
        validationSchema={validationSchema(t)}
        onSubmit={async (values) => {
          try {
            await onSubmit(values, infraEnv);
            onClose();
          } catch (err) {
            setError(getErrorMessage(err));
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
