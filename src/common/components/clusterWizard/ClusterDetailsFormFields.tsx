import * as React from 'react';
import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { SNOControlGroup } from '../clusterConfiguration';
import { StaticTextField } from '../ui/StaticTextField';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';
import { PullSecret } from '../clusters';
import { ManagedDomain } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { CheckboxField, InputField, SelectField } from '../ui';

import { ClusterDetailsValues } from './types';

export type ClusterDetailsFormFieldsProps = {
  canEditPullSecret: boolean;
  forceOpenshiftVersion?: string;
  isSNOGroupDisabled?: boolean;
  isNameDisabled?: boolean;
  isBaseDnsDomainDisabled?: boolean;
  defaultPullSecret?: string;
  isOcm: boolean;

  extensionAfter?: { [key: string]: React.ReactElement };

  managedDomains?: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
  toggleRedHatDnsService?: (checked: boolean) => void;
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

export const ClusterDetailsFormFields: React.FC<ClusterDetailsFormFieldsProps> = ({
  managedDomains = [],
  toggleRedHatDnsService,
  canEditPullSecret,
  isSNOGroupDisabled,
  isNameDisabled,
  isBaseDnsDomainDisabled,
  versions,
  defaultPullSecret,
  forceOpenshiftVersion,
  extensionAfter,
  isOcm, // TODO(mlibra): make it optional, false by default
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { name, baseDnsDomain, highAvailabilityMode, useRedHatDnsService } = values;
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // TODO(mlibra): Disable fields based on props passed from the caller context. In CIM, the name or domain can not be edited.
  return (
    <Form id="wizard-cluster-details__form">
      <InputField
        ref={nameInputRef}
        label="Cluster name"
        name="name"
        placeholder={isOcm ? '' : 'Enter cluster name'}
        isDisabled={isNameDisabled}
        isRequired
      />
      {extensionAfter?.['name'] && extensionAfter['name']}
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
            label: `${d.domain} (${d.provider})`,
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
      <SNOControlGroup
        isDisabled={isSNOGroupDisabled}
        versions={versions}
        highAvailabilityMode={highAvailabilityMode}
      />
      {forceOpenshiftVersion ? (
        <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
          OpenShift {forceOpenshiftVersion}
        </StaticTextField>
      ) : (
        <OpenShiftVersionSelect versions={versions} />
      )}
      {extensionAfter?.['openshiftVersion'] && extensionAfter['openshiftVersion']}
      {canEditPullSecret && <PullSecret isOcm={isOcm} defaultPullSecret={defaultPullSecret} />}
    </Form>
  );
};
