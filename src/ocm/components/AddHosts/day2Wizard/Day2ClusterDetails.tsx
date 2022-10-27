import { Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik } from 'formik';
import React from 'react';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  WizardFooter,
  Cluster,
  LoadingState,
} from '../../../../common';
import DiscoverImageCpuArchitectureControlGroup from '../../../../common/components/clusterConfiguration/DiscoveryImageCpuArchitectureControlGroup';
import { HostsNetworkConfigurationType, InfraEnvsService } from '../../../services';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useOpenshiftVersions } from '../../../hooks';
import { handleApiError } from '../../../api';
import { Day2ClusterDetailValues } from '../types';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import Day2HostStaticIpConfigurations from './Day2StaticIpHostConfigurations';

const getDay2ClusterDetailInitialValues = async (
  clusterId: Cluster['id'],
  day1CpuArchitecture: CpuArchitecture,
) => {
  try {
    // TODO celia does not query
    const { data: infraEnv } = await InfraEnvsService.getInfraEnv(clusterId, day1CpuArchitecture);

    return {
      cpuArchitecture: day1CpuArchitecture,
      hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
        ? HostsNetworkConfigurationType.STATIC
        : HostsNetworkConfigurationType.DHCP,
    };
  } catch (error) {
    handleApiError(error);
  }
};

const Day2ClusterDetails = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const {
    close,
    data: { cluster },
  } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();
  const { isMultiCpuArchSupported } = useOpenshiftVersions();
  const [initialValues, setInitialValues] = React.useState<Day2ClusterDetailValues>();
  const [isSubmitting, setSubmitting] = React.useState(false);

  const isMultiArch = isMultiCpuArchSupported(cluster.openshiftVersion);
  const day1CpuArchitecture = cluster.cpuArchitecture as CpuArchitecture;

  React.useEffect(() => {
    const fetchAndSetInitialValues = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(
        cluster.id,
        day1CpuArchitecture,
      );
      setInitialValues(initialValues);
    };
    void fetchAndSetInitialValues();
  }, [cluster.id, day1CpuArchitecture]);

  const handleSubmit = React.useCallback(
    async (values: Day2ClusterDetailValues) => {
      try {
        setSubmitting(true);
        await InfraEnvsService.syncDhcpOrStaticIpConfigs(
          cluster.id,
          values.hostsNetworkConfigurationType,
        );

        wizardContext.setSelectedCpuArchitecture(values.cpuArchitecture);
        wizardContext.moveNext();
      } catch (error) {
        handleApiError(error);
      } finally {
        setSubmitting(false);
      }
    },
    [cluster.id, wizardContext],
  );

  if (!initialValues) {
    return <LoadingState />;
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
                    isMultiArchitecture={isMultiArch}
                    day1CpuArchitecture={day1CpuArchitecture}
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
