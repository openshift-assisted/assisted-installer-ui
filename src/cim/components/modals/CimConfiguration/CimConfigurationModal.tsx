import * as React from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getStorageSizeGB } from '../../helpers';
import { AlertPayload } from '../../../../common';

import { CimConfigurationModalProps, CimConfiguratioProps } from './types';
import { CimConfigurationForm } from './CimConfigurationForm';
import { isIngressController, onEnableCIM } from './persist';
import { CimConfigProgressAlert } from './CimConfigProgressAlert';
import { CimConfigDisconnectedAlert } from './CimConfigDisconnectedAlert';
import {
  CIM_CONFIG_TIMEOUT,
  MIN_DB_VOL_SIZE,
  MIN_FS_VOL_SIZE,
  MIN_IMG_VOL_SIZE,
} from './constants';
import { isCIMConfigured } from './utils';

import './CimConfigurationModal.css';

export const CimConfigurationModal: React.FC<CimConfigurationModalProps> = ({
  isOpen,
  onClose,
  agentServiceConfig,
  platform,
  docDisconnectedUrl,
  docConfigUrl,
  docConfigAwsUrl,
  assistedServiceDeploymentUrl,

  getResource,
  listResources,
  patchResource,
  createResource,
}) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<AlertPayload>();
  const [isSaving, setSaving] = React.useState(false);
  const [persistenceStartedAt, setPersistenceStartedAt] = React.useState(0);

  const [dbVolSize, _setDbVolSize] = React.useState<number>(() =>
    getStorageSizeGB(10, agentServiceConfig?.spec?.databaseStorage?.resources?.requests?.storage),
  );
  const [dbVolSizeValidation, setDbVolSizeValidation] = React.useState<string>();

  const [fsVolSize, _setFsVolSize] = React.useState<number>(() =>
    getStorageSizeGB(
      100,
      agentServiceConfig?.spec?.filesystemStorage?.resources?.requests?.storage,
    ),
  );
  const [fsVolSizeValidation, setFsVolSizeValidation] = React.useState<string>();

  const [imgVolSize, _setImgVolSize] = React.useState<number>(() =>
    getStorageSizeGB(50, agentServiceConfig?.spec?.imageStorage?.resources?.requests?.storage),
  );
  const [imgVolSizeValidation, setImgVolSizeValidation] = React.useState<string>();

  const [configureLoadBalancer, setConfigureLoadBalancer] = React.useState<boolean>(
    platform === 'AWS',
  );
  const [configureLoadBalancerInitial, setConfigureLoadBalancerInitial] = React.useState(false);

  const setDbVolSize = (v: number): void => {
    if (v < MIN_DB_VOL_SIZE) {
      setDbVolSizeValidation(t('ai:Minimal value is 1G'));
    } else {
      setDbVolSizeValidation(undefined);
    }
    _setDbVolSize(v);
  };
  const setFsVolSize = (v: number): void => {
    if (v < MIN_FS_VOL_SIZE) {
      setFsVolSizeValidation(t('ai:Minimal value is 1G'));
    } else {
      setFsVolSizeValidation(undefined);
    }
    _setFsVolSize(v);
  };
  const setImgVolSize = (v: number): void => {
    if (v < MIN_IMG_VOL_SIZE) {
      setImgVolSizeValidation(t('ai:Minimal value is 10G'));
    } else {
      setImgVolSizeValidation(undefined);
    }
    _setImgVolSize(v);
  };

  const isEdit = !!agentServiceConfig;

  React.useEffect(
    () => {
      const doItAsync = async (): Promise<void> => {
        if (platform === 'AWS') {
          if (!isEdit || (await isIngressController(getResource))) {
            setConfigureLoadBalancer(true);
            setConfigureLoadBalancerInitial(true);
            return;
          }
        }

        setConfigureLoadBalancer(false);
      };

      void doItAsync();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [platform],
  );

  React.useEffect(() => {
    if (isCIMConfigured({ agentServiceConfig })) {
      setPersistenceStartedAt(0);
    }
  }, [agentServiceConfig]);

  const formProps: CimConfiguratioProps = {
    dbVolSize,
    dbVolSizeValidation,
    setDbVolSize,
    fsVolSize,
    fsVolSizeValidation,
    setFsVolSize,
    imgVolSize,
    imgVolSizeValidation,
    setImgVolSize,
    configureLoadBalancer,
    setConfigureLoadBalancer,
  };

  const onConfigure = () => {
    const doItAsync = async (): Promise<void> => {
      setSaving(true);
      setError(undefined);

      setPersistenceStartedAt(Date.now());
      setTimeout(() => {
        // Make sure we got re-rendered
        setPersistenceStartedAt((v: number) => (v - 1 >= 0 ? v - 1 : 0));
      }, CIM_CONFIG_TIMEOUT);

      await onEnableCIM({
        t,
        setError,
        getResource,
        listResources,
        patchResource,
        createResource,
        agentServiceConfig,

        platform,
        dbVolSize,
        fsVolSize,
        imgVolSize,
        configureLoadBalancer,
      });

      setConfigureLoadBalancerInitial(configureLoadBalancer);
      setSaving(false);
    };

    void doItAsync();
  };

  // const isProgressing = isCIMConfigProgressing({ agentServiceConfig });

  const isError = !!error?.title; // this is a communication error only (not from the agentServiceConfig)

  // Postpone showing agentServiceConfig error, it can be part of normal progress which the user is not interested in seeing
  const showProgressError =
    persistenceStartedAt === 0 || Date.now() - persistenceStartedAt > CIM_CONFIG_TIMEOUT;

  const isCancel =
    showProgressError &&
    (isError || (isEdit && configureLoadBalancerInitial === configureLoadBalancer));

  const canConfigure =
    !isSaving &&
    !dbVolSizeValidation &&
    !fsVolSizeValidation &&
    !imgVolSizeValidation &&
    (!isEdit || configureLoadBalancerInitial !== configureLoadBalancer);

  const actions = [
    isCancel ? (
      <Button key="cancel" variant={ButtonVariant.primary} onClick={onClose}>
        {t('ai:Cancel')}
      </Button>
    ) : (
      <Button
        key="configure"
        isDisabled={!canConfigure}
        variant={ButtonVariant.primary}
        onClick={onConfigure}
      >
        {(persistenceStartedAt > 0 || isSaving) && (
          <>
            <Spinner size="sm" />
            &nbsp;
          </>
        )}
        {t('ai:Configure')}
      </Button>
    ),
  ];

  return (
    <Modal
      aria-label={t('ai:Configure host inventory settings')}
      title={t('ai:Configure host inventory settings')}
      isOpen={isOpen}
      onClose={onClose}
      actions={actions}
      variant={ModalVariant.medium}
      id="cim-config-modal"
      className="cim-config-modal"
    >
      {t(
        'ai:Configuring the host inventory settings will enable the Central Infrastructure Management.',
      )}
      {isError && (
        <Alert title={error.title} variant={error.variant || AlertVariant.danger} isInline>
          {error.message}
        </Alert>
      )}
      <CimConfigProgressAlert
        showSuccess={true}
        showTroublehooting={true}
        showProgress={
          // Since the Configure button gets disabled and the spinner is shown instead
          false
        }
        showError={showProgressError}
        assistedServiceDeploymentUrl={assistedServiceDeploymentUrl}
        agentServiceConfig={agentServiceConfig}
      />
      <CimConfigDisconnectedAlert docDisconnectedUrl={docDisconnectedUrl} />
      <CimConfigurationForm
        isEdit={isEdit}
        onClose={onClose}
        docConfigUrl={docConfigUrl}
        docConfigAwsUrl={docConfigAwsUrl}
        {...formProps}
      />
    </Modal>
  );
};
