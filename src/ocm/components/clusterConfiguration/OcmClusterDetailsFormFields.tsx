import * as React from 'react';
import { useSelector } from 'react-redux';
import { Alert, AlertVariant, FlexItem, Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import ArmCheckbox from './ArmCheckbox';
import { HostsNetworkConfigurationControlGroup } from './HostsNetworkConfigurationControlGroup';
import {
  CheckboxField,
  ClusterDetailsValues,
  InputField,
  isSNO,
  ManagedDomain,
  OpenshiftVersionOptionType,
  OpenShiftVersionSelect,
  PullSecret,
  RichInputField,
  SelectField,
  SNOControlGroup,
  StaticTextField,
  ocmClusterNameValidationMessages,
  uniqueOcmClusterNameValidationMessages,
} from '../../../common';
import DiskEncryptionControlGroup from '../../../common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { selectCurrentClusterPermissionsState } from '../../selectors';

export type OcmClusterDetailsFormFieldsProps = {
  canEditPullSecret: boolean;
  forceOpenshiftVersion?: string;
  isBaseDnsDomainDisabled?: boolean;
  defaultPullSecret?: string;
  isOcm: boolean;
  managedDomains?: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
  toggleRedHatDnsService?: (checked: boolean) => void;
  isPullSecretSet: boolean;
  clusterExists: boolean;
};

const BaseDnsHelperText = ({ name, baseDnsDomain }: { name?: string; baseDnsDomain?: string }) => (
  <>
    All DNS records must be subdomains of this base and include the cluster name. This cannot be
    changed after cluster installation. The full cluster address will be: <br />
    <strong>
      {name || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
    </strong>
  </>
);

export const OcmClusterDetailsFormFields = ({
  managedDomains = [],
  toggleRedHatDnsService,
  isBaseDnsDomainDisabled,
  versions,
  isPullSecretSet,
  defaultPullSecret,
  forceOpenshiftVersion,
  isOcm, // TODO(mlibra): make it optional, false by default
  clusterExists,
}: OcmClusterDetailsFormFieldsProps) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { isViewerMode: realViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const isViewerMode = clusterExists && realViewerMode;
  const { name, baseDnsDomain, highAvailabilityMode, useRedHatDnsService } = values;
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
  const atListOneDiskEncryptionEnableOn =
    values.enableDiskEncryptionOnMasters || values.enableDiskEncryptionOnWorkers;

  const { t } = useTranslation();
  // TODO(mlibra): Disable fields based on props passed from the caller context. In CIM, the name or domain can not be edited.
  return (
    <Form id="wizard-cluster-details__form">
      <RichInputField
        ref={nameInputRef}
        label="Cluster name"
        name="name"
        placeholder={isOcm ? '' : 'Enter cluster name'}
        isDisabled={isViewerMode}
        isRequired
        richValidationMessages={
          useRedHatDnsService
            ? uniqueOcmClusterNameValidationMessages(t)
            : ocmClusterNameValidationMessages(t)
        }
      />
      {!!managedDomains.length && toggleRedHatDnsService && (
        <CheckboxField
          name="useRedHatDnsService"
          label="Use a temporary 60-day domain"
          helperText="A base domain will be provided for temporary, non-production clusters."
          isDisabled={isViewerMode}
          onChange={toggleRedHatDnsService}
        />
      )}
      {useRedHatDnsService ? (
        <SelectField
          label="Base domain"
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          isDisabled={isViewerMode}
          options={managedDomains.map((d) => ({
            label: `${d.domain} (${d.provider})`,
            value: d.domain,
          }))}
          isRequired
        />
      ) : (
        <InputField
          label="Base domain"
          name="baseDnsDomain"
          isReadOnly={isViewerMode}
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          placeholder="example.com"
          isDisabled={isBaseDnsDomainDisabled || useRedHatDnsService}
          isRequired
        />
      )}
      {forceOpenshiftVersion ? (
        <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
          OpenShift {forceOpenshiftVersion}
        </StaticTextField>
      ) : (
        <OpenShiftVersionSelect versions={versions} />
      )}
      <SNOControlGroup versions={versions} highAvailabilityMode={highAvailabilityMode} />

      {!isPullSecretSet && <PullSecret isOcm={isOcm} defaultPullSecret={defaultPullSecret} />}
      <ArmCheckbox versions={versions} />
      <HostsNetworkConfigurationControlGroup clusterExists={clusterExists} />
      <DiskEncryptionControlGroup
        values={values}
        isDisabled={isViewerMode || isPullSecretSet}
        isSNO={isSNO({ highAvailabilityMode })}
      />
      {atListOneDiskEncryptionEnableOn && values.diskEncryptionMode === 'tpmv2' && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={
            <FlexItem>
              To use this encryption method, enable TPMv2 encryption in the BIOS of each selected
              host.
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
              The use of Tang encryption mode to encrypt your disks is only supported for bare metal
              or vSphere installations on user-provisioned infrastructure.
            </FlexItem>
          }
        />
      )}
    </Form>
  );
};
