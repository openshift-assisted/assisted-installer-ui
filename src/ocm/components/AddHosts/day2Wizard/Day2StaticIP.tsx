import React from 'react';
import {
  Grid,
  TextContent,
  Text,
  TextVariants,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import {
  ClusterWizardStep,
  ErrorState,
  InfraEnv,
  InfraEnvUpdateParams,
  WizardFooter,
} from '../../../../common';
import useInfraEnv from '../../../hooks/useInfraEnv';
import { InfraEnvsService } from '../../../services';
import { FormViewHosts } from '../../clusterConfiguration/staticIp/components/FormViewHosts/FormViewHosts';
import { FormViewNetworkWide } from '../../clusterConfiguration/staticIp/components/FormViewNetworkWide/FormViewNetworkWide';
import {
  StaticIpFormState,
  StaticIpViewProps,
} from '../../clusterConfiguration/staticIp/components/propTypes';
import StaticIpViewRadioGroup from '../../clusterConfiguration/staticIp/components/StaticIpViewRadioGroup';
import { YamlView } from '../../clusterConfiguration/staticIp/components/YamlView/YamlView';
import { StaticIpInfo, StaticIpView } from '../../clusterConfiguration/staticIp/data/dataTypes';
import { getOrCreateStaticIpInfo } from '../../clusterConfiguration/staticIp/data/fromInfraEnv';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import { mapClusterCpuArchToInfraEnvCpuArch } from '../../../services/CpuArchitectureService';
import { getDummyInfraEnvField } from '../../clusterConfiguration/staticIp/data/dummyData';

const Day2StaticIP = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const wizardContext = useDay2WizardContext();
  const [infraEnv, setInfraEnv] = React.useState<InfraEnv>();
  const [confirmOnChangeView, setConfirmOnChangeView] = React.useState<boolean>(false);
  const [viewChanged, setViewChanged] = React.useState<boolean>(false);
  const [initialStaticIpInfo, setInitialStaticIpInfo] = React.useState<StaticIpInfo>();
  const [formState, setFormState] = React.useState<StaticIpFormState>();
  const { data, close } = day2DiscoveryImageDialog;
  const cluster = data.cluster;

  const day1CpuArchitecture = mapClusterCpuArchToInfraEnvCpuArch(cluster.cpuArchitecture);
  const { updateInfraEnv } = useInfraEnv(cluster.id, day1CpuArchitecture);

  React.useEffect(() => {
    const setCurrentStaticConfig = async () => {
      const { data: infraEnv } = await InfraEnvsService.getInfraEnv(
        cluster.id,
        day1CpuArchitecture,
      );

      if (infraEnv) {
        const fakeInfraEnv = {
          ...infraEnv,
          // TODO ADD THE DUMMY DATA IF IT DOESN'T HAVE IT YET SO WE CAN REUSE THE STATIC IP COMPONENTS that use the InfraEnv
          // staticNetworkConfig: getDummyInfraEnvField(),
        };
        setInfraEnv(fakeInfraEnv);
        setInitialStaticIpInfo(getOrCreateStaticIpInfo(infraEnv));
      } else {
        setInfraEnv(undefined);
      }
    };
    void setCurrentStaticConfig();
  }, [cluster.id, day1CpuArchitecture]);

  const onChangeView = React.useCallback((view: StaticIpView) => {
    wizardContext.onUpdateStaticIpView(view);
    setViewChanged(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialStaticIpInfo || !infraEnv) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState title="Cannot load the Static IP configuration for this cluster" />
      </PageSection>
    );
  }

  const onFormStateChange = (formState: StaticIpFormState) => {
    const hasFilledData =
      wizardContext.currentStepId === 'static-ip-host-configurations' || !formState.isEmpty;
    setConfirmOnChangeView(hasFilledData);
    setFormState(formState);
  };

  const viewProps: StaticIpViewProps = {
    onFormStateChange,
    infraEnv,
    updateInfraEnv: async (params: InfraEnvUpdateParams) => {
      const data = await updateInfraEnv(params);
      setInfraEnv(data);
      return data;
    },
    showEmptyValues: viewChanged,
  };

  const getContent = () => {
    if (initialStaticIpInfo.view === StaticIpView.YAML && !viewChanged) {
      return <YamlView {...viewProps} />;
    }
    switch (wizardContext.currentStepId) {
      case 'static-ip-yaml-view':
        return <YamlView {...viewProps} />;
      case 'static-ip-host-configurations':
        return <FormViewHosts {...viewProps} />;
      case 'static-ip-network-wide-configurations':
        return <FormViewNetworkWide {...viewProps} />;
      default:
        throw `Unexpected wizard step id ${wizardContext.currentStepId} when entering static ip page`;
    }
  };

  const content = getContent();
  if (!content) {
    return null;
  }

  return (
    <ClusterWizardStep
      navigation={<Day2WizardNav />}
      footer={
        <WizardFooter
          onNext={() => wizardContext.moveNext()}
          onBack={() => wizardContext.moveBack()}
          isNextDisabled={!formState?.isValid || formState.isAutoSaveRunning}
          onCancel={close}
          isSubmitting={formState?.isSubmitting}
        />
      }
    >
      <Grid hasGutter>
        <TextContent>
          <Text component={TextVariants.h2}>Static network configurations</Text>
          <Text component={TextVariants.small}>
            Network configuration can be done using either the form view or YAML view.
            Configurations done in this step are for discovering hosts.
          </Text>
        </TextContent>

        <StaticIpViewRadioGroup
          initialView={initialStaticIpInfo.view}
          confirmOnChangeView={confirmOnChangeView}
          onChangeView={onChangeView}
        />
        {content}
      </Grid>
    </ClusterWizardStep>
  );
};

export default Day2StaticIP;
