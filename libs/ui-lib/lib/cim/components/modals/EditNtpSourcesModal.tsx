import * as React from 'react';
import {
	Alert,
	Button,
	ButtonVariant,
	Form,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalBoxBody,
	ModalBoxFooter,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { Formik, FormikProps } from 'formik';
import { InfraEnvK8sResource } from '../../types';
import { RadioField, AdditionalNTPSourcesField } from '../../../common';
import { EditNtpSourcesFormikValues } from './types';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export type EditNtpSourcesModalProps = {
  onSubmit: (
    values: EditNtpSourcesFormikValues,
    infraEnv: InfraEnvK8sResource,
  ) => Promise<InfraEnvK8sResource>;
  isOpen: boolean;
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
};

const EditNtpSourcesModal: React.FC<EditNtpSourcesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  infraEnv,
}) => {
  const [error, setError] = React.useState<string>();
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Edit Ntp sources dialog')}
      title={t('ai:Edit NTP sources')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="edit-ntp-sources-modal"
    >
      <Formik<EditNtpSourcesFormikValues>
        initialValues={{
          enableNtpSources: infraEnv.spec?.additionalNTPSources ? 'additional' : 'auto',
          additionalNtpSources: infraEnv.spec?.additionalNTPSources?.join(',') || '',
        }}
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
        {({
          isSubmitting,
          isValid,
          values,
          submitForm,
        }: FormikProps<EditNtpSourcesFormikValues>) => {
          return (
            <>
              <ModalBoxBody>
                <Form>
                  <Stack hasGutter>
                    <StackItem>
                      <RadioField
                        label={t('ai:Auto synchronized NTP (Network Time Protocol) sources')}
                        value="auto"
                        name="enableNtpSources"
                      />
                    </StackItem>
                    <StackItem>
                      <RadioField
                        name="enableNtpSources"
                        value="additional"
                        description={
                          <Stack hasGutter>
                            <StackItem>
                              {t(
                                'ai:Configure your own NTP sources to sychronize the time between the hosts that will be added to this infrastructure environment.',
                              )}
                            </StackItem>
                            <StackItem>
                              <AdditionalNTPSourcesField
                                name="additionalNtpSources"
                                isDisabled={values.enableNtpSources === 'auto'}
                                helperText={t(
                                  'ai:A comma separated list of IP or domain names of the NTP pools or servers.',
                                )}
                              />
                            </StackItem>
                          </Stack>
                        }
                        label={t('ai:Your own NTP (Network Time Protocol) sources')}
                      />
                    </StackItem>
                    {error && (
                      <StackItem>
                        <Alert variant="danger" title={error} />
                      </StackItem>
                    )}
                  </Stack>
                </Form>
              </ModalBoxBody>
              <ModalBoxFooter>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                  {t('ai:Save')}
                </Button>
                <Button onClick={onClose} variant={ButtonVariant.secondary}>
                  {t('ai:Cancel')}
                </Button>
              </ModalBoxFooter>
            </>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default EditNtpSourcesModal;
