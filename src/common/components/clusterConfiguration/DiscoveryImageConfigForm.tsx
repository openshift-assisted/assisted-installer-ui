import React from 'react';
import * as Yup from 'yup';
import {
  Button,
  ButtonVariant,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
} from '@patternfly/react-core';
import { Formik, FormikHelpers } from 'formik';
import { ImageCreateParams, ImageType, Proxy } from '../../api';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
  LoadingState,
} from '../../../common/components/ui';
import { ProxyFieldsType } from '../../types';
import ProxyFields from './ProxyFields';
import UploadSSH from './UploadSSH';
import DiscoveryImageTypeControlGroup from './DiscoveryImageTypeControlGroup';

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

const validationSchema = Yup.lazy<DiscoveryImageFormValues>((values) =>
  Yup.object<DiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema,
    httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
  }),
);

type DiscoveryImageConfigFormProps = Proxy & {
  onCancel: () => void;
  handleSubmit: (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => Promise<void>;
  hideDiscoveryImageType?: boolean;
  sshPublicKey?: string;
  imageType?: ImageType;
};

export const DiscoveryImageConfigForm: React.FC<DiscoveryImageConfigFormProps> = ({
  handleSubmit,
  onCancel,
  sshPublicKey,
  httpProxy,
  httpsProxy,
  noProxy,
  imageType,
  hideDiscoveryImageType,
}) => {
  const initialValues: DiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: httpProxy || '',
    httpsProxy: httpsProxy || '',
    noProxy: noProxy || '',
    enableProxy: !!(httpProxy || httpsProxy || noProxy),
    imageType: imageType || 'full-iso',
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status }) => {
        return isSubmitting ? (
          <LoadingState
            content="Discovery image is being prepared, this might take a few seconds."
            secondaryActions={[
              <Button key="close" variant={ButtonVariant.secondary} onClick={onCancel}>
                Cancel
              </Button>,
            ]}
          />
        ) : (
          <>
            <ModalBoxBody>
              <Form>
                {status?.error && (
                  <Alert variant={AlertVariant.danger} title={status.error.title} isInline>
                    {status.error.message}
                  </Alert>
                )}
                {!hideDiscoveryImageType && <DiscoveryImageTypeControlGroup />}
                <UploadSSH />
                <ProxyFields />
              </Form>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button key="submit" onClick={submitForm}>
                Generate Discovery ISO
              </Button>
              <Button key="cancel" variant="link" onClick={onCancel}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};
