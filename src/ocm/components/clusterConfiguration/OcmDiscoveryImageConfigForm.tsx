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
import { Formik, FormikHelpers } from 'formik';
import { ImageCreateParams, ImageType, Proxy } from '../../../common/api';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../common/components/ui';
import { ProxyFieldsType, StatusErrorType } from '../../../common/types';
import ProxyFields from '../../../common/components/clusterConfiguration/ProxyFields';
import UploadSSH from '../../../common/components/clusterConfiguration/UploadSSH';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import DiscoveryImageTypeDropdown from './DiscoveryImageTypeDropdown';

export type OcmDiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

const validationSchema = Yup.lazy<OcmDiscoveryImageFormValues>((values) =>
  Yup.object<OcmDiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema,
    httpProxy: httpProxyValidationSchema(values, 'httpProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpsProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
  }),
);

type OcmDiscoveryImageConfigFormProps = Proxy & {
  onCancel: () => void;
  handleSubmit: (
    values: OcmDiscoveryImageFormValues,
    formikActions: FormikHelpers<OcmDiscoveryImageFormValues>,
  ) => Promise<void>;
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
  const updateDiscoveryButtonAndAlertText = React.useCallback(
    (imageType: string) => {
      if (imageType === 'minimal-iso' || imageType === 'full-iso') {
        setButtonText(t('ai:Generate Discovery ISO'));
        setAlertDiscoveryText(t('ai:To add hosts to the cluster, generate a Discovery ISO.'));
      } else {
        setButtonText(t('ai:Generate script file'));
        setAlertDiscoveryText(t('ai:To add hosts to the cluster, generate iPXE script.'));
      }
    },
    [t],
  );
  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status }) => {
        const { error } = status as unknown as StatusErrorType;
        return (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert variant={AlertVariant.info} isInline title={alertDiscoveryText} />
                </StackItem>

                <StackItem>
                  <Form>
                    {error && (
                      <Alert variant={AlertVariant.danger} title={error.title} isInline>
                        {error.message}
                      </Alert>
                    )}

                    <DiscoveryImageTypeDropdown
                      name="imageType"
                      defaultValue="Full image file - Provision with physical media"
                      onChange={updateDiscoveryButtonAndAlertText}
                    />
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
