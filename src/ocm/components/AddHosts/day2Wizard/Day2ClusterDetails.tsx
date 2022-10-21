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
  Cluster,
  LoadingState,
} from '../../../../common';
import { HostsNetworkConfigurationType, InfraEnvsService } from '../../../services';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';
import DiscoverImageCpuArchitectureControlGroup from '../../../../common/components/clusterConfiguration/DiscoveryImageCpuArchitectureControlGroup';
import { useOpenshiftVersions } from '../../../hooks';
import { handleApiError } from '../../../api';
import { getDummyInfraEnvField } from '../../clusterConfiguration/staticIp/data/dummyData';

type Day2ClusterDetailValues = {
  cpuArchitecture: CpuArchitecture;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
};

const getDay2ClusterDetailInitialValues = async (clusterId: Cluster['id']) => {
  try {
    const { data: infraEnv } = await InfraEnvsService.getInfraEnv(clusterId, CpuArchitecture.x86);

    return {
      // TODO (multi-arch) improve to set the default value equal to the cpuArchitecture of Day1 cluster
      cpuArchitecture: CpuArchitecture.x86,
      hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
        ? HostsNetworkConfigurationType.STATIC
        : HostsNetworkConfigurationType.DHCP,
    };
  } catch (error) {
    console.error(error);
  }
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
  const [initialValues, setInitialValues] = React.useState<Day2ClusterDetailValues>();

  React.useEffect(() => {
    const doItAsync = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(cluster.id);
      setInitialValues(initialValues);
    };
    void doItAsync();
  }, [cluster.id]);

  const handleSubmit = React.useCallback(
    async (values: Day2ClusterDetailValues) => {
      try {
        await InfraEnvsService.updateAll(cluster.id, {
          staticNetworkConfig:
            values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.DHCP
              ? []
              : getDummyInfraEnvField(),
        });
        wizardContext.setSelectedCpuArchitecture(values.cpuArchitecture);
        wizardContext.moveNext();
      } catch (error) {
        handleApiError(error);
      }
    },
    [cluster.id, wizardContext],
  );

  const handleOnNext = (submitForm: FormikHelpers<unknown>['submitForm']) => {
    return submitForm;
  };

  const isMultiArch = isMultiCpuArchSupported(cluster.openshiftVersion);

  return initialValues ? (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
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
  ) : (
    <LoadingState />
  );
};

const Day2HostConfigurations = () => {
  const { values, setFieldValue } = useFormikContext<Day2ClusterDetailValues>();
  const wizardContext = useDay2WizardContext();

  React.useEffect(() => {
    if (values.hostsNetworkConfigurationType) {
      wizardContext.onUpdateHostNetworkConfigType(values.hostsNetworkConfigurationType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <RadioField
        name={'hostsNetworkConfigurationType'}
        value={HostsNetworkConfigurationType.DHCP}
        label="DHCP only"
      />
      <RadioField
        name={'hostsNetworkConfigurationType'}
        value={HostsNetworkConfigurationType.STATIC}
        label="Static IP, bridges, and bonds"
      />
    </FormGroup>
  );
};
