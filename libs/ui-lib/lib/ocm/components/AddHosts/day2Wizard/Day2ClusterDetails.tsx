import { Alert, Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik } from 'formik';
import React from 'react';
import {
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
import {
  Cluster,
  InfraEnv,
  InfraEnvCreateParams,
} from '@openshift-assisted/types/assisted-installer-service';

const getDay2ClusterDetailInitialValues = async (
  clusterId: Cluster['id'],
  day1CpuArchitecture: CpuArchitecture,
  pullSecret?: string,
  name?: string,
  openshiftVersion?: string,
): Promise<Day2ClusterDetailValues | Error> => {
  try {
    const infraEnv = await InfraEnvsService.getInfraEnv(clusterId, day1CpuArchitecture);
    if (infraEnv && !(infraEnv instanceof Error)) {
      return {
        cpuArchitecture: day1CpuArchitecture as SupportedCpuArchitecture,
        hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
          ? HostsNetworkConfigurationType.STATIC
          : HostsNetworkConfigurationType.DHCP,
      };
    } else {
      //Create a new InfraEnv because is not found
      if (pullSecret) {
        const infraEnv = await InfraEnvsService.create({
          name: InfraEnvsService.makeInfraEnvName(
            day1CpuArchitecture as ClusterCpuArchitecture,
            name,
          ),
          pullSecret,
          clusterId,
          openshiftVersion,
          cpuArchitecture: day1CpuArchitecture as InfraEnvCreateParams['cpuArchitecture'],
        });
        return {
          cpuArchitecture: day1CpuArchitecture as SupportedCpuArchitecture,
          hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
            ? HostsNetworkConfigurationType.STATIC
            : HostsNetworkConfigurationType.DHCP,
        };
      } else {
        return new Error('Could not get infraEnv for this cpu architecture');
      }
    }
  } catch (error) {
    handleApiError(error);
    return new Error('Could not get infraEnv for this cpu architecture');
  }
};

const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const {
    close,
    data: { cluster: day2Cluster },
  } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();
  const [initialValues, setInitialValues] = React.useState<Day2ClusterDetailValues | null>(null);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [isAlternativeCpuSelected, setIsAlternativeCpuSelected] = React.useState(false);
  const { getCpuArchitectures } = useOpenshiftVersions();
  const cpuArchitecturesByVersionImage = getCpuArchitectures(day2Cluster.openshiftVersion);
  const day1CpuArchitecture = mapClusterCpuArchToInfraEnvCpuArch(day2Cluster.cpuArchitecture);
  const [errorState, setErrorState] = React.useState<Error | null>(null);
  const pullSecret = usePullSecret();

  const cpuArchitectures = React.useMemo(
    () => getSupportedCpuArchitectures(cpuArchitecturesByVersionImage, day1CpuArchitecture),
    [cpuArchitecturesByVersionImage, day1CpuArchitecture],
  );
  React.useEffect(() => {
    const fetchAndSetInitialValues = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(
        day2Cluster.id,
        day1CpuArchitecture,
        pullSecret,
        day2Cluster.name,
        day2Cluster.openshiftVersion,
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (initialValues instanceof Error) {
        setErrorState(initialValues);
      } else {
        setInitialValues(initialValues);
      }
    };
    void fetchAndSetInitialValues();
  }, [
    day2Cluster.id,
    day1CpuArchitecture,
    pullSecret,
    day2Cluster.name,
    day2Cluster.openshiftVersion,
  ]);

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

  const changeCpuArchitectureDropdownAsync = React.useCallback(
    async (value: string, initialValues: Day2ClusterDetailValues) => {
      if (pullSecret === undefined) {
        setErrorState(new Error('Pull secret is missing'));
      } else {
        if (value !== initialValues.cpuArchitecture) {
          //Fetch infraEnv by clusterId and cpu architecture
          let infraEnv: InfraEnv | Error;
          try {
            infraEnv = await InfraEnvsService.getInfraEnv(
              day2Cluster.id,
              value as SupportedCpuArchitecture,
            );
            if (!infraEnv || infraEnv instanceof Error) {
              try {
                infraEnv = await InfraEnvsService.create({
                  name: InfraEnvsService.makeInfraEnvName(
                    value as ClusterCpuArchitecture,
                    day2Cluster.name,
                  ),
                  pullSecret,
                  clusterId: day2Cluster.id,
                  openshiftVersion: day2Cluster.openshiftVersion,
                  cpuArchitecture: value as InfraEnvCreateParams['cpuArchitecture'],
                });
              } catch {
                setErrorState(new Error('Could not get infraEnv for this cpu architecture'));
              }
            }
          } catch {
            setErrorState(new Error('Could not get infraEnv for this cpu architecture'));
          }
        }
      }
      setIsAlternativeCpuSelected(value !== initialValues.cpuArchitecture);
    },
    [day2Cluster.id, day2Cluster.name, day2Cluster.openshiftVersion, pullSecret],
  );
  const handleChangeCpuArchitectureDropdown = React.useCallback(
    (value: string, initialValues: Day2ClusterDetailValues) =>
      void changeCpuArchitectureDropdownAsync(value, initialValues),
    [changeCpuArchitectureDropdownAsync],
  );

  if (initialValues === null) {
    return <LoadingState />;
  } else if (errorState !== null) {
    return <ErrorState content={errorState.message} />;
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
                    onChange={(value) => handleChangeCpuArchitectureDropdown(value, initialValues)}
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
