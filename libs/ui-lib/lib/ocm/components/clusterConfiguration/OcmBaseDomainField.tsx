import React from 'react';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Tooltip,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import { ClusterDetailsValues, getFieldId } from '../../../common';
import { OcmCheckboxField, OcmInputField } from '../ui/OcmFormFields';
import { ManagedDomain } from '@openshift-assisted/types/assisted-installer-service';
import { clusterExistsReason } from '../featureSupportLevels/featureStateUtils';

const INPUT_NAME = 'baseDnsDomain';
const INPUT_LABEL = 'Base domain';
const fieldId = getFieldId(INPUT_NAME, 'input');

const getManagedDomainLabel = (domain: ManagedDomain) =>
  `${domain?.domain || ''} (${domain?.provider || ''})`;

export const BaseDnsHelperText = ({
  name,
  baseDnsDomain,
}: {
  name?: string;
  baseDnsDomain?: string;
}) => (
  <FormHelperText>
    <HelperText id={fieldId}>
      <HelperTextItem>
        Enter the name of your domain [domainname] or [domainname.com]. This cannot be changed after
        cluster installed. All DNS records must include the cluster name and be subdomains of the
        base you enter. The full cluster address will be: <br />
        <strong>
          {name || '[Cluster Name]'}.{baseDnsDomain || '[domainname.com]'}
        </strong>
      </HelperTextItem>
    </HelperText>
  </FormHelperText>
);

export const OcmBaseDomainField = ({
  managedDomains,
  clusterExists,
}: {
  managedDomains: ManagedDomain[];
  clusterExists: boolean;
}) => {
  const [, { value }, { setValue }] = useField<string>(INPUT_NAME);
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { name, baseDnsDomain, useRedHatDnsService } = values;
  const [isOpen, setOpen] = React.useState(false);

  const dropdownItems = React.useMemo(() => {
    return managedDomains?.map((d) => (
      <DropdownItem key={d.domain} id={d.domain}>
        {getManagedDomainLabel(d)}
      </DropdownItem>
    ));
  }, [managedDomains]);

  const dropdownToggle = (toggleRef: React.Ref<MenuToggleElement>) => {
    const selectedDomain = managedDomains.find((d) => d.domain === value);
    return (
      <MenuToggle
        ref={toggleRef}
        onClick={() => setOpen(!isOpen)}
        isExpanded={isOpen}
        className="pf-v6-u-w-100"
      >
        {selectedDomain ? getManagedDomainLabel(selectedDomain) : 'Base domain'}
      </MenuToggle>
    );
  };

  const toggleRedHatDnsService = (checked: boolean) =>
    setValue((checked && managedDomains.map((d) => d.domain)[0]) || '');

  const onSelect = React.useCallback(
    (event?: React.MouseEvent<Element, MouseEvent>): void => {
      const selectedDomain = event?.currentTarget.id || '';
      setValue(selectedDomain);
      setOpen(false);
    },
    [setValue],
  );

  return (
    <>
      {!!managedDomains.length && toggleRedHatDnsService && (
        <Tooltip content={clusterExistsReason} hidden={!clusterExists}>
          <OcmCheckboxField
            name="useRedHatDnsService"
            label="Use a temporary 60-day domain"
            helperText="A base domain will be provided for temporary, non-production clusters."
            onChange={toggleRedHatDnsService}
            isDisabled={clusterExists}
          />
        </Tooltip>
      )}
      <FormGroup
        id={`form-control__${fieldId}`}
        fieldId={fieldId}
        name={INPUT_NAME}
        label={INPUT_LABEL}
        isRequired
      >
        {useRedHatDnsService ? (
          <Dropdown
            toggle={dropdownToggle}
            isOpen={isOpen}
            onSelect={onSelect}
            onOpenChange={() => setOpen(!isOpen)}
          >
            {dropdownItems}
          </Dropdown>
        ) : (
          <OcmInputField
            name={INPUT_NAME}
            placeholder="localhost.com"
            isDisabled={useRedHatDnsService}
            isRequired
          />
        )}
        <BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />
      </FormGroup>
    </>
  );
};
