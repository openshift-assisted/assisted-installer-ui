import React from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  FormGroup,
  StackItem,
  TextInputTypes,
  Grid,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Address6 } from 'ip-address';
import { FieldArray, useFormikContext } from 'formik';
import { Cluster } from '../../../../common/api/types';
import { NetworkConfigurationValues } from '../../../../common/types';
import { useFeature } from '../../../../common/features';
import { InputField } from '../../../../common/components/ui';
import { PREFIX_MAX_RESTRICTION } from '../../../../common/config/constants';
import { NetworkTypeControlGroup } from './NetworkTypeControlGroup';
import './AdvancedNetworkFields.css';

const REMOVE_BUTTON_EXIT_DELAY = 1500;

const AdvancedNetworkFields: React.FC<{ clusterId: Cluster['id']; enableSDN?: boolean }> = ({
  clusterId,
  enableSDN = true,
}) => {
  const { setFieldValue, values, errors } = useFormikContext<NetworkConfigurationValues>();

  const isNetworkTypeSelectionEnabled = useFeature(
    'ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE',
  );

  const clusterNetworkCidrPrefix = (index: number) =>
    parseInt(
      ((values.clusterNetworks && values.clusterNetworks[index].cidr) || '').split('/')[1],
    ) || 1;

  const formatClusterNetworkHostPrefix = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (isNaN(parseInt(e.target.value))) {
      setFieldValue(`clusterNetworks.${index}.hostPrefix`, clusterNetworkCidrPrefix(index));
    }
  };

  const isSubnetIPv6 = (index: number) =>
    Address6.isValid((values.clusterNetworks && values.clusterNetworks[index].cidr) || '');

  const clusterNetworkHostPrefixHelperText = (index: number) =>
    isSubnetIPv6(index)
      ? 'The subnet prefix length to assign to each individual node. For example, if Cluster Network Host Prefix is set to 116, then each node is assigned a /116 subnet out of the given cidr (clusterNetworkCIDR), which allows for 4,094 (2^(128 - 116) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.'
      : 'The subnet prefix length to assign to each individual node. For example, if Cluster Network Host Prefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.';

  return (
    <Grid hasGutter>
      <FieldArray name="clusterNetworks">
        {({ push, remove }) => (
          <FormGroup
            fieldId="clusterNetworks"
            labelInfo={values.stackType === 'dualStack' && 'Primary'}
          >
            {values.clusterNetworks?.map((_, index) => {
              return (
                <StackItem key={index} className={'network-field-group'}>
                  <Tooltip
                    hidden={index === 0 || (index === 1 && values.stackType === 'dualStack')}
                    exitDelay={REMOVE_BUTTON_EXIT_DELAY}
                    className={'remove-button--tooltip'}
                    flipBehavior={['right', 'bottom']}
                    distance={1}
                    position="right-start"
                    content={
                      <Button variant="plain" onClick={() => remove(index)}>
                        <MinusCircleIcon />
                      </Button>
                    }
                  >
                    <>
                      <InputField
                        name={`clusterNetworks.${index}.cidr`}
                        label="Cluster network CIDR"
                        helperText="IP address block from which Pod IPs are allocated. This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic."
                        isRequired
                        labelInfo={index == 0 && values.stackType == 'dualStack' ? 'Primary' : ''}
                      />
                      <InputField
                        name={`clusterNetworks.${index}.hostPrefix`}
                        label="Cluster network host prefix"
                        type={TextInputTypes.number}
                        min={clusterNetworkCidrPrefix(index)}
                        max={
                          isSubnetIPv6(index)
                            ? PREFIX_MAX_RESTRICTION.IPv6
                            : PREFIX_MAX_RESTRICTION.IPv4
                        }
                        onBlur={(e) =>
                          formatClusterNetworkHostPrefix(
                            e as React.ChangeEvent<HTMLInputElement>,
                            index,
                          )
                        }
                        helperText={clusterNetworkHostPrefixHelperText(index)}
                        isRequired
                      />
                    </>
                  </Tooltip>
                </StackItem>
              );
            })}

            {values.stackType === 'singleStack' && (
              <StackItem>
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  onClick={() => {
                    push({ cidr: '', hostPrefix: '', clusterId: clusterId });
                  }}
                >
                  Add
                </Button>
              </StackItem>
            )}
          </FormGroup>
        )}
      </FieldArray>

      {typeof errors.clusterNetworks === 'string' && (
        <Alert variant={AlertVariant.info} title={errors.clusterNetworks} isInline />
      )}

      <FieldArray name="serviceNetworks">
        {({ push, remove }) => (
          <FormGroup
            fieldId="serviceNetworks"
            labelInfo={values.stackType === 'dualStack' && 'Primary'}
          >
            {values.serviceNetworks?.map((_, index) => (
              <StackItem key={index} className={'network-field-group'}>
                <Tooltip
                  hidden={index === 0 || (index === 1 && values.stackType === 'dualStack')}
                  exitDelay={REMOVE_BUTTON_EXIT_DELAY}
                  className={'remove-button--tooltip'}
                  flipBehavior={['right', 'bottom']}
                  distance={1}
                  position="right-start"
                  content={
                    <Button variant="plain" onClick={() => remove(index)}>
                      <MinusCircleIcon />
                    </Button>
                  }
                >
                  <InputField
                    name={`serviceNetworks.${index}.cidr`}
                    label="Service network CIDR"
                    helperText="The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic."
                    isRequired
                    labelInfo={index == 0 && values.stackType == 'dualStack' ? 'Primary' : ''}
                  />
                </Tooltip>
              </StackItem>
            ))}
            {values.stackType === 'singleStack' && (
              <StackItem>
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  onClick={() => {
                    push({ cidr: '', clusterId: clusterId });
                  }}
                >
                  Add
                </Button>
              </StackItem>
            )}
          </FormGroup>
        )}
      </FieldArray>

      {typeof errors.serviceNetworks === 'string' && (
        <Alert variant={AlertVariant.info} title={errors.serviceNetworks} isInline />
      )}

      {isNetworkTypeSelectionEnabled && <NetworkTypeControlGroup enableSDN={enableSDN} />}
    </Grid>
  );
};

export default AdvancedNetworkFields;
