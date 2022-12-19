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
import { HostStaticNetworkConfig, ImageType, Proxy } from '../../../common/api';
import {
  AlertFormikError,
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../common/components/ui';
import { ProxyFieldsType, StatusErrorType } from '../../../common/types';
import ProxyFields from '../../../common/components/clusterConfiguration/ProxyFields';
import UploadSSH from '../../../common/components/clusterConfiguration/UploadSSH';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import DiscoveryImageTypeDropdown, { discoveryImageTypes } from './DiscoveryImageTypeDropdown';

export type OcmImageType = ImageType | 'discovery-image-ipxe';

export interface OcmImageCreateParams {
  /**
   * SSH public key for debugging the installation.
   */
  sshPublicKey?: string;
  staticNetworkConfig?: HostStaticNetworkConfig[];
  /**
   * Type of image that should be generated.
   */
  imageType?: OcmImageType;
}

export type OcmDiscoveryImageFormValues = OcmImageCreateParams & ProxyFieldsType;

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
  isIpxeSelected?: boolean;
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
}: OcmDiscoveryImageConfigFormProps) => {
  const initialValues: OcmDiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: httpProxy || '',
    httpsProxy: httpsProxy || '',
    noProxy: noProxy || '',
    enableProxy: !!(httpProxy || httpsProxy || noProxy),
    imageType: imageType,
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
      {({ submitForm, isSubmitting, status }) => {
        return (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert variant={AlertVariant.info} isInline title={alertDiscoveryText} />
                </StackItem>

                <StackItem>
                  <Form>
                    <AlertFormikError status={status as StatusErrorType} />
                    <DiscoveryImageTypeDropdown
                      name="imageType"
                      defaultValue={
                        isIpxeSelected
                          ? discoveryImageTypes['discovery-image-ipxe']
                          : imageType
                          ? discoveryImageTypes[imageType]
                          : discoveryImageTypes['full-iso']
                      }
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
