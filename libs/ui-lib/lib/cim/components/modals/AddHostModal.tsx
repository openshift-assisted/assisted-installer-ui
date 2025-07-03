import * as React from 'react';
import { FormikHelpers } from 'formik';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Modal,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import { DownloadIso, DiscoveryImageConfigForm, DiscoveryImageFormValues } from '../../../common';
import { AddHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import { InfraEnvK8sResource } from '../../types';
import DownloadIpxeScript from '../../../common/components/clusterConfiguration/DownloadIpxeScript';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { appendPatch } from '../../utils';
import { InfraEnvModel } from '../../types/models';

export const onSaveISOParams = async (
  values: DiscoveryImageFormValues,
  infraEnv: InfraEnvK8sResource,
) => {
  const patches: Patch[] = [];
  if (values.sshPublicKey) {
    appendPatch(
      patches,
      '/spec/sshAuthorizedKey',
      values.sshPublicKey,
      infraEnv.spec?.sshAuthorizedKey,
    );
  } else if (infraEnv.spec?.sshAuthorizedKey) {
    patches.push({
      op: 'remove',
      path: '/spec/sshAuthorizedKey',
    });
  }

  const proxy = values.enableProxy
    ? {
        httpProxy: values.httpProxy,
        httpsProxy: values.httpsProxy,
        noProxy: values.noProxy,
      }
    : undefined;

  if (proxy) {
    appendPatch(patches, '/spec/proxy', proxy, infraEnv.spec?.proxy);
  } else if (infraEnv.spec?.proxy) {
    patches.push({
      op: 'remove',
      path: '/spec/proxy',
    });
  }

  if (values.imageType) {
    appendPatch(patches, '/spec/imageType', values.imageType, infraEnv.spec?.imageType);
  }

  if (patches.length) {
    await k8sPatch({
      model: InfraEnvModel,
      data: patches,
      resource: infraEnv,
    });
  }
};

type AddHostModalStepType = 'config' | 'download';

const AddHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  agentClusterInstall,
  docVersion,
  isIPXE,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const sshPublicKey = infraEnv.spec?.sshAuthorizedKey || agentClusterInstall?.spec?.sshPublicKey;
  const { httpProxy, httpsProxy, noProxy } = infraEnv.spec?.proxy || {};
  const imageType = infraEnv.spec?.imageType || 'minimal-iso';
  const [dialogType, setDialogType] = React.useState<AddHostModalStepType>('config');
  const { t } = useTranslation();
  const handleIsoConfigSubmit = async (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    try {
      await onSaveISOParams(values, infraEnv);
      setDialogType('download');
    } catch (error) {
      formikActions.setStatus({
        error: {
          title: t('ai:Failed to download the discovery Image'),
          message: error as string, // TODO(mlibra): parse it better!!
        },
      });
    }
  };

  return (
    <Modal
      aria-label={t('ai:Add host dialog')}
      title={t('ai:Add host')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="add-host-modal"
    >
      <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion} inModal>
        {dialogType === 'config' && (
          <DiscoveryImageConfigForm
            onCancel={onClose}
            handleSubmit={handleIsoConfigSubmit}
            hideDiscoveryImageType={isIPXE}
            imageType={imageType}
            sshPublicKey={sshPublicKey}
            httpProxy={httpProxy}
            httpsProxy={httpsProxy}
            noProxy={noProxy}
            hasDHCP={hasDHCP}
            isIPXE={isIPXE}
            allowEmpty
            docVersion={docVersion}
          />
        )}
        {dialogType === 'download' && (
          <>
            {isIPXE ? (
              <GeneratingIPXEDownload
                onClose={onClose}
                infraEnv={infraEnv}
                onReset={agentClusterInstall ? () => setDialogType('config') : undefined}
              />
            ) : (
              <GeneratingIsoDownload
                onClose={onClose}
                infraEnv={infraEnv}
                onReset={agentClusterInstall ? () => setDialogType('config') : undefined}
                hasDHCP={hasDHCP}
                docVersion={docVersion}
              />
            )}
          </>
        )}
      </EnvironmentErrors>
    </Modal>
  );
};

const GeneratingIsoDownload = ({
  infraEnv,
  onClose,
  onReset,
  hasDHCP,
  docVersion,
}: {
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  onReset?: VoidFunction;
  hasDHCP: boolean;
  docVersion: string;
}) => {
  const { t } = useTranslation();
  return infraEnv.status?.isoDownloadURL ? (
    <DownloadIso
      onClose={onClose}
      downloadUrl={infraEnv.status.isoDownloadURL}
      onReset={onReset}
      hasDHCP={hasDHCP}
      docVersion={docVersion}
    />
  ) : (
    <EmptyState>
      <EmptyStateHeader icon={<EmptyStateIcon icon={Spinner} />} />
      <EmptyStateBody>{t('ai:Generating discovery ISO')}</EmptyStateBody>
    </EmptyState>
  );
};

const GeneratingIPXEDownload = ({
  infraEnv,
  onClose,
  onReset,
}: {
  infraEnv: InfraEnvK8sResource;
  onClose: VoidFunction;
  onReset?: VoidFunction;
}) => {
  const { t } = useTranslation();
  return infraEnv.status?.bootArtifacts?.ipxeScript ? (
    <DownloadIpxeScript
      onClose={onClose}
      downloadUrl={infraEnv.status.bootArtifacts.ipxeScript}
      onReset={onReset}
    />
  ) : (
    <EmptyState>
      <EmptyStateHeader icon={<EmptyStateIcon icon={Spinner} />} />
      <EmptyStateBody>{t('ai:Generating iPXE script')}</EmptyStateBody>
    </EmptyState>
  );
};

export default AddHostModal;
