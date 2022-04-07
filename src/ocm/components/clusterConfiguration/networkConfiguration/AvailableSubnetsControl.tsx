import React, { useEffect } from 'react';
import { Alert, AlertVariant, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import { Cluster } from '../../../../common/api/types';
import { HostSubnets, NetworkConfigurationValues } from '../../../../common/types';
import { DUAL_STACK, NO_SUBNET_SET } from '../../../../common/config/constants';
import { SelectField } from '../../../../common/components/ui';

export interface AvailableSubnetsControlProps {
  clusterId: Cluster['id'];
  hostSubnets: HostSubnets;
  isRequired: boolean;
}

export const AvailableSubnetsControl = ({
  clusterId,
  hostSubnets,
  isRequired = false,
}: AvailableSubnetsControlProps) => {
  const { values, errors, setFieldValue } = useFormikContext<NetworkConfigurationValues>();

  useEffect(() => {
    if (values.machineNetworks && values.machineNetworks?.length < 1) {
      setFieldValue(
        'machineNetworks',
        [
          {
            cidr: hostSubnets.length >= 1 ? hostSubnets[0].subnet : NO_SUBNET_SET,
            clusterId: clusterId,
          },
        ],
        true,
      );
    }
  }, [clusterId, setFieldValue, hostSubnets, values.machineNetworks]);

  return (
    <FormGroup
      label="Machine network"
      labelInfo={values.stackType === DUAL_STACK && 'Primary'}
      fieldId="machine-networks"
      isRequired
    >
      <FieldArray name="machineNetworks">
        {() => (
          <Stack>
            {values.machineNetworks?.map((machineNetwork, index) => {
              return (
                <StackItem key={index}>
                  <SelectField
                    name={`machineNetworks.${index}.cidr`}
                    options={
                      hostSubnets.length
                        ? [
                            {
                              label: `Please select a subnet. (${hostSubnets.length} available)`,
                              value: NO_SUBNET_SET,
                              isDisabled: true,
                              id: 'form-input-hostSubnet-field-option-no-subnet',
                            },
                            ...hostSubnets
                              .sort((subA, subB) => subA.humanized.localeCompare(subB.humanized))
                              .map((hn, index) => ({
                                label: hn.humanized,
                                value: hn.subnet,
                                id: `form-input-hostSubnet-field-option-${index}`,
                              })),
                          ]
                        : [
                            {
                              label: 'No subnets are currently available',
                              value: NO_SUBNET_SET,
                            },
                          ]
                    }
                    isDisabled={!hostSubnets.length}
                    isRequired={isRequired}
                  />
                </StackItem>
              );
            })}
          </Stack>
        )}
      </FieldArray>

      {typeof errors.machineNetworks === 'string' && (
        <Alert variant={AlertVariant.warning} title={errors.machineNetworks} isInline />
      )}
    </FormGroup>
  );
};
