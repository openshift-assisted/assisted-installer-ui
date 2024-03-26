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
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { Formik, FormikHelpers } from 'formik';
import {
  ImageCreateParams,
  ImageType,
  Proxy,
} from '@openshift-assisted/types/assisted-installer-service';
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
import { getOCPStaticIPDocLink } from '../../config/constants';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const StaticIPInfo = ({ docVersion }: { docVersion?: string }) => {
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
        onClick={() => window.open(getOCPStaticIPDocLink(docVersion), '_blank', 'noopener')}
      >
        {t('ai:View documentation')}
      </Button>
    </Alert>
  );
};

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

const getValidationSchema = (allowEmpty: boolean) =>
  Yup.lazy<DiscoveryImageFormValues>((values: DiscoveryImageFormValues) =>
    Yup.object<DiscoveryImageFormValues>().shape({
      sshPublicKey: sshPublicKeyValidationSchema,
      httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy', allowEmpty }),
      httpsProxy: httpProxyValidationSchema({ values, pairValueName: 'httpProxy', allowEmpty }), // share the schema, httpS is currently not supported
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
  isIPXE?: boolean;
  allowEmpty?: boolean;
  docVersion: string;
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
  isIPXE,
  allowEmpty,
  docVersion,
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
      validationSchema={getValidationSchema(!!allowEmpty)}
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
                    title={
                      isIPXE
                        ? t('ai:To add hosts to the cluster, generate iPXE script.')
                        : t('ai:To add hosts to the cluster, generate a Discovery ISO.')
                    }
                  />
                </StackItem>
                {hasDHCP === false && (
                  <StackItem>
                    <StaticIPInfo docVersion={docVersion} />
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
              <Button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={submitForm}
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting
                  ? t('ai:Generating')
                  : isIPXE
                  ? t('ai:Generate script file')
                  : t('ai:Generate Discovery ISO')}
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
