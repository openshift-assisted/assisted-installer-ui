import * as React from 'react';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  ButtonVariant,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikProps } from 'formik';
import { InfraEnvK8sResource } from '../../types';
import {
  getRichTextValidation,
  InfraEnvNtpSourcesFields,
  ntpSourceValidationSchema,
} from '../../../common';
import { EditNtpSourcesFormikValues } from './types';
import { getErrorMessage } from '../../../common/utils';
import { getWarningMessage } from './utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

const validationSchema = (t: TFunction) =>
  Yup.lazy((values: EditNtpSourcesFormikValues) =>
    Yup.object<EditNtpSourcesFormikValues>().shape({
      additionalNTPSources: values.useAdditionalNTPSources
        ? ntpSourceValidationSchema(t, false)
        : ntpSourceValidationSchema(t),
      ntpSources: values.useNTPSources
        ? ntpSourceValidationSchema(t, false)
        : ntpSourceValidationSchema(t),
    }),
  );

export type EditNtpSourcesModalProps = {
  onSubmit: (
    values: EditNtpSourcesFormikValues,
    infraEnv: InfraEnvK8sResource,
  ) => Promise<InfraEnvK8sResource>;
  isOpen: boolean;
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  hasAgents: boolean;
  hasBMHs: boolean;
};

const getEditNtpSourcesInitialValues = (
  infraEnv: InfraEnvK8sResource,
): EditNtpSourcesFormikValues => {
  const hasExclusive = !!infraEnv.spec?.ntpSources?.length;
  const hasAdditional = !!infraEnv.spec?.additionalNTPSources?.length;

  return {
    useNTPSources: hasExclusive,
    ntpSources: infraEnv.spec?.ntpSources?.join(',') || '',
    useAdditionalNTPSources: !hasExclusive && hasAdditional,
    additionalNTPSources: infraEnv.spec?.additionalNTPSources?.join(',') || '',
  };
};

const EditNtpSourcesModal: React.FC<EditNtpSourcesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  infraEnv,
  hasAgents,
  hasBMHs,
}) => {
  const [error, setError] = React.useState<string>();
  const { t } = useTranslation();
  const warningMsg = getWarningMessage(hasAgents, hasBMHs, t);
  return (
    <Modal
      aria-label={t('ai:Edit Ntp sources dialog')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      id="edit-ntp-sources-modal"
    >
      <ModalHeader title={t('ai:Edit NTP sources')} />
      {isOpen && (
        <Formik<EditNtpSourcesFormikValues>
          initialValues={getEditNtpSourcesInitialValues(infraEnv)}
          validate={getRichTextValidation(validationSchema(t))}
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
          {({ isSubmitting, isValid, submitForm }: FormikProps<EditNtpSourcesFormikValues>) => (
            <>
              <ModalBody>
                <Stack hasGutter>
                  <StackItem>
                    <Alert isInline variant="warning" title={warningMsg} />
                  </StackItem>
                  <StackItem>
                    <Form>
                      <InfraEnvNtpSourcesFields />
                      {error && <Alert variant="danger" title={error} />}
                    </Form>
                  </StackItem>
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button onClick={() => void submitForm()} isDisabled={isSubmitting || !isValid}>
                  {t('ai:Save')}
                </Button>
                <Button onClick={onClose} variant={ButtonVariant.secondary}>
                  {t('ai:Cancel')}
                </Button>
              </ModalFooter>
            </>
          )}
        </Formik>
      )}
    </Modal>
  );
};

export default EditNtpSourcesModal;
