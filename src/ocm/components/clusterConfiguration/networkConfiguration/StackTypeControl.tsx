import React from 'react';
import { ButtonVariant, FormGroup } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { Cluster } from '../../../../common/api/types';
import { NetworkConfigurationValues } from '../../../../common/types';
import {
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_SDN,
  NO_SUBNET_SET,
} from '../../../../common/config/constants';
import { getFieldId } from '../../../../common/components/ui/formik/utils';
import { ConfirmationModal, PopoverIcon, RadioField } from '../../../../common/components/ui';

export const StackTypeControlGroup: React.FC<{ clusterId: Cluster['id'] }> = ({ clusterId }) => {
  const { setFieldValue, values, validateForm } = useFormikContext<NetworkConfigurationValues>();
  const [openConfirmModal, setConfirmModal] = React.useState(false);

  const setSingleStack = () => {
    setFieldValue('networkType', NETWORK_TYPE_SDN);
    setFieldValue('vipDhcpAllocation', true);

    if (values.machineNetworks && values.machineNetworks?.length >= 2) {
      setFieldValue('machineNetworks', values.machineNetworks.slice(0, 1));
    }
    if (values.clusterNetworks && values.clusterNetworks?.length >= 2) {
      setFieldValue('clusterNetworks', values.clusterNetworks.slice(0, 1));
    }
    if (values.serviceNetworks && values.serviceNetworks?.length >= 2) {
      setFieldValue('serviceNetworks', values.serviceNetworks.slice(0, 1));
    }

    validateForm();
  };

  const setDualStack = () => {
    setFieldValue('networkType', NETWORK_TYPE_OVN);
    setFieldValue('vipDhcpAllocation', false);

    if (values.machineNetworks && values.machineNetworks?.length < 2) {
      setFieldValue(
        'machineNetworks',
        [...values.machineNetworks, { cidr: NO_SUBNET_SET, clusterId: clusterId }],
        false,
      );
    }
    if (values.clusterNetworks && values.clusterNetworks?.length < 2) {
      setFieldValue(
        'clusterNetworks',
        [...values.clusterNetworks, { cidr: '', hostPrefix: '', clusterId: clusterId }],
        false,
      );
    }
    if (values.serviceNetworks && values.serviceNetworks?.length < 2) {
      setFieldValue(
        'serviceNetworks',
        [...values.serviceNetworks, { cidr: '', clusterId: clusterId }],
        false,
      );
    }
  };

  const setStackType = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('stackType', e.target.value);
    if (e.target.value === 'dualStack') {
      setDualStack();
    } else if (
      (values.machineNetworks && values.machineNetworks[1].cidr !== 'NO_SUBNET_SET') ||
      (values.clusterNetworks && values.clusterNetworks[1].cidr) ||
      (values.clusterNetworks && values.clusterNetworks[1].hostPrefix) ||
      (values.serviceNetworks && values.serviceNetworks[1].cidr)
    ) {
      setConfirmModal(true);
    } else {
      setSingleStack();
    }
  };

  return (
    <>
      <FormGroup
        label="Networking stack type"
        fieldId={getFieldId('stackType', 'radio')}
        isInline
        onChange={setStackType}
      >
        <RadioField
          name={'stackType'}
          value={'singleStack'}
          label={
            <>
              {'Single-stack'}
              <PopoverIcon
                variant="plain"
                bodyContent="Select single stack when your hosts are using either IPV4 or IPV6."
              />
            </>
          }
        />
        <RadioField
          name={'stackType'}
          value={'dualStack'}
          label={
            <>
              {'Dual-stack'}
              <PopoverIcon
                variant="plain"
                bodyContent="Select dual stack when your hosts are using IPV4 together with IPV6."
              />
            </>
          }
        />
      </FormGroup>
      {openConfirmModal && (
        <ConfirmationModal
          title={'Change stack type?'}
          titleIconVariant={'warning'}
          confirmationButtonText={'Change'}
          confirmationButtonVariant={ButtonVariant.primary}
          content={
            <>
              <p>All data and configuration done for 'Dual-stack' will be lost.</p>
            </>
          }
          onClose={() => setConfirmModal(false)}
          onConfirm={() => {
            setConfirmModal(false);
            setSingleStack();
          }}
        />
      )}
    </>
  );
};
