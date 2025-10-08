import React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  Flex,
  FlexItem,
  TextInputTypes,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { getMachineNetworkCidr } from './machineNetwork';
import { MAX_PREFIX_LENGTH, MIN_PREFIX_LENGTH } from './validationSchemas';
import { getHumanizedSubnetRange } from '../clusterConfiguration';
import { getFieldId, InputField, PopoverIcon } from '../ui';
import { ProtocolVersion, Cidr } from './types';

import useFieldErrorMsg from '../../hooks/useFieldErrorMsg';
import { getAddressObject } from './protocolVersion';

export const MachineNetworkField = ({
  fieldName,
  protocolVersion,
  isDisabled = false,
}: {
  fieldName: string;
  protocolVersion: ProtocolVersion;
  isDisabled?: boolean;
}) => {
  const [{ value }] = useField<Cidr>(fieldName);
  const ipFieldName = `${fieldName}.ip`;
  const prefixLengthFieldName = `${fieldName}.prefixLength`;
  const ipErrorMessage = useFieldErrorMsg({ name: ipFieldName });
  const prefixLengthErrorMessage = useFieldErrorMsg({ name: prefixLengthFieldName });
  const errorMessage = ipErrorMessage || prefixLengthErrorMessage;
  const machineNetworkHelptext = React.useMemo(() => {
    if (errorMessage) {
      return '';
    }
    const cidr = getMachineNetworkCidr(value);
    return getHumanizedSubnetRange(getAddressObject(cidr, protocolVersion));
  }, [value, protocolVersion, errorMessage]);
  const fieldId = getFieldId(`${fieldName}`, 'input');
  return (
    <FormGroup
      labelIcon={
        <PopoverIcon noVerticalAlign bodyContent="The range of IP addresses of the hosts." />
      }
      label="Machine network"
      fieldId={fieldId}
      isRequired
      className="machine-network"
    >
      <Flex>
        <FlexItem spacer={{ default: 'spacerSm' }}>
          <InputField
            name={`${fieldName}.ip`}
            isRequired={true}
            data-testid={`${protocolVersion}-machine-network-ip`}
            showErrorMessage={false}
            isDisabled={isDisabled}
          />
        </FlexItem>
        <FlexItem spacer={{ default: 'spacerSm' }}>{'/'}</FlexItem>
        <FlexItem>
          <InputField
            name={`${fieldName}.prefixLength`}
            isRequired={true}
            data-testid={`${protocolVersion}-machine-network-prefix-length`}
            type={TextInputTypes.number}
            showErrorMessage={false}
            min={MIN_PREFIX_LENGTH}
            max={
              protocolVersion === ProtocolVersion.ipv4
                ? MAX_PREFIX_LENGTH.ipv4
                : MAX_PREFIX_LENGTH.ipv6
            }
            isDisabled={isDisabled}
          />
        </FlexItem>
      </Flex>
      {(errorMessage || machineNetworkHelptext) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={errorMessage ? <ExclamationCircleIcon /> : null}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
            >
              {errorMessage ? errorMessage : machineNetworkHelptext}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};
