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
import { day2ApiVipValidationSchema, InputField } from '../../../common/components/ui';
import GridGap from '../../../common/components/ui/GridGap';

export type UpdateDay2ApiVipFormProps = {
  onClose: () => void;
  onUpdateDay2ApiVip: (apiVip: string, onError: (message: string) => void) => Promise<void>;
  currentApiVip?: string;
};

export type UpdateDay2ApiVipValues = {
  apiVip?: string;
};

const UpdateDay2ApiVipForm: React.FC<UpdateDay2ApiVipFormProps> = ({
  onUpdateDay2ApiVip,
  onClose,
  currentApiVip: originApiVip,
}) => {
  const apiVipInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    apiVipInputRef.current?.focus();
    apiVipInputRef.current?.select();
  }, []);
  const initialValues = {
    apiVip: originApiVip,
  };
  const validationSchema = React.useMemo(
    () =>
      Yup.object().shape({
        apiVip: day2ApiVipValidationSchema.required(),
      }),
    [],
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      initialStatus={{ error: null }}
      onSubmit={async (values, formikHelpers) => {
        if (values.apiVip) {
          const onError = (message: string) =>
            formikHelpers.setStatus({
              error: {
                title: 'Failed to update API IP',
                message,
              },
            });
          await onUpdateDay2ApiVip(values.apiVip, onError);
          onClose();
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
              <InputField label="API IP" name="apiVip" ref={apiVipInputRef} isRequired />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
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
          </ModalBoxFooter>
        </Form>
      )}
    </Formik>
  );
};

export default UpdateDay2ApiVipForm;
