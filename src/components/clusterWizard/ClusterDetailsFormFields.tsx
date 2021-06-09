import * as React from 'react';
import { Form } from '@patternfly/react-core';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import PullSecret from '../clusters/PullSecret';
import CheckboxField from '../ui/formik/CheckboxField';
import { ManagedDomain } from '../../api';
import { OpenshiftVersionOptionType } from '../../types/versions';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';
import { StaticTextField } from '../ui/StaticTextField';
import SNOControlGroup from '../clusterConfiguration/SNOControlGroup';
import { ClusterDetailsValues } from './types';

type ClusterDetailsFormFieldsProps = ClusterDetailsValues & {
  canEditPullSecret: boolean;
  forceOpenshiftVersion?: string;
  isSNOGroupDisabled: boolean;
  defaultPullSecret?: string;

  managedDomains?: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
  toggleRedHatDnsService: (checked: boolean) => void;
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

const ClusterDetailsFormFields: React.FC<ClusterDetailsFormFieldsProps> = ({
  managedDomains = [],
  toggleRedHatDnsService,
  canEditPullSecret,
  isSNOGroupDisabled,
  useRedHatDnsService,
  name,
  baseDnsDomain,
  versions,
  defaultPullSecret,
  forceOpenshiftVersion,
  highAvailabilityMode,
}) => {
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  return (
    <Form id="wizard-cluster-details__form">
      <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
      {!!managedDomains.length && (
        <CheckboxField
          name="useRedHatDnsService"
          label="Use a temporary 60-day domain"
          helperText="A base domain will be provided for temporary, non-production clusters."
          onChange={toggleRedHatDnsService}
        />
      )}
      {useRedHatDnsService ? (
        <SelectField
          label="Base Domain"
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
          label="Base Domain"
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          placeholder="example.com"
          isDisabled={useRedHatDnsService}
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
      {canEditPullSecret && <PullSecret defaultPullSecret={defaultPullSecret} />}
    </Form>
  );
};

export default ClusterDetailsFormFields;
