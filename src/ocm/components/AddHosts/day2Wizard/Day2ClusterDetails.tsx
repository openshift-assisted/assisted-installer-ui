import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { Form, Formik, FormikHelpers } from 'formik';
import {
  AddHostsContext,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  WizardFooter,
} from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';
import DiscoverImageCpuArchitectureControlGroup from '../../../../common/components/clusterConfiguration/DiscoveryImageCpuArchitectureControlGroup';

type Day2ClusterDetailValues = {
  cpuArchitecture: CpuArchitecture;
  // hostsNetworkConfigurationType: 'dhcp' | 'static';
};

export const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { day1CpuArchitecture } = React.useContext(AddHostsContext);

  const wizardContext = useDay2WizardContext();
  const { close } = day2DiscoveryImageDialog;

  const handleSubmit = React.useCallback(
    (values: Day2ClusterDetailValues) => {
      wizardContext.setSelectedCpuArchitecture(values.cpuArchitecture);
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
        cpuArchitecture: day1CpuArchitecture || CpuArchitecture.x86,
      }}
      onSubmit={handleSubmit}
    >
      {({ submitForm }) => {
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
                  <DiscoverImageCpuArchitectureControlGroup />
                </StackItem>
              </Stack>
            </Form>
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};
