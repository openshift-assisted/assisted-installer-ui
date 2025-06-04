import * as React from 'react';
import {
	Alert,
	AlertVariant,
	Button,
	ButtonVariant
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getStorageSizeGiB } from '../../helpers';
import { AlertPayload } from '../../../../common';

import { CimConfigurationModalProps, CimConfiguratioProps } from './types';
import { CimConfigurationForm } from './CimConfigurationForm';
import { isIngressController, onEnableCIM } from './persist';
import { CimConfigDisconnectedAlert } from './CimConfigDisconnectedAlert';
import { MIN_DB_VOL_SIZE, MIN_FS_VOL_SIZE, MIN_IMG_VOL_SIZE } from './constants';
import { isCIMConfigProgressing } from './utils';
import { resetCimConfigProgressAlertSuccessStatus } from './CimConfigProgressAlert';

import './CimConfigurationModal.css';

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
  const [isSaving, setSaving] = React.useState(false);

  const [dbVolSize, _setDbVolSize] = React.useState<number>(() =>
    getStorageSizeGiB(10, agentServiceConfig?.spec?.databaseStorage?.resources?.requests?.storage),
  );
  const [dbVolSizeValidation, setDbVolSizeValidation] = React.useState<string>();

  const [fsVolSize, _setFsVolSize] = React.useState<number>(() =>
    getStorageSizeGiB(
      100,
      agentServiceConfig?.spec?.filesystemStorage?.resources?.requests?.storage,
    ),
  );
  const [fsVolSizeValidation, setFsVolSizeValidation] = React.useState<string>();

  const [imgVolSize, _setImgVolSize] = React.useState<number>(() =>
    getStorageSizeGiB(50, agentServiceConfig?.spec?.imageStorage?.resources?.requests?.storage),
  );
  const [imgVolSizeValidation, setImgVolSizeValidation] = React.useState<string>();

  const [configureLoadBalancer, setConfigureLoadBalancer] = React.useState<boolean>(
    platform === 'AWS',
  );
  const [configureLoadBalancerInitial, setConfigureLoadBalancerInitial] = React.useState(true);

  const setDbVolSize = (v: number): void => {
    if (v < MIN_DB_VOL_SIZE) {
      setDbVolSizeValidation(t('ai:Minimal value is 1Gi'));
    } else {
      setDbVolSizeValidation(undefined);
    }
    _setDbVolSize(v);
  };
  const setFsVolSize = (v: number): void => {
    if (v < MIN_FS_VOL_SIZE) {
      setFsVolSizeValidation(t('ai:Minimal value is 1Gi'));
    } else {
      setFsVolSizeValidation(undefined);
    }
    _setFsVolSize(v);
  };
  const setImgVolSize = (v: number): void => {
    if (v < MIN_IMG_VOL_SIZE) {
      setImgVolSizeValidation(t('ai:Minimal value is 10Gi'));
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
        setConfigureLoadBalancerInitial(false);
      };

      void doItAsync();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [platform],
  );

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
    configureLoadBalancerInitial,
    setConfigureLoadBalancer,
  };

  const onConfigure = () => {
    const doItAsync = async (): Promise<void> => {
      setSaving(true);
      setError(undefined);
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
          dbVolSizeGiB: dbVolSize,
          fsVolSizeGiB: fsVolSize,
          imgVolSizeGiB: imgVolSize,
          configureLoadBalancer,
        })
      ) {
        // successfuly persisted
        onClose();
      }

      // keep modal open and show error
      setConfigureLoadBalancerInitial(configureLoadBalancer);
      setSaving(false);
    };

    void doItAsync();
  };

  const isError = !!error?.title; // this is a communication error only (not the one from agentServiceConfig)

  const isConfigure =
    !isEdit || !configureLoadBalancerInitial; /* The only possible change for the Edit flow */

  const isConfigureDisabled = !!(
    isSaving ||
    dbVolSizeValidation ||
    fsVolSizeValidation ||
    imgVolSizeValidation ||
    (isEdit && configureLoadBalancerInitial === configureLoadBalancer)
  );

  const isInProgressPeriod = isCIMConfigProgressing({ agentServiceConfig });
  // const isConfiguring = isSaving || isInProgressPeriod;

  let actions: React.ReactNode[];
  if (isConfigure) {
    actions = [
      <Button
        key="configure"
        variant={ButtonVariant.primary}
        isDisabled={isConfigureDisabled}
        onClick={onConfigure}
      >
        {t('ai:Configure')}
      </Button>,
      <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
        {t('ai:Cancel')}
      </Button>,
    ];
  } else {
    actions = [
      <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
        {t('ai:Close')}
      </Button>,
    ];
  }

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
      <CimConfigDisconnectedAlert docDisconnectedUrl={docDisconnectedUrl} />
      <CimConfigurationForm
        isEdit={isEdit}
        isInProgressPeriod={isInProgressPeriod}
        onClose={onClose}
        docConfigUrl={docConfigUrl}
        docConfigAwsUrl={docConfigAwsUrl}
        {...formProps}
      />
      {isConfigure && (
        <Alert
          variant={AlertVariant.warning}
          title={t('ai:Storage sizes cannot be changed once you configure.')}
          isInline
        />
      )}
    </Modal>
  );
};
