import * as React from 'react';
import {
  Alert,
  Button,
  ButtonVariant,
  Form,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikProps } from 'formik';
import { InfraEnvK8sResource } from '../../types';
import { RadioField, AdditionalNTPSourcesField } from '../../../common';
import { EditNtpSourcesFormikValues } from './types';

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
  const [error, setError] = React.useState();
  return (
    <Modal
      aria-label="Edit Ntp sources dialog"
      title="Edit NTP sources"
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
            setError(err?.message || 'An error occured');
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
                        label="Auto synchronized NTP (Network Time Protocol) sources"
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
                              Configure your own NTP sources to sychronize the time between the
                              hotsts that will be added to this infrastructure environment.
                            </StackItem>
                            <StackItem>
                              <AdditionalNTPSourcesField
                                name="additionalNtpSources"
                                isDisabled={values.enableNtpSources === 'auto'}
                                helperText="A comma separated list of IP or domain names of the NTP pools or servers."
                              />
                            </StackItem>
                          </Stack>
                        }
                        label="Your own NTP (Network Time Protocol) sources"
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
                <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                  Save
                </Button>
                <Button onClick={onClose} variant={ButtonVariant.secondary}>
                  Cancel
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
