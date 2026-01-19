/* eslint-disable no-console */
import * as React from 'react';
import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { HostsNetworkConfigurationControlGroup } from './HostsNetworkConfigurationControlGroup';
import {
  ClusterDetailsValues,
  OpenshiftVersionOptionType,
  PullSecret,
  ocmClusterNameValidationMessages,
  uniqueOcmClusterNameValidationMessages,
  CLUSTER_NAME_MAX_LENGTH,
  StaticTextField,
  getSupportedCpuArchitectures,
  SupportedCpuArchitecture,
  architectureData,
} from '@openshift-assisted/common';
import DiskEncryptionControlGroup from '@openshift-assisted/common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import { OcmRichInputField } from '../ui/OcmFormFields';
import OcmOpenShiftVersion from './OcmOpenShiftVersion';
import OcmOpenShiftVersionSelect from './OcmOpenShiftVersionSelect';
import CustomManifestCheckbox from './CustomManifestCheckbox';
import CpuArchitectureDropdown from './CpuArchitectureDropdown';
import { OcmBaseDomainField } from './OcmBaseDomainField';
import useSupportLevelsAPI from '../../hooks/useSupportLevelsAPI';
import { useOpenShiftVersionsContext } from '../clusterWizard/OpenShiftVersionsContext';
import { ExternalPlatformDropdown } from './platformIntegration/ExternalPlatformDropdown';
import { HostsNetworkConfigurationType } from '../../services/types';
import { useNewFeatureSupportLevel } from '@openshift-assisted/common/components/newFeatureSupportLevels/NewFeatureSupportLevelContext';
import { ExternalPlatformLabels } from './platformIntegration/constants';
import { ManagedDomain, PlatformType } from '@openshift-assisted/types/assisted-installer-service';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import { useFeature } from '../../hooks/use-feature';
import ControlPlaneNodesDropdown, {
  ControlPlaneNodesLabel,
  DEFAULT_VALUE_CPN,
  isCPNDropdownItemEnabled,
} from './ControlPlaneNodesDropdown';

export type OcmClusterDetailsFormFieldsProps = {
  forceOpenshiftVersion?: string;
  defaultPullSecret?: string;
  isOcm: boolean;
  managedDomains?: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
  isPullSecretSet: boolean;
  clusterExists: boolean;
  clusterCpuArchitecture?: string;
  clusterId?: string;
};

