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
  uniqueHostnameValidationSchema,
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
    hostname: hostnameValidationSchema.concat(
      uniqueHostnameValidationSchema(initialValues.hostname, usedHostnames).notOneOf(
        ['localhost', 'localhost.localdomain'],
        'Hostname ${value} is not allowed.',
      ),
    ),
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
      validationSchema={validationSchema(initialValues, usedHostnames)}
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
              <StaticTextField name="discoveredHostname" label="Discovered Hostname">
                {hostname || ''}
              </StaticTextField>
              <InputField
                label="Requested Hostname"
                name="hostname"
                ref={hostnameInputRef}
                helperText="This name will replace the original discovered hostname after installation."
                isRequired
                isDisabled={!canHostnameBeChanged(host.status)}
              />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button
              key="submit"
              type={ButtonType.submit}
              isDisabled={isSubmitting || !isValid || !dirty}
            >
              Save
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
