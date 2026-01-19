import React from 'react';
import {
  Alert,
  AlertVariant,
  FormGroup,
  GridItem,
  TextInputTypes,
  Grid,
} from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import {
  DUAL_STACK,
  PREFIX_MAX_RESTRICTION,
  NetworkConfigurationValues,
  PopoverIcon,
} from '@openshift-assisted/common';
import { OcmInputField } from '../../ui/OcmFormFields';

const IPv4PrefixPopoverText =
  'For example, if Cluster Network Host Prefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses.';

const IPv6PrefixPopoverText =
  'For example, if Cluster Network Host Prefix is set to 116, then each node is assigned a /116 subnet out of the given cidr (clusterNetworkCIDR), which allows for 4,094 (2^(128 - 116) - 2) pod IPs addresses.';

const ClusterPrefixHelperText =
  'Defines how big the subnets for each individual node are out of the given CIDR. Must enter a whole number.';

const clusterCidrHelperText =
  'The block must not overlap with existing physical networks. To access the Pods from an external network, configure load balancers and routers to manage the traffic.';

const serviceCidrHelperText =
  'Enter only 1 IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.';

const AdvancedNetworkFields = () => {
  const { values, errors } = useFormikContext<NetworkConfigurationValues>();

  const isDualStack = values.stackType === DUAL_STACK;

  const clusterNetworkCidrPrefix = (index: number) =>
    parseInt(
      ((values.clusterNetworks && values.clusterNetworks[index].cidr) || '').split('/')[1],
    ) || 1;

  const isSubnetIPv6 = (index: number) => (isDualStack ? !!index : false);

  const clusterNetworkHostPrefixPopoverText = (index: number) => (
    <>
      <p>
        The subnet prefix length to assign to each individual node.{' '}
        {isSubnetIPv6(index) ? IPv6PrefixPopoverText : IPv4PrefixPopoverText}
      </p>
      <p>
        If you are required to provide access to nodes from an external network, configure load
        balancers and routers to manage the traffic.
      </p>
    </>
  );

  return (
    <Grid className="pf-v6-u-ml-lg">
      <FieldArray name="clusterNetworks">
        {() => (
          <FormGroup fieldId="clusterNetworks" labelInfo={isDualStack && 'Primary'}>
            {values.clusterNetworks?.map((_, index) => {
              return (
                <Grid key={index} className="pf-v6-u-pb-md">
                  <GridItem className={'network-field-group'}>
                    <OcmInputField
                      name={`clusterNetworks.${index}.cidr`}
                      label={
                        <>
                          <span>Cluster network CIDR </span>
                          <PopoverIcon
                            bodyContent={'IP address blocks from which Pod IPs are allocated.'}
                          />
                        </>
                      }
                      helperText={clusterCidrHelperText}
                      isRequired
                      labelInfo={isDualStack ? (index === 0 ? 'Primary' : 'Secondary') : ''}
                    />
                  </GridItem>
                  <GridItem className={'network-field-group'}>
                    <OcmInputField
                      name={`clusterNetworks.${index}.hostPrefix`}
                      label={
                        <>
                          <span>Cluster network host prefix </span>
                          <PopoverIcon
                            bodyContent={clusterNetworkHostPrefixPopoverText(index)}
                            minWidth="30rem"
                          />
                        </>
                      }
                      type={TextInputTypes.number}
                      min={clusterNetworkCidrPrefix(index)}
                      max={
                        isSubnetIPv6(index)
                          ? PREFIX_MAX_RESTRICTION.IPv6
                          : PREFIX_MAX_RESTRICTION.IPv4
                      }
                      helperText={ClusterPrefixHelperText}
                      isRequired
                    />
                  </GridItem>
                </Grid>
              );
            })}
          </FormGroup>
        )}
      </FieldArray>

      {typeof errors.clusterNetworks === 'string' && (
        <Alert variant={AlertVariant.warning} title={errors.clusterNetworks} isInline />
      )}

      <FieldArray name="serviceNetworks">
        {() => (
          <FormGroup fieldId="serviceNetworks" labelInfo={isDualStack && 'Primary'}>
            {values.serviceNetworks?.map((_, index) => (
              <GridItem key={index} className={'network-field-group'}>
                <OcmInputField
                  name={`serviceNetworks.${index}.cidr`}
                  label={
                    <>
                      <span>Service network CIDR </span>
                      <PopoverIcon
                        bodyContent={'The IP address pool used for service IP addresses.'}
                      />
                    </>
                  }
                  helperText={serviceCidrHelperText}
                  isRequired
                  labelInfo={isDualStack ? (index === 0 ? 'Primary' : 'Secondary') : ''}
                />
              </GridItem>
            ))}
          </FormGroup>
        )}
      </FieldArray>

      {typeof errors.serviceNetworks === 'string' && (
        <Alert variant={AlertVariant.warning} title={errors.serviceNetworks} isInline />
      )}
    </Grid>
  );
};

export default AdvancedNetworkFields;
