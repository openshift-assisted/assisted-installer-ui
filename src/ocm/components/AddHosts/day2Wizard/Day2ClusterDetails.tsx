import { Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik } from 'formik';
import React from 'react';
import {
  Cluster,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  ErrorState,
  getDefaultCpuArchitecture,
  getSupportedCpuArchitectures,
  InfraEnv,
  LoadingState,
  useFeature,
} from '../../../../common';
import { HostsNetworkConfigurationType, InfraEnvsService } from '../../../services';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { handleApiError } from '../../../api';
import { Day2ClusterDetailValues } from '../types';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import Day2WizardFooter from './Day2WizardFooter';
import Day2HostStaticIpConfigurations from './Day2StaticIpHostConfigurations';
import { mapClusterCpuArchToInfraEnvCpuArch } from '../../../services/CpuArchitectureService';
import CpuArchitectureDropdown from '../../clusterConfiguration/CpuArchitectureDropdown';
import useArchitectureSupportLevels from '../../../hooks/useArchitecturesSupportLevels';

const getDay2ClusterDetailInitialValues = async (
  clusterId: Cluster['id'],
): Promise<Day2ClusterDetailValues | Error> => {
  try {
    let initialValues: Day2ClusterDetailValues | Error;
    let infraEnv: InfraEnv;
    let cpuArchitecture: CpuArchitecture = getDefaultCpuArchitecture();
    const allInfraEnvsAssociatedWithGivenCluster = await InfraEnvsService.getAllInfraEnvs(
      clusterId,
    );

    if (allInfraEnvsAssociatedWithGivenCluster.length > 0) {
      infraEnv = allInfraEnvsAssociatedWithGivenCluster[0];
      cpuArchitecture = mapClusterCpuArchToInfraEnvCpuArch(infraEnv.cpuArchitecture);
      initialValues = {
        cpuArchitecture,
        hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
          ? HostsNetworkConfigurationType.STATIC
          : HostsNetworkConfigurationType.DHCP,
      };
    } else {
      initialValues = new Error(`No infra-env found associated with cluster ${clusterId}`);
    }

    return initialValues;
  } catch (error) {
    handleApiError(error);
    return new Error(error as string);
  }
};

const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const {
    close,
    data: { cluster: day2Cluster },
  } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();
  const [initialValues, setInitialValues] = React.useState<Day2ClusterDetailValues | Error>();
  const [isSubmitting, setSubmitting] = React.useState(false);

  const cpuArchitectureSupportLevelIdToSupportLevelMap = useArchitectureSupportLevels(
    day2Cluster.openshiftVersion,
  );
  const canSelectCpuArch = useFeature('ASSISTED_INSTALLER_MULTIARCH_SUPPORTED');
  const cpuArchitectures = React.useMemo(
    () =>
      getSupportedCpuArchitectures(
        canSelectCpuArch,
        cpuArchitectureSupportLevelIdToSupportLevelMap,
      ),
    [canSelectCpuArch, cpuArchitectureSupportLevelIdToSupportLevelMap],
  );

  React.useEffect(() => {
    const fetchAndSetInitialValues = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(day2Cluster.id);
      setInitialValues(initialValues);
    };
    void fetchAndSetInitialValues();
  }, [day2Cluster.id]);

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

  if (!initialValues) {
    return <LoadingState />;
  } else if (initialValues instanceof Error) {
    return <ErrorState content="Failed to load associated data for the Day2 cluster" />;
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ submitForm }) => {
        return (
          <ClusterWizardStep
            navigation={<Day2WizardNav />}
            footer={
              <Day2WizardFooter
                onNext={() => {
                  void submitForm();
                }}
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
                  <CpuArchitectureDropdown
                    openshiftVersion={day2Cluster.openshiftVersion}
                    day1CpuArchitecture={initialValues.cpuArchitecture}
                    cpuArchitectures={cpuArchitectures}
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
