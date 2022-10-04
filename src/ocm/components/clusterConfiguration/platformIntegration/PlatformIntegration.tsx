import React from 'react';

import { OcmSwitchField } from '../../ui/OcmFormFields';
import { isClusterPlatformTypeVM, Cluster, PopoverIcon, PlatformType } from '../../../../common';
import useClusterSupportedPlatforms, {
  SupportedPlatformIntegrationType,
} from '../../../hooks/useClusterSupportedPlatforms';
import PlatformIntegrationVsphere from './PlatformIntegrationVsphere';

type KeyType = Record<SupportedPlatformIntegrationType, string>;

const undeterminedPlatformMessage =
  'Enable platform integration to access features directly in OpenShift, like vSphere node auto-scaling and persistent storage or Nutanix node auto-scaling.';
const vspherePlatformMessage =
  "Enable vSphere platform integration to access features directly inside OpenShift, like node auto-scaling and persistent storage. You'll need to set vSphere configuration after cluster installation is complete.";

const nutanixPlatformMessage =
  'Enable Nutanix platform integration to access features like node auto-scaling directly inside OpenShift.';

const platformIntegrationTooltip =
  'Platform integration is only applicable when all discovered hosts originated from the same platform.';

const messages: KeyType = {
  'no-active-integrations': undeterminedPlatformMessage,
  vsphere: vspherePlatformMessage,
  nutanix: nutanixPlatformMessage,
};

const PlatformIntegrationLabel = ({
  supportedPlatformIntegration,
}: {
  supportedPlatformIntegration: SupportedPlatformIntegrationType;
}) => {
  return (
    <>
      <span>Integrate with platform (vSphere/Nutanix)</span>{' '}
      <PopoverIcon
        bodyContent={messages[supportedPlatformIntegration]}
        footerContent={supportedPlatformIntegration === 'vsphere' && <PlatformIntegrationVsphere />}
        buttonOuiaId="platform-integration-enabled-popover"
      />
    </>
  );
};

const PlatformIntegration = ({
  clusterId,
  platformType,
}: {
  clusterId: Cluster['id'];
  platformType: PlatformType;
}) => {
  const { isPlatformIntegrationSupported, supportedPlatformIntegration } =
    useClusterSupportedPlatforms(clusterId);

  return (
    <OcmSwitchField
      tooltipProps={{
        hidden: isPlatformIntegrationSupported,
        content: platformIntegrationTooltip,
      }}
      isDisabled={
        !isPlatformIntegrationSupported &&
        !isClusterPlatformTypeVM({ platform: { type: platformType } })
      }
      name={'usePlatformIntegration'}
      label={
        <PlatformIntegrationLabel supportedPlatformIntegration={supportedPlatformIntegration} />
      }
      switchOuiaId="platform-integration-switch"
    />
  );
};

export default PlatformIntegration;
