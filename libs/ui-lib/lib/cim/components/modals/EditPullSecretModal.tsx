import * as React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
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
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { SecretModel } from '../../types/models';

const validationSchema = (t: TFunction) =>
  Yup.object({
    pullSecret: pullSecretValidationSchema.required(t('ai:Pull secret is a required field.')),
  });

type EditPullSecretFormProps = {
  onClose: VoidFunction;
  pullSecret: SecretK8sResource | undefined;
  pullSecretError: unknown | undefined;
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
    body = <Alert title={getErrorMessage(pullSecretError)} variant="danger" isInline />;
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
  infraEnv: InfraEnvK8sResource;
};

const EditPullSecretModal: React.FC<EditPullSecretModalProps> = ({
  onClose,
  infraEnv,
  ...rest
}) => {
  const [error, setError] = React.useState<string | undefined>();
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Edit pull secret dialog')}
      title={t('ai:Edit pull secret')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="edit-pull-secret-modal"
    >
      <Formik<EditPullSecretFormikValues>
        initialValues={{
          pullSecret: '',
          createSecret: false,
        }}
        validationSchema={validationSchema(t)}
        onSubmit={async (values) => {
          const secret = {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: {
              namespace: infraEnv.metadata?.namespace,
              name: infraEnv.spec?.pullSecretRef?.name,
            },
          };

          try {
            if (values.createSecret) {
              await k8sCreate<SecretK8sResource>({
                model: SecretModel,
                data: {
                  ...secret,
                  data: {
                    '.dockerconfigjson': btoa(values.pullSecret),
                  },
                  type: 'kubernetes.io/dockerconfigjson',
                },
              });
            } else {
              await k8sPatch({
                model: SecretModel,
                resource: secret,
                data: [
                  {
                    op: 'replace',
                    path: '/data/.dockerconfigjson',
                    value: btoa(values.pullSecret),
                  },
                ],
              });
            }

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
