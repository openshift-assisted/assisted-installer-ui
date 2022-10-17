import { Stack, StackItem, FormGroup } from '@patternfly/react-core';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  getFieldId,
  RadioField,
  WizardFooter,
} from '../../../../common';
import DiskEncryptionControlGroup from '../../../../common/components/clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { useOpenshiftVersions } from '../../../hooks';
import ArmCheckbox from '../../clusterConfiguration/ArmCheckbox';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';

export const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { close } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();

  const { versions } = useOpenshiftVersions();

  const handleSubmit = React.useCallback(
    (values: unknown) => {
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
                  <FormGroup
                    label="Hosts' network configuration"
                    fieldId={getFieldId('hostsNetworkConfigurationType', 'radio')}
                    isInline
                  >
                    <RadioField
                      name={'hostsNetworkConfigurationType'}
                      value={'dhcp'}
                      label="DHCP only"
                    />
                    <RadioField
                      name={'hostsNetworkConfigurationType'}
                      value={'static'}
                      label="Static IP, bridges, and bonds"
                    />
                  </FormGroup>
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
