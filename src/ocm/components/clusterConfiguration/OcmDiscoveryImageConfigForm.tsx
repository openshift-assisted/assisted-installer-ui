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
import { ImageCreateParams, ImageType, Proxy } from '../../../common/api';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../common/components/ui';
import { ProxyFieldsType } from '../../../common/types';
import ProxyFields from '../../../common/components/clusterConfiguration/ProxyFields';
import UploadSSH from '../../../common/components/clusterConfiguration/UploadSSH';
import { OCP_STATIC_IP_DOC } from '../../../common/config/constants';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import DiscoveryImageTypeDropdown from './DiscoveryImageTypeDropdown';

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

export type OcmDiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

const validationSchema = Yup.lazy<OcmDiscoveryImageFormValues>((values) =>
  Yup.object<OcmDiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema,
    httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
  }),
);

type OcmDiscoveryImageConfigFormProps = Proxy & {
  onCancel: () => void;
  handleSubmit: (
    values: OcmDiscoveryImageFormValues,
    formikActions: FormikHelpers<OcmDiscoveryImageFormValues>,
  ) => Promise<void>;
  hasDHCP?: boolean;
  hideDiscoveryImageType?: boolean;
  sshPublicKey?: string;
  imageType?: ImageType;
};

export const OcmDiscoveryImageConfigForm: React.FC<OcmDiscoveryImageConfigFormProps> = ({
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
  const initialValues: OcmDiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: httpProxy || '',
    httpsProxy: httpsProxy || '',
    noProxy: noProxy || '',
    enableProxy: !!(httpProxy || httpsProxy || noProxy),
    imageType: imageType || 'minimal-iso',
  };

  const { t } = useTranslation();
  const [buttonText, setButtonText] = React.useState<string>(t('ai:Generate Discovery ISO'));
  const [alertDiscoveryText, setAlertDiscoveryText] = React.useState<string>(
    t('ai:To add hosts to the cluster, generate a Discovery ISO.'),
  );
  const updateDiscoveryButtonAndAlertText = React.useCallback((imageType: string) => {
    if (imageType === 'discovery-iso-minimal' || imageType === 'discovery-iso-full') {
      setButtonText(t('ai:Generate Discovery ISO'));
      setAlertDiscoveryText(t('ai:To add hosts to the cluster, generate a Discovery ISO.'));
    } else {
      setButtonText(t('ai:Generate script'));
      setAlertDiscoveryText(t('ai:To add hosts to the cluster, generate iPXE script.'));
    }
  }, []);
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
                  <Alert variant={AlertVariant.info} isInline title={alertDiscoveryText} />
                </StackItem>
                {hasDHCP === false && (
                  <StackItem>
                    <StaticIPInfo />
                  </StackItem>
                )}
                <StackItem>
                  <Form>
                    {status?.error && (
                      <Alert variant={AlertVariant.danger} title={status.error.title} isInline>
                        {status.error.message}
                      </Alert>
                    )}
                    {!hideDiscoveryImageType && (
                      <DiscoveryImageTypeDropdown
                        name="discoveryImageDropdown"
                        defaultValue="Full image file - Provision with physicial media"
                        updateAlertAndButtonText={updateDiscoveryButtonAndAlertText}
                      />
                    )}
                    <UploadSSH />
                    <ProxyFields />
                  </Form>
                </StackItem>
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
                {isSubmitting ? t('ai:Generating') : buttonText}
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
