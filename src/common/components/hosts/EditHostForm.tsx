import React from 'react';
import * as Yup from 'yup';
import {
  Button,
  ButtonVariant,
  ButtonType,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { Formik } from 'formik';
import { Host, Inventory } from '../../api';
import {
  hostnameValidationSchema,
  InputField,
  StaticTextField,
  HOSTNAME_VALIDATION_MESSAGES,
  getRichTextValidation,
} from '../ui';
import { canHostnameBeChanged } from './utils';
import GridGap from '../ui/GridGap';
import { EditHostFormValues } from './types';

export type EditHostFormProps = {
  host: Host;
  inventory: Inventory;
  usedHostnames: string[] | undefined;
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (values: EditHostFormValues) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFormSaveError?: (e: any) => void | string;
};

const validationSchema = (initialValues: EditHostFormValues, usedHostnames: string[] = []) =>
  Yup.object().shape({
    hostname: hostnameValidationSchema(initialValues.hostname, usedHostnames),
  });

const EditHostForm: React.FC<EditHostFormProps> = ({
  host,
  inventory,
  usedHostnames,
  onCancel,
  onSave,
  onFormSaveError,
}) => {
  const hostnameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => hostnameInputRef.current?.focus(), []);

  const { requestedHostname } = host;
  const { hostname } = inventory;

  const initialValues: EditHostFormValues = {
    hostId: host.id,
    hostname: requestedHostname || '',
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validate={getRichTextValidation(validationSchema(initialValues, usedHostnames))}
      onSubmit={async (values, formikActions) => {
        if (values.hostname === initialValues.hostname) {
          // no change to save
          onCancel();
          return;
        }
        try {
          await onSave(values);
          onCancel();
        } catch (e) {
          const message = (onFormSaveError && onFormSaveError(e)) || 'Host update failed.';
          formikActions.setStatus({
            error: {
              title: 'Failed to update host',
              message,
            },
          });
        }
      }}
    >
      {({ handleSubmit, status, setStatus, isSubmitting, isValid, dirty }) => (
        <Form onSubmit={handleSubmit}>
          <ModalBoxBody>
            <GridGap>
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
              <Alert
                variant={AlertVariant.info}
                title="This name will replace the original discovered hostname."
                isInline
              />
              <StaticTextField name="discoveredHostname" label="Discovered hostname">
                {hostname || ''}
              </StaticTextField>
              <InputField
                label="New hostname"
                name="hostname"
                ref={hostnameInputRef}
                isRequired
                isDisabled={!canHostnameBeChanged(host.status)}
                richValidationMessages={HOSTNAME_VALIDATION_MESSAGES}
              />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button
              key="submit"
              type={ButtonType.submit}
              isDisabled={isSubmitting || !isValid || !dirty}
            >
              Save hostname
            </Button>
            <Button key="cancel" variant={ButtonVariant.link} onClick={onCancel}>
              Cancel
            </Button>
          </ModalBoxFooter>
        </Form>
      )}
    </Formik>
  );
};

export default EditHostForm;
