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
import { Address6 } from 'ip-address';
import {
  DUAL_STACK,
  PREFIX_MAX_RESTRICTION,
  NetworkConfigurationValues,
  PopoverIcon,
} from '../../../../common';
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
  const { values, errors, setFieldValue } = useFormikContext<NetworkConfigurationValues>();

  const isDualStack = values.stackType === DUAL_STACK;

  // Reorder Cluster Networks and Service Networks when Machine Network primary changes
  React.useEffect(() => {
    if (!isDualStack || !values.machineNetworks?.[0]?.cidr) return;

    const primaryMachineNetworkCidr = values.machineNetworks[0].cidr;
    const isPrimaryIPv6 = Address6.isValid(primaryMachineNetworkCidr);

    // Check Cluster Networks
    if (values.clusterNetworks && values.clusterNetworks.length >= 2) {
      const first = values.clusterNetworks[0];
      const second = values.clusterNetworks[1];
      const firstClusterCidr = first?.cidr;
      const secondClusterCidr = second?.cidr;
      if (!firstClusterCidr || !secondClusterCidr) return;

      const isFirstClusterIPv6 = Address6.isValid(firstClusterCidr);
      const isSecondClusterIPv6 = Address6.isValid(secondClusterCidr);

      // Only swap when families are opposite and mismatched with primary
      if (isFirstClusterIPv6 === isSecondClusterIPv6) {
        // Both have the same family; don't attempt to reorder to avoid oscillation
      } else if (isPrimaryIPv6 && !isFirstClusterIPv6 && isSecondClusterIPv6) {
        const reordered = [second, first];
        setFieldValue('clusterNetworks', reordered, false);
      } else if (!isPrimaryIPv6 && isFirstClusterIPv6 && !isSecondClusterIPv6) {
        const reordered = [second, first];
        setFieldValue('clusterNetworks', reordered, false);
      }
    }

    // Check Service Networks
    if (values.serviceNetworks && values.serviceNetworks.length >= 2) {
      const first = values.serviceNetworks[0];
      const second = values.serviceNetworks[1];
      const firstServiceCidr = first?.cidr;
      const secondServiceCidr = second?.cidr;
      if (!firstServiceCidr || !secondServiceCidr) return;

      const isFirstServiceIPv6 = Address6.isValid(firstServiceCidr);
      const isSecondServiceIPv6 = Address6.isValid(secondServiceCidr);

      // Only swap when families are opposite and mismatched with primary
      if (isFirstServiceIPv6 === isSecondServiceIPv6) {
        // Both have the same family; don't attempt to reorder to avoid oscillation
      } else if (isPrimaryIPv6 && !isFirstServiceIPv6 && isSecondServiceIPv6) {
        const reordered = [second, first];
        setFieldValue('serviceNetworks', reordered, false);
      } else if (!isPrimaryIPv6 && isFirstServiceIPv6 && !isSecondServiceIPv6) {
        const reordered = [second, first];
        setFieldValue('serviceNetworks', reordered, false);
      }
    }
  }, [
    isDualStack,
    values.machineNetworks,
    values.clusterNetworks,
    values.serviceNetworks,
    setFieldValue,
  ]);

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
