import React, { useEffect } from 'react';
import {
  SplitItem,
  FormGroup,
  Split,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Switch,
  Radio,
  Tooltip,
  NumberInputProps,
} from '@patternfly/react-core';
import {
  Cluster,
  ClusterWizardStepHeader,
  ClusterWizardStep,
  RadioField,
  SwitchField,
  PopoverIcon,
  NO_SUBNET_SET,
  NetworkConfigurationValues,
  /*  /!*HostDiscoveryValues,
  getFormikErrorFields,
  FormikAutoSave,
  ClusterUpdateParams,
  getHostDiscoveryInitialValues,*!/*/
} from '../../../common';
import ClusterWizardNavigation from '../clusterWizard/ClusterWizardNavigation';
import { HelpIcon } from '@patternfly/react-icons';
import { useFormikContext } from 'formik';
import { CNVHostRequirementsContent } from '../hosts/HostRequirementsContent';

const StorageStep: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const GROUP_NAME = 'Storage type';
  const { setFieldValue, values, touched, validateField } = useFormikContext<
    NetworkConfigurationValues
  >();

  const handleChangeControlPlane = (isChecked: boolean) => {
    switch (cluster.diskEncryption?.enableOn) {
      case 'none':
        setFieldValue('diskEncryption.enableOn', 'masters');
        break;
      case 'workers':
        setFieldValue('diskEncryption.enableOn', 'all');
        break;
      case 'all':
        setFieldValue('diskEncryption.enableOn', 'workers');
        break;
      case 'masters':
        setFieldValue('diskEncryption.enableOn', 'none');
        break;
    }
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <ClusterWizardStepHeader>Storage</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <Split>
          <SplitItem>
            <Switch
              id="simple-switch"
              label="Enable encryption of installation disks on control plane nodes"
              labelOff="Message when off"
              /*
              isChecked={isChecked}*/
              onChange={handleChangeControlPlane}
            />
          </SplitItem>
          &nbsp;
          <SplitItem>
            <PopoverIcon
              component={'a'}
              variant={'plain'}
              IconComponent={HelpIcon}
              minWidth="10rem"
              headerContent="Additional Requirements"
              bodyContent={<h1>explanation</h1>}
            />
          </SplitItem>
        </Split>
      </StackItem>
      <StackItem>
        <Flex>
          <FlexItem spacer={{ default: 'spacer3xl' }}>
            <Split>
              <SplitItem>
                <Radio name="tpmv2" label="TPMV2" id="TPMV2-button" />
              </SplitItem>
              &nbsp;
              <SplitItem>
                <PopoverIcon
                  component={'a'}
                  variant={'plain'}
                  IconComponent={HelpIcon}
                  minWidth="10rem"
                  headerContent="explanation tpmv2"
                  bodyContent={<h1>explanation</h1>}
                />
              </SplitItem>
            </Split>
          </FlexItem>
          <FlexItem spacer={{ default: 'spacer3xl' }}>
            <Split>
              <SplitItem>
                <Radio name="tang" label="TANG" id="TANG-button" />
              </SplitItem>
              &nbsp;
              <SplitItem>
                <PopoverIcon
                  component={'a'}
                  variant={'plain'}
                  IconComponent={HelpIcon}
                  minWidth="10rem"
                  headerContent="explanation tang"
                  bodyContent={<h1>explanation</h1>}
                />
              </SplitItem>
            </Split>
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <Split>
          <SplitItem>
            <Switch
              id="simple-switch"
              label="Enable encryption of installation disks on workers"
              labelOff="Message when off"
              /* isChecked={isChecked}*/
              onChange={handleChangeControlPlane}
            />
          </SplitItem>
          &nbsp;
          <SplitItem>
            <PopoverIcon
              component={'a'}
              variant={'plain'}
              IconComponent={HelpIcon}
              minWidth="10rem"
              headerContent="Additional Requirements"
              bodyContent={<h1>explanation</h1>}
            />
          </SplitItem>
        </Split>
      </StackItem>
    </Stack>
  );
};

export default StorageStep;
