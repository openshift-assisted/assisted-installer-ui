import * as React from 'react';
import * as Yup from 'yup';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  StackItem,
  Stack,
  Content,
} from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { Formik, FormikHelpers } from 'formik';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getStorageSizeGiB } from '../../helpers';
import { AlertPayload } from '../../../../common';

import { CimConfigurationModalProps, CimConfigurationValues } from './types';
import { onEnableCIM } from './persist';
import { CimConfigDisconnectedAlert } from './CimConfigDisconnectedAlert';
import { MIN_DB_VOL_SIZE, MIN_FS_VOL_SIZE, MIN_IMG_VOL_SIZE } from './constants';
import { isCIMConfigProgressing } from './utils';
import { resetCimConfigProgressAlertSuccessStatus } from './CimConfigProgressAlert';
import { CimConfigurationFormFields } from './CimConfigurationFormFields';

export const CimConfigurationModal: React.FC<CimConfigurationModalProps> = ({
  isOpen,
  onClose,
  agentServiceConfig,
  platform,
  docDisconnectedUrl,
  docConfigUrl,
  docConfigAwsUrl,

  getResource,
  listResources,
  patchResource,
  createResource,
}) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<AlertPayload>();

  const [configureLoadBalancerInitial, setConfigureLoadBalancerInitial] = React.useState(true);
  const isEdit = !!agentServiceConfig;

  const onConfigure = async (
    values: CimConfigurationValues,
    helpers: FormikHelpers<CimConfigurationValues>,
  ) => {
    setError(undefined);
    helpers.setSubmitting(true);
    resetCimConfigProgressAlertSuccessStatus();

    if (
      await onEnableCIM({
        t,
        setError,
        getResource,
        listResources,
        patchResource,
        createResource,
        agentServiceConfig,

        platform,
        dbVolSizeGiB: values.dbVolSize,
        fsVolSizeGiB: values.fsVolSize,
        imgVolSizeGiB: values.imgVolSize,
        configureLoadBalancer: values.configureLoadBalancer,
      })
    ) {
      // successfully persisted
      onClose();
    } else {
      // keep modal open and show error
      setConfigureLoadBalancerInitial(values.configureLoadBalancer);
      helpers.setSubmitting(false);
    }
  };

  const isError = !!error?.title; // this is a communication error only (not the one from agentServiceConfig)

  const isConfigure =
    !isEdit || !configureLoadBalancerInitial; /* The only possible change for the Edit flow */

  const isInProgressPeriod = isCIMConfigProgressing({ agentServiceConfig });

  const initialValues: CimConfigurationValues = {
    dbVolSize: getStorageSizeGiB(
      10,
      agentServiceConfig?.spec?.databaseStorage?.resources?.requests?.storage,
    ),
    fsVolSize: getStorageSizeGiB(
      100,
      agentServiceConfig?.spec?.filesystemStorage?.resources?.requests?.storage,
    ),
    imgVolSize: getStorageSizeGiB(
      50,
      agentServiceConfig?.spec?.imageStorage?.resources?.requests?.storage,
    ),
    configureLoadBalancer: platform === 'AWS',
  };

  const validationSchema = Yup.object({
    dbVolSize: Yup.number().min(MIN_DB_VOL_SIZE, t('ai:Minimal value is 1Gi')).required(),
    fsVolSize: Yup.number().min(MIN_FS_VOL_SIZE, t('ai:Minimal value is 1Gi')).required(),
    imgVolSize: Yup.number().min(MIN_IMG_VOL_SIZE, t('ai:Minimal value is 10Gi')).required(),
    configureLoadBalancer: Yup.boolean(),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onConfigure}
    >
      {({ values, handleSubmit, isValid, isSubmitting }) => (
        <Modal
          aria-label={t('ai:Configure host inventory settings')}
          title={t('ai:Configure host inventory settings')}
          isOpen={isOpen}
          onClose={onClose}
          actions={
            isConfigure
              ? [
                  <Button
                    key="configure"
                    variant={ButtonVariant.primary}
                    isDisabled={
                      !!(
                        isSubmitting ||
                        !isValid ||
                        (isEdit && configureLoadBalancerInitial === values.configureLoadBalancer)
                      )
                    }
                    onClick={() => void handleSubmit()}
                  >
                    {t('ai:Configure')}
                  </Button>,
                  <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
                    {t('ai:Cancel')}
                  </Button>,
                ]
              : [
                  <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
                    {t('ai:Close')}
                  </Button>,
                ]
          }
          variant={ModalVariant.medium}
          id="cim-config-modal"
        >
          <Stack hasGutter>
            <StackItem>
              <Content>
                {t(
                  'ai:Configuring the host inventory settings will enable the Central Infrastructure Management.',
                )}
              </Content>
            </StackItem>

            {isError && (
              <StackItem>
                <Alert title={error.title} variant={error.variant || AlertVariant.danger} isInline>
                  {error.message}
                </Alert>
              </StackItem>
            )}

            <StackItem>
              <CimConfigDisconnectedAlert docDisconnectedUrl={docDisconnectedUrl} />
            </StackItem>

            <StackItem>
              <CimConfigurationFormFields
                isEdit={isEdit}
                platform={platform}
                isInProgressPeriod={isInProgressPeriod}
                docConfigUrl={docConfigUrl}
                docConfigAwsUrl={docConfigAwsUrl}
                configureLoadBalancerInitial={configureLoadBalancerInitial}
                setConfigureLoadBalancerInitial={setConfigureLoadBalancerInitial}
                getResource={getResource}
              />
            </StackItem>

            {isConfigure && (
              <StackItem>
                <Alert
                  variant={AlertVariant.warning}
                  title={t('ai:Storage sizes cannot be changed once you configure.')}
                  isInline
                />
              </StackItem>
            )}
          </Stack>
        </Modal>
      )}
    </Formik>
  );
};
