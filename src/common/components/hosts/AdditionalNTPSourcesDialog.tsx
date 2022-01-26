import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Form,
  Modal,
  ModalVariant,
  ModalBoxBody,
  ModalBoxFooter,
  Button,
  AlertActionCloseButton,
  AlertVariant,
} from '@patternfly/react-core';
import {
  Cluster,
  ClusterUpdateParams,
  ntpSourceValidationSchema,
  AdditionalNTPSourcesField,
} from '../../../common';

export type AdditionalNTPSourcesFormProps = {
  additionalNtpSource: Cluster['additionalNtpSource'];
  onClose: () => void;
  onAdditionalNtpSource: (
    additionalNtpSource: string,
    onError: (message: string) => void,
  ) => Promise<void>;
};

const AdditionalNTPSourcesForm: React.FC<AdditionalNTPSourcesFormProps> = ({
  additionalNtpSource,
  onClose,
  onAdditionalNtpSource,
}) => {
  const initialValues: ClusterUpdateParams = {
    additionalNtpSource: additionalNtpSource || '',
  };

  const validationSchema = Yup.object().shape({
    additionalNtpSource: ntpSourceValidationSchema.required(),
  });

  const handleSubmit = async (
    values: ClusterUpdateParams,
    formikHelpers: FormikHelpers<ClusterUpdateParams>,
  ) => {
    formikHelpers.setStatus({ error: null });
    if (onAdditionalNtpSource && values.additionalNtpSource) {
      const onError = (message: string) =>
        formikHelpers.setStatus({
          error: {
            title: 'Failed to add NTP sources',
            message,
          },
        });
      onAdditionalNtpSource(values.additionalNtpSource, onError);
    }
    onClose();
  };

  return (
    <Formik
      initialValues={initialValues}
      initialTouched={{ additionalNtpSource: true }}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, status, setStatus, isSubmitting, isValid, dirty }) => {
        return (
          <>
            <ModalBoxBody>
              <Form>
                {status.error && (
                  <Alert
                    variant={AlertVariant.danger}
                    title={status.error.title}
                    actionClose={
                      <AlertActionCloseButton onClose={() => setStatus({ error: null })} />
                    }
                    isInline
                  >
                    {status.error.message}
                  </Alert>
                )}
                <AdditionalNTPSourcesField
                  name="additionalNtpSource"
                  label="Additional NTP Sources"
                  helperText="A comma separated list of IP or domain names of the NTP pools or servers. Additional NTP sources are added to all hosts to ensure all hosts clocks are synchronized with a valid NTP server. It may take a few minutes for the new NTP sources to sync."
                  isRequired
                />
              </Form>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                key="submit"
                onClick={submitForm}
                isDisabled={isSubmitting || !isValid || !dirty}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
              <Button key="cancel" variant="link" onClick={onClose}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};

type AdditionalNTPSourcesDialogProps = AdditionalNTPSourcesFormProps & {
  isOpen: boolean;
};

export const AdditionalNTPSourcesDialog: React.FC<AdditionalNTPSourcesDialogProps> = ({
  additionalNtpSource,
  isOpen,
  onClose,
  onAdditionalNtpSource,
}) => (
  <Modal
    aria-label="Add NTP sources"
    title="Add NTP sources"
    isOpen={isOpen}
    onClose={onClose}
    variant={ModalVariant.small}
    hasNoBodyWrapper
  >
    <AdditionalNTPSourcesForm
      additionalNtpSource={additionalNtpSource}
      onClose={onClose}
      onAdditionalNtpSource={onAdditionalNtpSource}
    />
  </Modal>
);
