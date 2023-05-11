import { Alert, Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik } from 'formik';
import React from 'react';
import {
  Cluster,
  ClusterCpuArchitecture,
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  ErrorState,
  ExternalLink,
  getSupportedCpuArchitectures,
  HOW_TO_KNOW_IF_CLUSTER_SUPPORTS_MULTIPLE_CPU_ARCHS,
  LoadingState,
  SupportedCpuArchitecture,
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
import { useOpenshiftVersions, usePullSecret } from '../../../hooks';

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
  const [initialValues, setInitialValues] = React.useState<
    Day2ClusterDetailValues | Error | null
  >();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [isAlternativeCpuSelected, setIsAlternativeCpuSelected] = React.useState(false);
  const canSelectCpuArch = useFeature('ASSISTED_INSTALLER_MULTIARCH_SUPPORTED');
  const { getCpuArchitectures } = useOpenshiftVersions();
  const cpuArchitecturesByVersionImage = getCpuArchitectures(day2Cluster.openshiftVersion);
  const day1CpuArchitecture = mapClusterCpuArchToInfraEnvCpuArch(day2Cluster.cpuArchitecture);
  const pullSecret = usePullSecret();
  const cpuArchitectures = React.useMemo(
    () =>
      getSupportedCpuArchitectures(
        canSelectCpuArch,
        cpuArchitecturesByVersionImage,
        day1CpuArchitecture,
      ),
    [canSelectCpuArch, cpuArchitecturesByVersionImage, day1CpuArchitecture],
  );
  React.useEffect(() => {
    const fetchAndSetInitialValues = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(
        day2Cluster.id,
        day1CpuArchitecture,
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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

  const createNewInfraEnvWithCpuArchitecture = React.useCallback(
    (pullSecret: string, cpuArchitecture: ClusterCpuArchitecture) => {
      //If infraEnv don't exist, create a new one
      void InfraEnvsService.create({
        name: `${day2Cluster.name || ''}_infra-env-${cpuArchitecture}`,
        pullSecret,
        clusterId: day2Cluster.id,
        openshiftVersion: day2Cluster.openshiftVersion,
        cpuArchitecture: cpuArchitecture,
      });
    },
    [day2Cluster.name, day2Cluster.id, day2Cluster.openshiftVersion],
  );

  const onChangeCpuArchitectureDropdown = React.useCallback(
    (value: string, initialValues: Day2ClusterDetailValues): void => {
      if (value !== initialValues.cpuArchitecture) {
        //Fetch infraEnv by clusterId and cpu architecture
        void InfraEnvsService.getInfraEnv(day2Cluster.id, value as SupportedCpuArchitecture)
          .then((infraEnv) => {
            if (!infraEnv && pullSecret) {
              createNewInfraEnvWithCpuArchitecture(pullSecret, value as ClusterCpuArchitecture);
            }
          })
          .catch(() => {
            if (pullSecret) {
              //If infraEnv don't exist, create a new one
              createNewInfraEnvWithCpuArchitecture(pullSecret, value as ClusterCpuArchitecture);
            }
          });
      }
      setIsAlternativeCpuSelected(value !== initialValues.cpuArchitecture);
    },
    [day2Cluster.id, createNewInfraEnvWithCpuArchitecture, pullSecret],
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
                <GridItem span={12} xl={10}>
                  <CpuArchitectureDropdown
                    openshiftVersion={day2Cluster.openshiftVersion}
                    day1CpuArchitecture={initialValues.cpuArchitecture}
                    cpuArchitectures={cpuArchitectures}
                    onChange={(value) => onChangeCpuArchitectureDropdown(value, initialValues)}
                  />
                </GridItem>
                {isAlternativeCpuSelected && (
                  <GridItem span={12} xl={10}>
                    <Alert
                      isInline
                      variant="info"
                      title={
                        'To check if the current version of your cluster supports multiple CPU architectures,'
                      }
                    >
                      <>
                        <ExternalLink href={HOW_TO_KNOW_IF_CLUSTER_SUPPORTS_MULTIPLE_CPU_ARCHS}>
                          follow these steps
                        </ExternalLink>
                      </>
                    </Alert>
                  </GridItem>
                )}

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
