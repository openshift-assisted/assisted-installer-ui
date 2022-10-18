import { FormGroup, Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import React from 'react';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  WizardFooter,
  getFieldId,
  RadioField,
} from '../../../../common';
import { HostsNetworkConfigurationType } from '../../../services';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';
import DiscoverImageCpuArchitectureControlGroup from '../../../../common/components/clusterConfiguration/DiscoveryImageCpuArchitectureControlGroup';
import { useOpenshiftVersions } from '../../../hooks';

type Day2ClusterDetailValues = {
  cpuArchitecture: CpuArchitecture;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
};

export const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const {
    close,
    data: { cluster },
  } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();
  const day1CpuArchitecture = cluster.cpuArchitecture as CpuArchitecture;

  const { isMultiCpuArchSupported } = useOpenshiftVersions();

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

  const isMultiArch = isMultiCpuArchSupported(cluster.openshiftVersion);

  return (
    <Formik
      initialValues={{
        cpuArchitecture: day1CpuArchitecture || CpuArchitecture.x86,
        hostsNetworkConfigurationType: HostsNetworkConfigurationType.DHCP,
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
              <Grid hasGutter>
                <GridItem>
                  <ClusterWizardStepHeader>Cluster details</ClusterWizardStepHeader>
                </GridItem>
                <GridItem span={12} lg={10} xl={9} xl2={7}>
                  <DiscoverImageCpuArchitectureControlGroup
                    isMultiArchitecture={isMultiArch}
                    day1CpuArchitecture={day1CpuArchitecture}
                  />
                </GridItem>
                <GridItem>
                  <DiscoverImageCpuArchitectureControlGroup
                    isMultiArchitecture={isMultiArch}
                    day1CpuArchitecture={day1CpuArchitecture}
                  />
                </GridItem>
                <GridItem>
                  <Day2HostConfigurations />
                </GridItem>
              </Grid>
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
