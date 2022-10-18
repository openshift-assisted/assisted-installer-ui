import { Stack, StackItem, FormGroup } from '@patternfly/react-core';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import React from 'react';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  DiskEncryption,
  getFieldId,
  RadioField,
  WizardFooter,
} from '../../../../common';
import DiskEncryptionControlGroup from '../../../../common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { TangServer } from '../../../../common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionValues';
import { useOpenshiftVersions } from '../../../hooks';
import { HostsNetworkConfigurationType } from '../../../services';
import ArmCheckbox from '../../clusterConfiguration/ArmCheckbox';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';

type Day2ClusterDetailValues = {
  hostsNetworkConfigurationType: 'dhcp' | 'static';
  diskEncryption: boolean;
  enableDiskEncryptionOnWorkers: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  diskEncryptionTangServers: TangServer[];
};

export const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { close } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();

  const { versions } = useOpenshiftVersions();

  const handleSubmit = React.useCallback(
    (values: Day2ClusterDetailValues) => {
      console.log(values);
      wizardContext.moveNext();
    },
    [wizardContext],
  );

  const handleOnNext = (submitForm: FormikHelpers<unknown>['submitForm']) => {
    return submitForm;
  };

  return (
    <Formik
      initialValues={{
        enableDiskEncryptionOnWorkers: false,
        diskEncryptionMode: 'tpmv2',
        diskEncryptionTangServers: [],
        diskEncryption: false,
        hostsNetworkConfigurationType: 'dhcp',
      }}
      onSubmit={handleSubmit}
    >
      {({ values, submitForm }) => {
        return (
          <ClusterWizardStep
            navigation={<Day2WizardNav />}
            footer={
              <WizardFooter
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onNext={handleOnNext(submitForm)}
                onBack={() => wizardContext.moveBack()}
                isBackDisabled={wizardContext.currentStepId === 'cluster-details'}
                isNextDisabled={wizardContext.currentStepId === 'download-iso'}
                onCancel={close}
              />
            }
          >
            <Form id="day2-wizard-cluster-details__form">
              <Stack hasGutter>
                <StackItem>
                  <ClusterWizardStepHeader>Cluster details</ClusterWizardStepHeader>
                </StackItem>
                <StackItem>
                  <ArmCheckbox versions={versions} />
                </StackItem>
                <StackItem>
                  <Day2HostConfigurations />
                </StackItem>
                <StackItem>
                  {/* TODO(jgyselov): figure out the copy */}
                  <DiskEncryptionControlGroup
                    values={values}
                    isSNO={false}
                    enableOnMasters={false}
                  />
                </StackItem>
              </Stack>
            </Form>
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

const Day2HostConfigurations = () => {
  const { setFieldValue } = useFormikContext<Day2ClusterDetailValues>();
  const wizardContext = useDay2WizardContext();

  const onChangeNetworkType = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    wizardContext.onUpdateHostNetworkConfigType(value as HostsNetworkConfigurationType);
    setFieldValue('hostsNetworkConfigurationType', value);
  };

  return (
    <FormGroup
      label="Hosts' network configuration"
      fieldId={getFieldId('hostsNetworkConfigurationType', 'radio')}
      isInline
      onChange={onChangeNetworkType}
    >
      <RadioField name={'hostsNetworkConfigurationType'} value={'dhcp'} label="DHCP only" />
      <RadioField
        name={'hostsNetworkConfigurationType'}
        value={'static'}
        label="Static IP, bridges, and bonds"
      />
    </FormGroup>
  );
};
