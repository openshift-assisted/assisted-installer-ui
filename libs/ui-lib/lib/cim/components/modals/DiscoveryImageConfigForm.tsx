import React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
  Button,
  Form,
  AlertVariant,
  Alert,
  Stack,
  StackItem,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import { Formik, FormikHelpers } from 'formik';
import {
  ImageCreateParams,
  ImageType,
  Proxy,
} from '@openshift-assisted/types/assisted-installer-service';
import { AlertFormikError } from '../../../common/components/ui';
import {
  httpProxyValidationSchema,
  httpsProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../common';
import { ProxyFieldsType, StatusErrorType } from '../../../common/types';
import ProxyFields from '../../../common/components/clusterConfiguration/ProxyFields';
import UploadSSH from '../../../common/components/clusterConfiguration/UploadSSH';
import DiscoveryImageTypeControlGroup from '../../../common/components/clusterConfiguration/DiscoveryImageTypeControlGroup';
import { StaticIPInfo } from '../../../common/components/clusterConfiguration/StaticIPInfo';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

const getValidationSchema = (allowEmpty: boolean, t: TFunction) =>
  Yup.lazy((values: DiscoveryImageFormValues) =>
    Yup.object<DiscoveryImageFormValues>().shape({
      sshPublicKey: sshPublicKeyValidationSchema(t),
      httpProxy: httpProxyValidationSchema({ values, pairValueName: 'httpsProxy', allowEmpty, t }),
      httpsProxy: httpsProxyValidationSchema({
        values,
        pairValueName: 'httpProxy',
        allowEmpty,
        t,
      }),
      noProxy: noProxyValidationSchema(t),
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
      validationSchema={getValidationSchema(!!allowEmpty, t)}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status }) => {
        return (
          <>
            <ModalBody>
              <Stack hasGutter>
                {hasDHCP === false && (
                  <StackItem>
                    <StaticIPInfo docVersion={docVersion} />
                  </StackItem>
                )}
                <StackItem>
                  <Form>
                    {!hideDiscoveryImageType && <DiscoveryImageTypeControlGroup />}
                    <AlertFormikError status={status as StatusErrorType} />
                    <Alert
                      variant={AlertVariant.info}
                      isInline
                      title={
                        isIPXE
                          ? t('ai:To add hosts to the cluster, generate iPXE script.')
                          : t('ai:To add hosts to the cluster, generate a Discovery ISO.')
                      }
                    />
                    <UploadSSH />
                    <ProxyFields />
                  </Form>
                </StackItem>
              </Stack>
            </ModalBody>
            <ModalFooter>
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
            </ModalFooter>
          </>
        );
      }}
    </Formik>
  );
};
