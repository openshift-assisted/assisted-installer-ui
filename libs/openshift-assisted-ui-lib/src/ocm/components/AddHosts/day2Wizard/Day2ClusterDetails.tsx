import { Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik } from 'formik';
import React from 'react';
import {
  canSelectCpuArchitecture,
  Cluster,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  ErrorState,
  LoadingState,
  WizardFooter,
} from '../../../../common';
import DiscoverImageCpuArchitectureControlGroup from '../../../../common/components/clusterConfiguration/DiscoveryImageCpuArchitectureControlGroup';
import { HostsNetworkConfigurationType, InfraEnvsService } from '../../../services';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { handleApiError } from '../../../api';
import { Day2ClusterDetailValues } from '../types';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import Day2HostStaticIpConfigurations from './Day2StaticIpHostConfigurations';
import { mapClusterCpuArchToInfraEnvCpuArch } from '../../../services/CpuArchitectureService';

const getDay2ClusterDetailInitialValues = async (
  clusterId: Cluster['id'],
  day1CpuArchitecture: CpuArchitecture,
) => {
  try {
    const infraEnv = await InfraEnvsService.getInfraEnv(clusterId, day1CpuArchitecture);

    return {
      cpuArchitecture: day1CpuArchitecture,
      hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
        ? HostsNetworkConfigurationType.STATIC
        : HostsNetworkConfigurationType.DHCP,
    };
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const {
    close,
    data: { cluster: day2Cluster },
  } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();
  const [initialValues, setInitialValues] = React.useState<Day2ClusterDetailValues | null>();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const canSelectCpuArch = canSelectCpuArchitecture(day2Cluster);

  const day1CpuArchitecture = mapClusterCpuArchToInfraEnvCpuArch(day2Cluster.cpuArchitecture);

  React.useEffect(() => {
    const fetchAndSetInitialValues = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(
        day2Cluster.id,
        day1CpuArchitecture,
      );
      setInitialValues(initialValues);
    };
    void fetchAndSetInitialValues();
  }, [day2Cluster.id, day1CpuArchitecture]);

  const handleSubmit = React.useCallback(
    async (values: Day2ClusterDetailValues) => {
      try {
        setSubmitting(true);
        // - If the user selected DHCP, update all infraEnvs to have DHCP too
        // - If the user selected StaticIP, perform no changes yet.
        //  (The changes will be synced to all the infraEnvs when they are submitted on the StaticIP steps)
        const isDhcp = values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.DHCP;
        if (isDhcp) {
          await InfraEnvsService.updateAllInfraEnvsToDhcp(day2Cluster.id);
        }
        wizardContext.setSelectedCpuArchitecture(values.cpuArchitecture);
        wizardContext.onUpdateHostNetworkConfigType(values.hostsNetworkConfigurationType);
      } catch (error) {
        handleApiError(error);
      } finally {
        setSubmitting(false);
      }
    },
    [day2Cluster.id, wizardContext],
  );

  if (initialValues === undefined) {
    return <LoadingState />;
  } else if (initialValues === null) {
    return <ErrorState content="Failed to load associated data for the Day2 cluster" />;
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ submitForm }) => {
        return (
          <ClusterWizardStep
            navigation={<Day2WizardNav />}
            footer={
              <WizardFooter
                onNext={() => {
                  void submitForm();
                }}
                onBack={() => wizardContext.moveBack()}
                isBackDisabled={wizardContext.currentStepId === 'cluster-details'}
                isNextDisabled={wizardContext.currentStepId === 'download-iso'}
                onCancel={close}
                isSubmitting={isSubmitting}
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
                    canSelectCpuArchitecture={canSelectCpuArch}
                    day1CpuArchitecture={day1CpuArchitecture}
                    openshiftVersion={day2Cluster.openshiftVersion}
                  />
                </GridItem>
                <GridItem>
                  <Day2HostStaticIpConfigurations />
                </GridItem>
              </Grid>
            </Form>
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default Day2ClusterDetails;
