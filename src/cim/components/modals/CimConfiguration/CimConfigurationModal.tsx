import * as React from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getStorageSizeGB } from '../../helpers';

import { CimConfigurationModalProps, CimConfiguratioProps } from './types';
import { CimConfigurationForm } from './CimConfigurationForm';
import { isIngressController, onEnableCIM } from './persist';
import { CimConfigProgressAlert } from './CimConfigProgressAlert';
import { CimConfigDisconnectedAlert } from './CimConfigDisconnectedAlert';
import { MIN_DB_VOL_SIZE, MIN_FS_VOL_SIZE, MIN_IMG_VOL_SIZE } from './constants';

import './CimConfigurationModal.css';

export const CimConfigurationModal: React.FC<CimConfigurationModalProps> = ({
  isOpen,
  onClose,
  agentServiceConfig,
  platform,
  docDisconnectedUrl,
  docConfigUrl,

  getResource,
  listResources,
  patchResource,
  createResource,
}) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<{
    title: string;
    message?: string;
    variant?: AlertVariant;
  }>();
  const [isSaving, setSaving] = React.useState(false);

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

  const [configureLoadBalancer, setConfigureLoadBalancer] = React.useState<boolean>(
    platform === 'AWS',
  );

  const isEdit = !!agentServiceConfig;

  React.useEffect(() => {
    const doItAsync = async (): Promise<void> => {
      if (platform === 'AWS') {
        if (!isEdit || (await isIngressController(getResource))) {
          setConfigureLoadBalancer(true);
          return;
        }
      }

      setConfigureLoadBalancer(false);
    };

    doItAsync();
  }, [platform]);

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

      // TODO: start countdown till showing error

      setSaving(false);
    };

    doItAsync();
  };

  const canConfigure =
    !isSaving && !dbVolSizeValidation && !fsVolSizeValidation && !imgVolSizeValidation;

  const actions = [
    <Button
      key="configure"
      isDisabled={!canConfigure}
      variant={ButtonVariant.primary}
      onClick={onConfigure}
    >
      {t('ai:Configure')}
    </Button>,
    isSaving ? (
      <Button key="close" variant={ButtonVariant.link} onClick={onClose}>
        {t('ai:Close')}
      </Button>
    ) : (
      <Button key="cancel" variant={ButtonVariant.link} onClick={onClose}>
        {t('ai:Cancel')}
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
      variant={ModalVariant.small}
      id="cim-config-modal"
      className="cim-config-modal"
    >
      <CimConfigDisconnectedAlert docDisconnectedUrl={docDisconnectedUrl} />
      <CimConfigurationForm
        isEdit={isEdit}
        onClose={onClose}
        docConfigUrl={docConfigUrl}
        {...formProps}
      />
      {error && (
        <Alert title={error.title} variant={error.variant || AlertVariant.danger} isInline>
          {error.message}
        </Alert>
      )}
      <CimConfigProgressAlert showSuccess={true} agentServiceConfig={agentServiceConfig} />
    </Modal>
  );
};
