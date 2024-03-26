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
import {
  HostStaticNetworkConfig,
  ImageType,
  InfraEnv,
  Proxy,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  AlertFormikError,
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyListValidationSchema,
} from '../../../common/components/ui';
import {
  DiscoveryImageType,
  ProxyFieldsType,
  StatusErrorType,
  SupportedCpuArchitecture,
  TrustedCertificateFieldsType,
} from '../../../common/types';
import ProxyFields from '../../../common/components/clusterConfiguration/ProxyFields';
import UploadSSH from '../../../common/components/clusterConfiguration/UploadSSH';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import DiscoveryImageTypeDropdown, { discoveryImageTypes } from './DiscoveryImageTypeDropdown';
import CertificateFields from '../../../common/components/clusterConfiguration/CertificateFields';

export interface OcmImageCreateParams {
  /**
   * SSH public key for debugging the installation.
   */
  sshPublicKey?: string;
  staticNetworkConfig?: HostStaticNetworkConfig[];
  /**
   * Type of image that should be generated.
   */
  imageType?: DiscoveryImageType;
}

export type OcmDiscoveryImageFormValues = OcmImageCreateParams &
  ProxyFieldsType &
  TrustedCertificateFieldsType;

const validationSchema = Yup.lazy<OcmDiscoveryImageFormValues>(
  (values: OcmDiscoveryImageFormValues) =>
    Yup.object<OcmDiscoveryImageFormValues>().shape({
      sshPublicKey: sshPublicKeyListValidationSchema,
      httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpProxy' }),
      httpsProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy' }), // share the schema, httpS is currently not supported
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
  isIpxeSelected?: boolean;
  enableCertificate?: boolean;
  trustBundle?: InfraEnv['additionalTrustBundle'];
  selectedCpuArchitecture?: SupportedCpuArchitecture;
  isOracleCloudInfrastructure?: boolean;
};

export const OcmDiscoveryImageConfigForm = ({
  handleSubmit,
  onCancel,
  sshPublicKey,
  httpProxy,
  httpsProxy,
  noProxy,
  imageType,
  isIpxeSelected,
  enableCertificate,
  trustBundle,
  selectedCpuArchitecture,
  isOracleCloudInfrastructure = false,
}: OcmDiscoveryImageConfigFormProps) => {
  const imageTypeValue = isIpxeSelected
    ? 'discovery-image-ipxe'
    : imageType
    ? imageType
    : 'full-iso';

  const initialValues: OcmDiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: httpProxy || '',
    httpsProxy: httpsProxy || '',
    noProxy: noProxy || '',
    enableProxy: !!(httpProxy || httpsProxy || noProxy),
    imageType: imageTypeValue as ImageType,
    enableCertificate: enableCertificate || false,
    trustBundle: trustBundle || '',
  };

  const { t } = useTranslation();
  const [buttonText, setButtonText] = React.useState<string>(t('ai:Generate Discovery ISO'));

  const updateDiscoveryButtonAndAlertText = React.useCallback(
    (isIpxeSelected?: boolean) => {
      if (!isIpxeSelected) {
        setButtonText(t('ai:Generate Discovery ISO'));
        setAlertDiscoveryText(t('ai:To add hosts to the cluster, generate a Discovery ISO.'));
      } else {
        setButtonText(t('ai:Generate script file'));
        setAlertDiscoveryText(t('ai:To add hosts to the cluster, generate iPXE script.'));
      }
    },
    [t],
  );

  React.useEffect(() => {
    updateDiscoveryButtonAndAlertText(isIpxeSelected);
  }, [updateDiscoveryButtonAndAlertText, isIpxeSelected]);

  const [alertDiscoveryText, setAlertDiscoveryText] = React.useState<string>(
    t('ai:To add hosts to the cluster, generate a Discovery ISO.'),
  );

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status, setStatus }) => {
        return (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert variant={AlertVariant.info} isInline title={alertDiscoveryText} />
                </StackItem>

                <StackItem>
                  <Form>
                    <DiscoveryImageTypeDropdown
                      name="imageType"
                      defaultValue={discoveryImageTypes[imageTypeValue]}
                      onChange={updateDiscoveryButtonAndAlertText}
                      selectedCpuArchitecture={selectedCpuArchitecture}
                      isDisabled={isOracleCloudInfrastructure}
                    />
                    <UploadSSH
                      labelText={t(
                        'ai:Provide an SSH key to be able to connect to the hosts for debugging purposes during the discovery process',
                      )}
                    />
                    <ProxyFields />
                    <CertificateFields />
                  </Form>
                </StackItem>
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Stack hasGutter style={{ width: '100%' }}>
                <StackItem>
                  <AlertFormikError
                    status={status as StatusErrorType}
                    onClose={() => setStatus(undefined)}
                  />
                </StackItem>
                <StackItem>
                  <Button
                    onClick={() => {
                      void submitForm();
                    }}
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? t('ai:Generating') : buttonText}
                  </Button>
                  <Button key="cancel" variant="link" onClick={onCancel}>
                    {t('ai:Cancel')}
                  </Button>
                </StackItem>
              </Stack>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};
