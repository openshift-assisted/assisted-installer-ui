import React from 'react';
import { useField, useFormikContext } from 'formik';
import { FormGroup, Grid, Content, ContentVariants } from '@patternfly/react-core';

import { getFieldId, PopoverIcon } from '../../../../../../../common';
import { OcmCheckboxField, OcmInputField } from '../../../../../ui/OcmFormFields';
import {
  FormViewHost,
  StaticProtocolType,
  getProtocolVersionLabel,
  getShownProtocolVersions,
  getEmptyFormViewHost,
} from '../../data';
import { HostSummary } from '../CollapsedHost';
import { BondsSelect } from './BondsSelect';
import BondDeleteModal from './BondDeleteModal';
import { StaticIpHostsArray, HostComponentProps } from '../StaticIpHostsArray';

import '../staticIp.css';

const getExpandedHostComponent = (protocolType: StaticProtocolType) => {
  const Component: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const { setFieldValue } = useFormikContext();
    const [bondPrimaryField] = useField(`${fieldName}.bondPrimaryInterface`);
    const [bondSecondaryField] = useField(`${fieldName}.bondSecondaryInterface`);
    const [useBond] = useField(`${fieldName}.useBond`);

    const handleUseBondChange = (checked: boolean) => {
      if (!checked) {
        if (bondPrimaryField.value || bondSecondaryField.value) {
          setIsModalOpen(true);
        } else {
          setFieldValue(`${fieldName}.useBond`, false);
          setFieldValue(`${fieldName}.bondType`, 'active-backup');
          setFieldValue(`${fieldName}.bondPrimaryInterface`, '');
          setFieldValue(`${fieldName}.bondSecondaryInterface`, '');
        }
      }
    };

    const handleModalConfirm = () => {
      setFieldValue(`${fieldName}.useBond`, false);
      setFieldValue(`${fieldName}.bondType`, 'active-backup');
      setFieldValue(`${fieldName}.bondPrimaryInterface`, '');
      setFieldValue(`${fieldName}.bondSecondaryInterface`, '');
      setIsModalOpen(false);
    };

    const handleModalCancel = () => {
      setFieldValue(`${fieldName}.useBond`, true);
      setIsModalOpen(false);
    };
    return (
      <>
        <Grid hasGutter>
          <FormGroup>
            <OcmCheckboxField
              label={
                <>
                  {'Use bond'}{' '}
                  <PopoverIcon
                    noVerticalAlign
                    bodyContent="Bonds help you to combine network interfaces  for increased bandwidth and ensure redundancy. To bond more than 2 network interfaces per host, use the YAML view."
                  />
                </>
              }
              onChange={(value) => handleUseBondChange(value)}
              name={`${fieldName}.useBond`}
              data-testid={`use-bond-${hostIdx}`}
            />
          </FormGroup>
          {useBond.value && (
            <Grid hasGutter className="pf-v6-u-ml-lg">
              <FormGroup fieldId={`bond-type-${hostIdx}`}>
                <BondsSelect name={`${fieldName}.bondType`} data-testid={`bond-type-${hostIdx}`} />
              </FormGroup>
              <OcmInputField
                name={`${fieldName}.bondPrimaryInterface`}
                label="Port 1 MAC Address"
                data-testid={`bond-primary-interface-${hostIdx}`}
                isRequired
              />{' '}
              <OcmInputField
                name={`${fieldName}.bondSecondaryInterface`}
                label="Port 2 MAC Address"
                data-testid={`bond-secondary-interface-${hostIdx}`}
                isRequired
              />
            </Grid>
          )}
          {!useBond.value && (
            <OcmInputField
              name={`${fieldName}.macAddress`}
              label="MAC Address"
              isRequired
              data-testid={`mac-address-${hostIdx}`}
            />
          )}
          {getShownProtocolVersions(protocolType).map((protocolVersion) => (
            <FormGroup
              label={`IP address (${getProtocolVersionLabel(protocolVersion)})`}
              fieldId={getFieldId(`${fieldName}.ips.${protocolVersion}`, 'input')}
              key={protocolVersion}
            >
              <OcmInputField
                name={`${fieldName}.ips.${protocolVersion}`}
                isRequired
                data-testid={`${protocolVersion}-address-${hostIdx}`}
              />{' '}
            </FormGroup>
          ))}
        </Grid>
        <BondDeleteModal
          isOpen={isModalOpen}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      </>
    );
  };
  return Component;
};

const getCollapsedHostComponent = (protocolType: StaticProtocolType) => {
  const Component: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
    const [{ value }, { error }] = useField<FormViewHost>({
      name: fieldName,
    });
    const ipAddresses = getShownProtocolVersions(protocolType).map(
      (protocolVersion) => value.ips[protocolVersion],
    );
    const mapValue = ipAddresses.join(', ');

    return (
      <HostSummary
        title={value.useBond ? 'Bonds to IP mapping' : 'MAC to IP mapping'}
        numInterfaces={1}
        macAddress={value.macAddress}
        mappingValue={mapValue}
        hostIdx={hostIdx}
        hasError={!!error}
        bondPrimaryInterface={value.bondPrimaryInterface}
        bondSecondaryInterface={value.bondSecondaryInterface}
      />
    );
  };
  return Component;
};

export const FormViewHostsFields: React.FC<{ protocolType: StaticProtocolType }> = ({
  protocolType,
}) => {
  const emptyHost = getEmptyFormViewHost();
  const CollapsedHostComponent = getCollapsedHostComponent(protocolType);
  const ExpandedHostComponent = getExpandedHostComponent(protocolType);
  return (
    <>
      <Content component={ContentVariants.h3}>Host specific configurations</Content>
      <StaticIpHostsArray<FormViewHost>
        CollapsedHostComponent={CollapsedHostComponent}
        ExpandedHostComponent={ExpandedHostComponent}
        emptyHostData={emptyHost}
      />
    </>
  );
};
