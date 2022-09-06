import * as React from 'react';
import { Form } from '@patternfly/react-core';
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

const BaseDnsHelperText: React.FC<{ name?: string; baseDnsDomain?: string }> = ({
  name,
  baseDnsDomain,
}) => (
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
  canEditPullSecret,
  isBaseDnsDomainDisabled,
  versions,
  defaultPullSecret,
  forceOpenshiftVersion,
  isOcm,
  isPullSecretSet,
  clusterExists,
}: OcmClusterDetailsFormFieldsProps) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { name, baseDnsDomain, highAvailabilityMode, useRedHatDnsService } = values;
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const { t } = useTranslation();
  return (
    <Form id="wizard-cluster-details__form">
      <RichInputField
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
      />
      {!!managedDomains.length && toggleRedHatDnsService && (
        <CheckboxField
          name="useRedHatDnsService"
          label="Use a temporary 60-day domain"
          helperText="A base domain will be provided for temporary, non-production clusters."
          onChange={toggleRedHatDnsService}
        />
      )}
      {useRedHatDnsService ? (
        <SelectField
          label="Base domain"
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          options={managedDomains.map((d) => ({
            label: `${d.domain || ''} (${d.provider || ''})`,
            value: d.domain,
          }))}
          isRequired
        />
      ) : (
        <InputField
          label="Base domain"
          name="baseDnsDomain"
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

      {canEditPullSecret && <PullSecret isOcm={isOcm} defaultPullSecret={defaultPullSecret} />}
      <ArmCheckbox versions={versions} />
      <HostsNetworkConfigurationControlGroup clusterExists={clusterExists} />
      <DiskEncryptionControlGroup
        values={values}
        isDisabled={isPullSecretSet}
        isSNO={isSNO({ highAvailabilityMode })}
      />
    </Form>
  );
};
