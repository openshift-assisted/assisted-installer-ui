import React from 'react';
import * as Yup from 'yup';
import {
  Button,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Formik, FormikHelpers } from 'formik';
import { ImageCreateParams, ImageType, Proxy } from '../../api';
import {
  AlertFormikError,
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../common/components/ui';
import { ProxyFieldsType, StatusErrorType } from '../../types';
import ProxyFields from './ProxyFields';
import UploadSSH from './UploadSSH';
import DiscoveryImageTypeControlGroup from './DiscoveryImageTypeControlGroup';
import { OCP_STATIC_IP_DOC } from '../../config/constants';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const StaticIPInfo: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Alert
      title={t(
        'ai:To use static network configuration, follow the steps listed in the documentation.',
      )}
      isInline
      variant="info"
    >
      <Button
        variant="link"
        icon={<ExternalLinkAltIcon />}
        iconPosition="right"
        isInline
        onClick={() => window.open(OCP_STATIC_IP_DOC, '_blank', 'noopener')}
      >
        {t('ai:View documentation')}
      </Button>
    </Alert>
  );
};

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
  hasDHCP?: boolean;
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
  hasDHCP,
}) => {
  const initialValues: DiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: httpProxy || '',
    httpsProxy: httpsProxy || '',
    noProxy: noProxy || '',
    enableProxy: !!(httpProxy || httpsProxy || noProxy),
    imageType: imageType || 'minimal-iso',
  };

  const { t } = useTranslation();
  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status }) => {
        return (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert
                    variant={AlertVariant.info}
                    isInline
                    title={t('ai:Generate a Discovery ISO in order to add hosts to the cluster.')}
                  />
                </StackItem>
                {hasDHCP === false && (
                  <StackItem>
                    <StaticIPInfo />
                  </StackItem>
                )}
                <StackItem>
                  <Form>
                    <AlertFormikError status={status as StatusErrorType} />
                    {!hideDiscoveryImageType && <DiscoveryImageTypeControlGroup />}
                    <UploadSSH />
                    <ProxyFields />
                  </Form>
                </StackItem>
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
                {isSubmitting ? t('ai:Generating') : t('ai:Generate Discovery ISO')}
              </Button>
              <Button key="cancel" variant="link" onClick={onCancel}>
                {t('ai:Cancel')}
              </Button>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};
