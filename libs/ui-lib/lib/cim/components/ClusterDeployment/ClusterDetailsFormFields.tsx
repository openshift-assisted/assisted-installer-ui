import * as React from 'react';
import { Alert, AlertVariant, FlexItem, Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import {
  K8sResourceCommon,
  ResourcesObject,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';
import { OpenShiftVersionDropdown, OpenShiftVersionModal } from '../../../common';
import { StaticTextField } from '../../../common/components/ui/StaticTextField';
import { PullSecret } from '../../../common/components/clusters';
import { OpenshiftVersionOptionType, SupportedCpuArchitecture } from '../../../common/types';
import {
  CheckboxField,
  InputField,
  RichInputField,
  acmClusterNameValidationMessages,
} from '../../../common/components/ui/formik';
import { ClusterDetailsValues } from '../../../common/components/clusterWizard/types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import CpuArchitectureDropdown from '../common/CpuArchitectureDropdown';
import ControlPlaneNodesDropdown from '../../../common/components/clusterConfiguration/ControlPlaneNodesDropdown';
import { AgentClusterInstallK8sResource } from '../../types';
import DeleteCustomManifestModal from '../../../ocm/components/clusterConfiguration/manifestsConfiguration/DeleteCustomManifestModal';
import { ManifestFormData } from '../../../ocm/components/clusterConfiguration/manifestsConfiguration/data/dataTypes';

export type ClusterDetailsFormFieldsProps = {
  isEditFlow: boolean;
  forceOpenshiftVersion?: string;
  extensionAfter?: { [key: string]: React.ReactElement };
  versions: OpenshiftVersionOptionType[];
  allVersions: OpenshiftVersionOptionType[];
  isNutanix?: boolean;
  cpuArchitectures?: SupportedCpuArchitecture[];
  allowHighlyAvailable?: boolean;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  useCustomManifests?: (
    agentClusterInstall?: AgentClusterInstallK8sResource,
  ) => WatchK8sResults<ResourcesObject>;
  onSyncCustomManifests?: (
    agentClusterInstall: AgentClusterInstallK8sResource,
    val: ManifestFormData,
    existingManifests: K8sResourceCommon[],
  ) => Promise<void>;
};

export const BaseDnsHelperText: React.FC<{ name?: string; baseDnsDomain?: string }> = ({
  name,
  baseDnsDomain,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {t(
        'ai:All DNS records must be subdomains of this base and include the cluster name. This cannot be changed after cluster installation. The full cluster address will be:',
      )}{' '}
      <br />
      <strong>
        {name || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
      </strong>
    </>
  );
};

export const ClusterDetailsFormFields: React.FC<ClusterDetailsFormFieldsProps> = ({
  isEditFlow,
  versions,
  allVersions,
  forceOpenshiftVersion,
  extensionAfter,
  isNutanix,
  cpuArchitectures,
  allowHighlyAvailable,
  agentClusterInstall,
  useCustomManifests,
  onSyncCustomManifests,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { name, baseDnsDomain } = values;
  const [openshiftVersionModalOpen, setOpenshiftVersionModalOpen] = React.useState(false);
  const customManifests = useCustomManifests?.(agentClusterInstall);

  const [showModal, setShowModal] = React.useState(false);

  const selectOptions = React.useMemo(
    () =>
      versions.map((version) => ({
        label: version.label,
        value: version.value,
      })),
    [versions],
  );

  const additionalSelectOptions = React.useMemo(() => {
    if (
      values.customOpenshiftSelect &&
      !selectOptions.some((option) => option.value === values.customOpenshiftSelect?.value)
    ) {
      return [
        {
          value: values.customOpenshiftSelect.value,
          label: values.customOpenshiftSelect.label,
        },
      ];
    }
    return [];
  }, [selectOptions, values.customOpenshiftSelect]);

  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
  const atListOneDiskEncryptionEnableOn =
    values.enableDiskEncryptionOnMasters || values.enableDiskEncryptionOnWorkers;

  return (
    <Form id="wizard-cluster-details__form">
      {isEditFlow ? (
        <StaticTextField name="name" label={t('ai:Cluster name')} isRequired>
          {name}
        </StaticTextField>
      ) : (
        <RichInputField
          ref={nameInputRef}
          label={t('ai:Cluster name')}
          name="name"
          placeholder={t('ai:Enter cluster name')}
          richValidationMessages={acmClusterNameValidationMessages(t)}
          isRequired
        />
      )}
      {extensionAfter?.['name'] && extensionAfter['name']}
      {isEditFlow ? (
        <StaticTextField
          name="baseDnsDomain"
          label={t('ai:Base domain')}
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          isRequired
        >
          {baseDnsDomain}
        </StaticTextField>
      ) : (
        <InputField
          label={t('ai:Base domain')}
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          placeholder="example.com"
          isRequired
        />
      )}
      {forceOpenshiftVersion ? (
        <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
          {t('ai:OpenShift')} {forceOpenshiftVersion}
        </StaticTextField>
      ) : (
        <>
          <OpenShiftVersionDropdown
            name="openshiftVersion"
            items={selectOptions}
            versions={versions}
            showReleasesLink={false}
            showOpenshiftVersionModal={() => setOpenshiftVersionModalOpen(true)}
            customItems={additionalSelectOptions}
          />
          {openshiftVersionModalOpen && (
            <OpenShiftVersionModal
              allVersions={allVersions}
              setOpenshiftVersionModalOpen={setOpenshiftVersionModalOpen}
            />
          )}
        </>
      )}
      <ControlPlaneNodesDropdown
        isDisabled={isEditFlow}
        allowHighlyAvailable={allowHighlyAvailable}
      />
      {!isNutanix && (
        <CpuArchitectureDropdown cpuArchitectures={cpuArchitectures} isDisabled={isEditFlow} />
      )}

      <CheckboxField
        name={'addCustomManifests'}
        label={'Include custom manifests'}
        helperText={
          'Additional manifests will be applied at the install time for advanced configuration of the cluster.'
        }
        onChange={(val) => {
          if (!val && customManifests) {
            setShowModal(true);
          }
        }}
      />

      <DeleteCustomManifestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDelete={() => {
          if (agentClusterInstall && onSyncCustomManifests) {
            void onSyncCustomManifests(
              agentClusterInstall,
              { manifests: [] },
              Object.values(customManifests || {}) as K8sResourceCommon[],
            );
          }
          setShowModal(false);
        }}
      />

      {extensionAfter?.['openshiftVersion'] && extensionAfter['openshiftVersion']}
      {!isEditFlow && <PullSecret />}
      {extensionAfter?.['pullSecret'] && extensionAfter['pullSecret']}
      {/* <DiskEncryptionControlGroup
        values={values}
        isDisabled={isPullSecretSet}
        isSNO={isSNO({ highAvailabilityMode })}
      /> */}
      {atListOneDiskEncryptionEnableOn && values.diskEncryptionMode === 'tpmv2' && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={
            <FlexItem>
              {t(
                'ai:To use this encryption method, enable TPMv2 encryption in the BIOS of each selected host.',
              )}
            </FlexItem>
          }
        />
      )}
      {atListOneDiskEncryptionEnableOn && values.diskEncryptionMode === 'tang' && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={
            <FlexItem>
              {t(
                'ai:The use of Tang encryption mode to encrypt your disks is only supported for bare metal or vSphere installations on user-provisioned infrastructure.',
              )}
            </FlexItem>
          }
        />
      )}
    </Form>
  );
};
