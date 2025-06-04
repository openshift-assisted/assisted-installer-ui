import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
	Form,
	Button
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant,
	ModalBoxBody,
	ModalBoxFooter
} from '@patternfly/react-core/deprecated';
import {
  ntpSourceValidationSchema,
  AdditionalNTPSourcesField,
  StatusErrorType,
} from '../../../common';
import { AlertFormikError } from '../../../common/components/ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import {
  Cluster,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';

export type AdditionalNTPSourcesFormProps = {
  additionalNtpSource: Cluster['additionalNtpSource'];
  onClose: () => void;
  onAdditionalNtpSource: (
    additionalNtpSource: string,
    onError: (message: string) => void,
  ) => Promise<void>;
};

const AdditionalNTPSourcesForm = ({
  additionalNtpSource,
  onClose,
  onAdditionalNtpSource,
}: AdditionalNTPSourcesFormProps) => {
  const initialValues: V2ClusterUpdateParams = {
    additionalNtpSource: additionalNtpSource || '',
  };

  const getValidationSchema = (t: TFunction) =>
    Yup.object().shape({
      additionalNtpSource: ntpSourceValidationSchema.required(t('ai:Required field')),
    });

  const { t } = useTranslation();
  const handleSubmit = (
    values: V2ClusterUpdateParams,
    formikHelpers: FormikHelpers<V2ClusterUpdateParams>,
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
      void onAdditionalNtpSource(values.additionalNtpSource, onError);
    }
    onClose();
  };

  return (
    <Formik
      initialValues={initialValues}
      initialTouched={{ additionalNtpSource: true }}
      initialStatus={{ error: null }}
      validationSchema={getValidationSchema(t)}
      onSubmit={handleSubmit}
    >
      {({ submitForm, status, setStatus, isSubmitting, isValid, dirty }) => {
        return (
          <>
            <ModalBoxBody>
              <Form>
                <AlertFormikError
                  status={status as StatusErrorType}
                  onClose={() => setStatus({ error: null })}
                />

                <AdditionalNTPSourcesField
                  name="additionalNtpSource"
                  label={t('ai:Additional NTP Sources')}
                  helperText={t(
                    'ai:A comma separated list of IP or domain names of the NTP pools or servers. Additional NTP sources are added to all hosts to ensure all hosts clocks are synchronized with a valid NTP server. It may take a few minutes for the new NTP sources to sync.',
                  )}
                  isRequired
                />
              </Form>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                key="submit"
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={submitForm}
                isDisabled={isSubmitting || !isValid || !dirty}
                isLoading={isSubmitting}
              >
                {isSubmitting ? t('ai:Adding...') : t('ai:Add')}
              </Button>
              <Button key="cancel" variant="link" onClick={onClose}>
                {t('ai:Cancel')}
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