export const OcmClusterDetailsFormFields = ({
  managedDomains = [],
  versions,
  isPullSecretSet,
  defaultPullSecret,
  forceOpenshiftVersion,
  isOcm,
  clusterExists,
  clusterCpuArchitecture,
  clusterId,
}: OcmClusterDetailsFormFieldsProps) => {
  const { values, setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const { useRedHatDnsService } = values;
  const nameInputRef = React.useRef<HTMLInputElement>();

  const { t } = useTranslation();
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const { openshiftVersion, platform } = values;
  const { getCpuArchitectures } = useOpenShiftVersionsContext();
  const cpuArchitecturesByVersionImage = getCpuArchitectures(openshiftVersion);
  const clusterWizardContext = useClusterWizardContext();
  const featureSupportLevelData = useSupportLevelsAPI(
    'features',
    values.openshiftVersion,
    values.cpuArchitecture as SupportedCpuArchitecture,
  );
  const cpuArchitectures = React.useMemo(
    () => getSupportedCpuArchitectures(cpuArchitecturesByVersionImage),
    [cpuArchitecturesByVersionImage],
  );
  const cpuArchitecture =
    architectureData[values.cpuArchitecture as SupportedCpuArchitecture].label;

  const featureSupportLevelContext = useNewFeatureSupportLevel();

  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleExternalPartnerIntegrationsChange = React.useCallback(
    (selectedPlatform: PlatformType) => {
      const isOracleSelected = selectedPlatform === 'external';
      if (isOracleSelected) {
        setFieldValue('addCustomManifest', isOracleSelected, false);
        clusterWizardContext.setCustomManifestsStep(isOracleSelected);
        setFieldValue('hostsNetworkConfigurationType', HostsNetworkConfigurationType.DHCP);
      }
    },
    [clusterWizardContext, setFieldValue],
  );

  React.useEffect(() => {
    setFieldValue(
      'isCMNSupported',
      featureSupportLevelContext.isFeatureSupported(
        'CLUSTER_MANAGED_NETWORKING',
        featureSupportLevelData ?? undefined,
      ),
      false,
    );
    setFieldValue(
      'isSNODevPreview',
      featureSupportLevelContext.getFeatureSupportLevel(
        'SNO',
        featureSupportLevelData ?? undefined,
      ) === 'dev-preview',
    );
  }, [setFieldValue, featureSupportLevelContext, featureSupportLevelData]);

  React.useEffect(() => {
    const currentCount = values.controlPlaneCount;
    const isNonStandardControlPlaneEnabled = featureSupportLevelContext.isFeatureSupported(
      'NON_STANDARD_HA_CONTROL_PLANE',
      featureSupportLevelData ?? undefined,
    );
    const isTnaEnabled = featureSupportLevelContext.isFeatureSupported(
      'TNA',
      featureSupportLevelData ?? undefined,
    );

    const isItemEnabled = isCPNDropdownItemEnabled(
      currentCount,
      isNonStandardControlPlaneEnabled,
      isTnaEnabled,
    );

    if (!isItemEnabled) {
      setFieldValue('controlPlaneCount', DEFAULT_VALUE_CPN, false);
    }
  }, [
    values.openshiftVersion,
    featureSupportLevelData,
    featureSupportLevelContext,
    values.controlPlaneCount,
    setFieldValue,
  ]);
  return (
    <Form id="wizard-cluster-details__form">
      <OcmRichInputField
        ref={nameInputRef}
        label="Cluster name"
        name="name"
        placeholder={isOcm ? '' : 'Enter cluster name'}
        isRequired
        richValidationMessages={
          useRedHatDnsService
            ? uniqueOcmClusterNameValidationMessages(t)
            : ocmClusterNameValidationMessages(t)
        }
        maxLength={CLUSTER_NAME_MAX_LENGTH}
      />

      <OcmBaseDomainField managedDomains={managedDomains} clusterExists={clusterExists} />

      {forceOpenshiftVersion ? (
        <OcmOpenShiftVersion
          versions={versions}
          openshiftVersion={forceOpenshiftVersion}
          clusterCpuArchitecture={clusterCpuArchitecture}
          withPreviewText
          withMultiText
        />
      ) : (
        <OcmOpenShiftVersionSelect versions={versions} />
      )}
      {clusterExists || isSingleClusterFeatureEnabled ? (
        <StaticTextField name="cpuArchitecture" label="CPU architecture" isRequired>
          {cpuArchitecture}
        </StaticTextField>
      ) : (
        <CpuArchitectureDropdown
          openshiftVersion={openshiftVersion}
          cpuArchitectures={cpuArchitectures}
        />
      )}

      {!isPullSecretSet && <PullSecret isOcm={isOcm} defaultPullSecret={defaultPullSecret} />}

      {!isSingleClusterFeatureEnabled &&
        (clusterExists ? (
          <StaticTextField
            name="platform"
            label="Integrate with external partner platforms"
            isRequired
          >
            {ExternalPlatformLabels[values.platform]}
          </StaticTextField>
        ) : (
          <ExternalPlatformDropdown
            onChange={handleExternalPartnerIntegrationsChange}
            cpuArchitecture={values.cpuArchitecture as SupportedCpuArchitecture}
            featureSupportLevelData={featureSupportLevelData}
            isSNO={values.controlPlaneCount === 1}
          />
        ))}

      {clusterExists ? (
        <StaticTextField name="controlPlaneCount" label={<ControlPlaneNodesLabel />}>
          {values.controlPlaneCount}
        </StaticTextField>
      ) : (
        <ControlPlaneNodesDropdown featureSupportLevelData={featureSupportLevelData} />
      )}
      <CustomManifestCheckbox clusterId={clusterId || ''} isDisabled={platform === 'external'} />

      {!isSingleClusterFeatureEnabled && (
        <HostsNetworkConfigurationControlGroup
          clusterExists={clusterExists}
          isDisabled={platform === 'external'}
        />
      )}

      <DiskEncryptionControlGroup
        values={values}
        isDisabled={isPullSecretSet}
        isSNO={values.controlPlaneCount === 1}
        docVersion={openshiftVersion}
      />
    </Form>
  );
};
