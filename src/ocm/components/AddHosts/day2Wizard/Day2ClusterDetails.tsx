import { Grid, GridItem } from '@patternfly/react-core';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import {
  ClusterWizardStep,
  ClusterWizardStepHeader,
  CpuArchitecture,
  WizardFooter,
  Cluster,
  LoadingState,
  InfraEnvUpdateParams,
} from '../../../../common';
import { HostsNetworkConfigurationType, InfraEnvsService } from '../../../services';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';
import DiscoverImageCpuArchitectureControlGroup from '../../../../common/components/clusterConfiguration/DiscoveryImageCpuArchitectureControlGroup';
import { useOpenshiftVersions } from '../../../hooks';
import { handleApiError } from '../../../api';
import { getDummyInfraEnvField } from '../../clusterConfiguration/staticIp/data/dummyData';
import { InfraEnvsAPI } from '../../../services/apis';
import Day2HostConfigurations from './Day2StaticIpHostConfigurations';
import { Day2ClusterDetailValues } from '../types';

const getDay2ClusterDetailInitialValues = async (
  clusterId: Cluster['id'],
  day1CpuArchitecture: CpuArchitecture,
) => {
  try {
    const { data: infraEnv } = await InfraEnvsService.getInfraEnv(clusterId, day1CpuArchitecture);

    return {
      cpuArchitecture: day1CpuArchitecture || CpuArchitecture.x86,
      hostsNetworkConfigurationType: infraEnv.staticNetworkConfig
        ? HostsNetworkConfigurationType.STATIC
        : HostsNetworkConfigurationType.DHCP,
    };
  } catch (error) {
    handleApiError(error);
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
  const [isSubmitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const doItAsync = async () => {
      const initialValues = await getDay2ClusterDetailInitialValues(
        cluster.id,
        day1CpuArchitecture,
      );
      setInitialValues(initialValues);
    };
    void doItAsync();
  }, [cluster.id, day1CpuArchitecture]);

  const handleSubmit = React.useCallback(
    async (values: Day2ClusterDetailValues) => {
      try {
        setSubmitting(true);
        const { data: infraEnvs } = await InfraEnvsAPI.list(cluster.id);
        const staticIPSet = infraEnvs.every((infraEnv) => infraEnv.staticNetworkConfig);

        const infraEnvUpdateParams: InfraEnvUpdateParams = {
          staticNetworkConfig:
            values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC
              ? getDummyInfraEnvField()
              : [],
        };

        if (
          !(
            values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC &&
            staticIPSet
          )
        ) {
          await InfraEnvsService.updateAll(cluster.id, infraEnvUpdateParams);
        }

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
