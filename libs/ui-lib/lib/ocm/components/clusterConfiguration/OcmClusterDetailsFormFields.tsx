import * as React from 'react';
import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { HostsNetworkConfigurationControlGroup } from './HostsNetworkConfigurationControlGroup';
import {
  ClusterDetailsValues,
  isSNO,
  OpenshiftVersionOptionType,
  PullSecret,
  ocmClusterNameValidationMessages,
  uniqueOcmClusterNameValidationMessages,
  CLUSTER_NAME_MAX_LENGTH,
  StaticTextField,
  useFeature,
  getSupportedCpuArchitectures,
  SupportedCpuArchitecture,
} from '../../../common';
import DiskEncryptionControlGroup from '../../../common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { OcmRichInputField } from '../ui/OcmFormFields';
import OcmOpenShiftVersion from './OcmOpenShiftVersion';
import OcmOpenShiftVersionSelect from './OcmOpenShiftVersionSelect';
import CustomManifestCheckbox from './CustomManifestCheckbox';
import CpuArchitectureDropdown, {
  architectureData,
  CpuArchitectureItem,
} from './CpuArchitectureDropdown';
import { OcmBaseDomainField } from './OcmBaseDomainField';
import OcmSNOControlGroup from './OcmSNOControlGroup';
import useSupportLevelsAPI from '../../hooks/useSupportLevelsAPI';
import { useOpenshiftVersions } from '../../hooks';
import { ExternalPlatformDropdown } from './platformIntegration/ExternalPlatformDropdown';
import { HostsNetworkConfigurationType } from '../../services/types';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import { ExternalPlatformLabels } from './platformIntegration/constants';
import { ManagedDomain, PlatformType } from '@openshift-assisted/types/assisted-installer-service';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';

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
  const { highAvailabilityMode, useRedHatDnsService } = values;
  const nameInputRef = React.useRef<HTMLInputElement>();

  const { t } = useTranslation();
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const isMultiArchSupported = useFeature('ASSISTED_INSTALLER_MULTIARCH_SUPPORTED');
  const isOracleCloudPlatformIntegrationEnabled = useFeature('ASSISTED_INSTALLER_PLATFORM_OCI');
  const { openshiftVersion, platform } = values;
  const { getCpuArchitectures } = useOpenshiftVersions();
  const cpuArchitecturesByVersionImage = getCpuArchitectures(openshiftVersion);
  const clusterWizardContext = useClusterWizardContext();
  const featureSupportLevelData = useSupportLevelsAPI(
    'features',
    values.openshiftVersion,
    values.cpuArchitecture as SupportedCpuArchitecture,
  );
  const cpuArchitectures = React.useMemo(
    () => getSupportedCpuArchitectures(isMultiArchSupported, cpuArchitecturesByVersionImage),
    [cpuArchitecturesByVersionImage, isMultiArchSupported],
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const cpuArchitecture = (architectureData[values.cpuArchitecture] as CpuArchitectureItem).label;

  const featureSupportLevelContext = useNewFeatureSupportLevel();

  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleExternalPartnerIntegrationsChange = React.useCallback(
    (selectedPlatform: PlatformType) => {
      const isOracleSelected = selectedPlatform === 'oci';
      if (isOracleSelected) {
        setFieldValue('addCustomManifest', isOracleSelected, false);
        clusterWizardContext.setAddCustomManifests(isOracleSelected);
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
  }, [setFieldValue, featureSupportLevelContext, featureSupportLevelData]);

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

      {/* TODO(mlibra): For single-cluster: We will probably change this to just a static text */}
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
      {clusterExists ? (
        <StaticTextField name="cpuArchitecture" label="CPU architecture" isRequired>
          {cpuArchitecture}
        </StaticTextField>
      ) : (
        <CpuArchitectureDropdown
          openshiftVersion={openshiftVersion}
          cpuArchitectures={cpuArchitectures}
        />
      )}
      <OcmSNOControlGroup
        highAvailabilityMode={highAvailabilityMode}
        featureSupportLevelData={featureSupportLevelData ?? undefined}
      />

      {!isPullSecretSet && <PullSecret isOcm={isOcm} defaultPullSecret={defaultPullSecret} />}

      {clusterExists ? (
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
          showOciOption={isOracleCloudPlatformIntegrationEnabled}
          featureSupportLevelData={featureSupportLevelData}
          isSNO={isSNO({ highAvailabilityMode })}
        />
      )}

      <CustomManifestCheckbox clusterId={clusterId || ''} isDisabled={platform === 'oci'} />

      {
        // Reason: In the single-cluster flow, the Host discovery phase is replaced by a single one-fits-all ISO download
        !isSingleClusterFeatureEnabled && (
          <HostsNetworkConfigurationControlGroup
            clusterExists={clusterExists}
            isDisabled={platform === 'oci'}
          />
        )
      }

      <DiskEncryptionControlGroup
        values={values}
        isDisabled={isPullSecretSet}
        isSNO={isSNO({ highAvailabilityMode })}
      />
    </Form>
  );
};
