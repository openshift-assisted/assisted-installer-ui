import React from 'react';
import * as Yup from 'yup';
import {
	Button,
	ButtonVariant,
	ButtonType,
	Form
} from '@patternfly/react-core';
import {
	ModalBoxBody,
	ModalBoxFooter
} from '@patternfly/react-core/deprecated';
import { Formik } from 'formik';
import {
  AlertFormikError,
  day2ApiVipValidationSchema,
  InputField,
} from '../../../common/components/ui';
import GridGap from '../../../common/components/ui/GridGap';
import { StatusErrorType } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

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
  const { t } = useTranslation();

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
        apiVip: day2ApiVipValidationSchema.required(t('ai:Required field')),
      }),
    [t],
  );

  return (
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
            <ModalBoxBody>
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
        );
      }}
    </Formik>
  );
};

export default UpdateDay2ApiVipForm;
