import React from 'react';
import * as Yup from 'yup';
import {
	Button,
	ButtonVariant,
	ButtonType,
	Form,
	AlertVariant,
	Alert
} from '@patternfly/react-core';
import {
	ModalBoxBody,
	ModalBoxFooter
} from '@patternfly/react-core/deprecated';

import { Formik } from 'formik';
import { TFunction } from 'i18next';
import { Host, Inventory } from '@openshift-assisted/types/assisted-installer-service';
import {
  richHostnameValidationSchema,
  RichInputField,
  StaticTextField,
  hostnameValidationMessages,
  getRichTextValidation,
  AlertFormikError,
} from '../ui';
import { canHostnameBeChanged } from './utils';
import GridGap from '../ui/GridGap';
import { EditHostFormValues } from './types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { StatusErrorType } from '../../types';

export type EditHostFormProps = {
  host: Host;
  inventory: Inventory;
  usedHostnames: string[] | undefined;
  onCancel: () => void;
  onSave: (values: EditHostFormValues) => Promise<unknown>;
  onHostSaveError?: (e: Error) => void;
  getEditErrorMessage?: (e: Error) => string;
};

const validationSchema = (
  t: TFunction,
  initialValues: EditHostFormValues,
  usedHostnames: string[] = [],
) =>
  Yup.object().shape({
    hostname: richHostnameValidationSchema(t, usedHostnames, initialValues.hostname),
  });

const EditHostForm = ({
  host,
  inventory,
  usedHostnames,
  onCancel,
  onSave,
  onHostSaveError,
  getEditErrorMessage,
}: EditHostFormProps) => {
  const { t } = useTranslation();
  const hostnameInputRef = React.useRef<HTMLInputElement>();
  const [isSaveInProgress, setIsSaveInProgress] = React.useState<boolean>(false);

  React.useEffect(() => {
    hostnameInputRef.current?.focus();
    hostnameInputRef.current?.select();
  }, []);

  const { requestedHostname } = host;
  const { hostname } = inventory;

  const initialValues: EditHostFormValues = {
    hostId: host.id,
    hostname: requestedHostname || '',
  };

  return (
    <Formik
      validateOnMount
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validate={getRichTextValidation(validationSchema(t, initialValues, usedHostnames))}
      onSubmit={async (values, formikActions) => {
        if (values.hostname === initialValues.hostname) {
          // no change to save
          onCancel();
          return;
        }
        try {
          setIsSaveInProgress(true); // onSave ends closing the modal, so we can't update the status unless there is an error
          await onSave(values);
        } catch (e) {
          setIsSaveInProgress(false);
          const error = e as Error;
          const message =
            (getEditErrorMessage && getEditErrorMessage(error)) || t('ai:Host update failed.');
          formikActions.setStatus({
            error: {
              title: t('ai:Failed to update host'),
              message,
            },
          });
          onHostSaveError && onHostSaveError(error);
        }
      }}
    >
      {({ handleSubmit, status, isSubmitting, isValid, setStatus, dirty }) => (
        <Form onSubmit={handleSubmit}>
          <ModalBoxBody>
            <GridGap>
              <AlertFormikError
                status={status as StatusErrorType}
                onClose={() => setStatus({ error: null })}
              />
              {canHostnameBeChanged(host.status) ? (
                <Alert
                  variant={AlertVariant.info}
                  title={t('ai:This name will replace the original discovered hostname.')}
                  isInline
                />
              ) : (
                <Alert
                  variant={AlertVariant.warning}
                  title={t('ai:The hostname cannot be changed.')}
                  isInline
                />
              )}
              <StaticTextField name="discoveredHostname" label={t('ai:Discovered hostname')}>
                {hostname || ''}
              </StaticTextField>
              <RichInputField
                label={t('ai:New hostname')}
                name="hostname"
                ref={hostnameInputRef}
                isRequired
                isDisabled={isSaveInProgress || !canHostnameBeChanged(host.status)}
                richValidationMessages={hostnameValidationMessages(t)}
              />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button
              key="submit"
              data-testid="change-hostname-form__button-change"
              type={ButtonType.submit}
              isDisabled={isSubmitting || !isValid || !dirty}
              isLoading={isSubmitting}
            >
              {t('ai:Change')}
            </Button>
            <Button
              data-testid="change-hostname-form__button-cancel"
              key="cancel"
              variant={ButtonVariant.link}
              onClick={onCancel}
            >
              {t('ai:Cancel')}
            </Button>
          </ModalBoxFooter>
        </Form>
      )}
    </Formik>
  );
};

export default EditHostForm;
