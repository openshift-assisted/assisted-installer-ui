import React, { useState } from 'react';
import { FormGroup, Grid, TextContent, Text, TextVariants, Checkbox } from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import StaticIpHostsArray, { HostComponentProps } from '../StaticIpHostsArray';
import { getFieldId, PopoverIcon } from '../../../../../../common';
import HostSummary from '../CollapsedHost';
import { FormViewHost, StaticProtocolType } from '../../data/dataTypes';
import { getProtocolVersionLabel, getShownProtocolVersions } from '../../data/protocolVersion';
import { getEmptyFormViewHost } from '../../data/emptyData';
import { OcmInputField } from '../../../../ui/OcmFormFields';
import '../staticIp.css';
import BondsSelect from './BondsSelect';
import BondsConfirmationModal from './BondsConfirmationModal';

const getExpandedHostComponent = (protocolType: StaticProtocolType) => {
  const Component: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { setFieldValue } = useFormikContext();
    const [bondPrimaryField] = useField(`${fieldName}.bondPrimaryInterface`);
    const [bondSecondaryField] = useField(`${fieldName}.bondSecondaryInterface`);

    const [useBond, setUseBond] = useState<boolean>(
      !!bondPrimaryField.value || !!bondSecondaryField.value,
    );

    const handleUseBondChange = (checked: boolean) => {
      if (!checked) {
        setIsModalOpen(true);
      } else {
        setUseBond(true);
      }
    };

    const handleModalConfirm = () => {
      setUseBond(false);
      setFieldValue(`${fieldName}.bondType`, 'active-backup');
      setFieldValue(`${fieldName}.bondPrimaryInterface`, '');
      setFieldValue(`${fieldName}.bondSecondaryInterface`, '');
      setIsModalOpen(false);
    };

    const handleModalCancel = () => {
      setIsModalOpen(false);
    };
    return (
      <>
        <Grid hasGutter>
          <FormGroup>
            <Checkbox
              label={
                <>
                  {'Use bond'}{' '}
                  <PopoverIcon
                    noVerticalAlign
                    bodyContent="Select this to combine two network interfaces for redundancy and/or increased bandwidth."
                  />
                </>
              }
              isChecked={useBond}
              onChange={(_event, value) => handleUseBondChange(value)}
              id={`use-bond-${hostIdx}`}
            />
          </FormGroup>
          {useBond && (
            <>
              <div className="use-bond">
                <Grid hasGutter>
                  <FormGroup fieldId={`bond-type-${hostIdx}`}>
                    <BondsSelect
                      name={`${fieldName}.bondType`}
                      data-testid={`bond-type-${hostIdx}`}
                    />
                  </FormGroup>
                  <OcmInputField
                    name={`${fieldName}.bondPrimaryInterface`}
                    label="Port 1 MAC Address"
                    data-testid={`bond-primary-interface-${hostIdx}`}
                  />{' '}
                  <OcmInputField
                    name={`${fieldName}.bondSecondaryInterface`}
                    label="Port 2 MAC Adddress"
                    data-testid={`bond-secondary-interface-${hostIdx}`}
                  />
                </Grid>
              </div>
            </>
          )}
          <OcmInputField
            name={`${fieldName}.macAddress`}
            label="MAC Address"
            isRequired
            data-testid={`mac-address-${hostIdx}`}
          />
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
        <BondsConfirmationModal
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
        title="MAC to IP mapping"
        numInterfaces={1}
        macAddress={value.macAddress}
        mappingValue={mapValue}
        hostIdx={hostIdx}
        hasError={!!error}
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
      <TextContent>
        <Text component={TextVariants.h3}>Host specific configurations</Text>
      </TextContent>
      <StaticIpHostsArray<FormViewHost>
        CollapsedHostComponent={CollapsedHostComponent}
        ExpandedHostComponent={ExpandedHostComponent}
        emptyHostData={emptyHost}
      />
    </>
  );
};
