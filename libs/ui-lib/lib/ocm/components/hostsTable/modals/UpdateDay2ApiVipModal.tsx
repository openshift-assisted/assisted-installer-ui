import React from 'react';
import * as Yup from 'yup';

import { Formik } from 'formik';
import {
  Modal,
  ModalHeader,
  ModalVariant,
  Button,
  ButtonVariant,
  ButtonType,
  Form,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import {
  AlertFormikError,
  InputField,
  GridGap,
  day2ApiVipValidationSchema,
  StatusErrorType,
  useTranslation,
} from '../../../../common';

export type UpdateDay2ApiVipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdateDay2ApiVip: (apiVip: string, onError: (message: string) => void) => Promise<void>;
  currentApiVip?: string;
};

export const UpdateDay2ApiVipModal: React.FC<UpdateDay2ApiVipModalProps> = ({
  isOpen,
  onClose,
  onUpdateDay2ApiVip,
  currentApiVip,
}) => {
  const { t } = useTranslation();

  const apiVipInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    apiVipInputRef.current?.focus();
    apiVipInputRef.current?.select();
  }, []);
  const initialValues = {
    apiVip: currentApiVip,
  };
  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        apiVip: day2ApiVipValidationSchema(t).required(t('ai:Required field')),
      }),
    [t],
  );

  return (
    <Modal
      aria-label="Update cluster hostname"
      isOpen={isOpen}
      variant={ModalVariant.small}
      onClose={onClose}
    >
      <ModalHeader title="Update cluster hostname" />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        initialStatus={{ error: null }}
        onSubmit={async (values, formikHelpers) => {
          if (values.apiVip) {
            const onError = (message: string) => {
              const error: StatusErrorType = {
                error: {
                  title: 'Failed to update API IP',
                  message,
                },
              };
              formikHelpers.setStatus(error);
            };
            await onUpdateDay2ApiVip(values.apiVip, onError);
            onClose();
          }
        }}
      >
        {({ handleSubmit, status, setStatus, isSubmitting, isValid, dirty }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <ModalBody>
                <GridGap>
                  <AlertFormikError
                    status={status as StatusErrorType}
                    onClose={() => setStatus({ error: null })}
                  />

                  <InputField
                    label="Set the IP or domain used to reach the cluster"
                    name="apiVip"
                    ref={apiVipInputRef}
                    isRequired
                  />
                </GridGap>
              </ModalBody>
              <ModalFooter>
                <Button
                  key="submit"
                  type={ButtonType.submit}
                  isDisabled={isSubmitting || !isValid || !dirty}
                >
                  Update
                </Button>
                <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};
