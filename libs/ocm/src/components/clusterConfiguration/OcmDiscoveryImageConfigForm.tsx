import React from 'react';
import * as Yup from 'yup';
import {
  Button,
  Form,
  AlertVariant,
  Alert,
  Stack,
  StackItem,
  ModalBody,
  ModalFooter,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Formik, FormikHelpers } from 'formik';
import {
  HostStaticNetworkConfig,
  ImageType,
  InfraEnv,
  Proxy,
} from '@openshift-assisted/types/assisted-installer-service';
import { AlertFormikError } from '@openshift-assisted/common/components/ui/formik/AlertFormikError';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '@openshift-assisted/common/components/ui/formik/validationSchemas';
import {
  DiscoveryImageType,
  ProxyFieldsType,
  StatusErrorType,
  SupportedCpuArchitecture,
  TrustedCertificateFieldsType,
} from '@openshift-assisted/common';
import ProxyFields from '@openshift-assisted/common/components/clusterConfiguration/ProxyFields';
import UploadSSH from '@openshift-assisted/common/components/clusterConfiguration/UploadSSH';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import DiscoveryImageTypeDropdown, { discoveryImageTypes } from './DiscoveryImageTypeDropdown';
import CertificateFields from '@openshift-assisted/common/components/clusterConfiguration/CertificateFields';

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

const validationSchema = Yup.lazy((values: OcmDiscoveryImageFormValues) =>
  Yup.object<OcmDiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema,
    httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy' }),
    httpsProxy: httpProxyValidationSchema({ values, pairValueName: 'httpProxy' }), // share the schema, httpS is currently not supported
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
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Stack hasGutter style={{ width: '100%' }}>
                {(status as StatusErrorType)?.error && (
                  <StackItem>
                    <AlertFormikError
                      status={status as StatusErrorType}
                      onClose={() => setStatus(undefined)}
                    />
                  </StackItem>
                )}
                <StackItem>
                  <Flex>
                    <FlexItem>
                      <Button
                        onClick={() => {
                          void submitForm();
                        }}
                        isDisabled={isSubmitting}
                        isLoading={isSubmitting}
                        data-testid="generate-discovery-iso-button"
                      >
                        {isSubmitting ? t('ai:Generating') : buttonText}
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Button key="cancel" variant="link" onClick={onCancel}>
                        {t('ai:Cancel')}
                      </Button>
                    </FlexItem>
                  </Flex>
                </StackItem>
              </Stack>
            </ModalFooter>
          </>
        );
      }}
    </Formik>
  );
};
