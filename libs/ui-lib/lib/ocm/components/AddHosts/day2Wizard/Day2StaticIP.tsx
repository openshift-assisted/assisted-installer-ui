import React from 'react';
import {
  Grid,
  Content,
  ContentVariants,
  PageSection,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { ClusterWizardStep, ErrorState, LoadingState } from '../../../../common';
import { HostsNetworkConfigurationType, InfraEnvsService } from '../../../services';
import { FormViewHosts } from '../../clusterConfiguration/staticIp/components/FormViewHosts/FormViewHosts';
import { FormViewNetworkWide } from '../../clusterConfiguration/staticIp/components/FormViewNetworkWide/FormViewNetworkWide';
import {
  StaticIpFormState,
  StaticIpViewProps,
} from '../../clusterConfiguration/staticIp/components/propTypes';
import StaticIpViewRadioGroup from '../../clusterConfiguration/staticIp/components/StaticIpViewRadioGroup';
import { YamlView } from '../../clusterConfiguration/staticIp/components/YamlView/YamlView';
import { StaticIpInfo, StaticIpView } from '../../clusterConfiguration/staticIp/data/dataTypes';
import { getStaticIpInfo } from '../../clusterConfiguration/staticIp/data/fromInfraEnv';
import { getDummyStaticIpInfo } from '../../clusterConfiguration/staticIp/data/dummyData';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import Day2WizardFooter from './Day2WizardFooter';
import {
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';

const Day2StaticIP = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const wizardContext = useDay2WizardContext();
  const [infraEnv, setInfraEnv] = React.useState<InfraEnv | undefined>(undefined);
  const [hasLoadError, setHasLoadError] = React.useState<boolean>(false);
  const [confirmOnChangeView, setConfirmOnChangeView] = React.useState<boolean>(false);
  const [viewChanged, setViewChanged] = React.useState<boolean>(false);
  const [initialStaticIpInfo, setInitialStaticIpInfo] = React.useState<StaticIpInfo>(
    getDummyStaticIpInfo(),
  );
  const [formState, setFormState] = React.useState<StaticIpFormState>();
  const {
    data: { cluster },
  } = day2DiscoveryImageDialog;

  const selectedArchitecture = wizardContext.selectedCpuArchitecture;

  const restartWizard = React.useCallback(() => {
    wizardContext.setCurrentStepId('cluster-details');
    wizardContext.onUpdateHostNetworkConfigType(HostsNetworkConfigurationType.DHCP);
  }, [wizardContext]);

  React.useEffect(() => {
    const setCurrentStaticConfig = async () => {
      let infraEnv;
      try {
        infraEnv = await InfraEnvsService.getInfraEnv(cluster.id, selectedArchitecture);
      } catch (e) {
        setHasLoadError(true);
        setInfraEnv(undefined);
        return;
      }
      if (infraEnv && !(infraEnv instanceof Error)) {
        if (!infraEnv.staticNetworkConfig) {
          // Make sure the infraEnv we store in the state has staticIP config
          // This is required to be able to reuse the StaticIP services
          infraEnv = await InfraEnvsService.setDummyStaticConfigToInfraEnv(infraEnv.id);
        }
        const staticIpInfo = getStaticIpInfo(infraEnv);
        if (staticIpInfo) {
          setInfraEnv(infraEnv);
          setInitialStaticIpInfo(staticIpInfo);
        } else {
          setHasLoadError(true);
        }
      } else {
        setHasLoadError(true);
        setInfraEnv(undefined);
        return;
      }
    };
    void setCurrentStaticConfig();
  }, [cluster.id, selectedArchitecture]);

  const onChangeView = React.useCallback((view: StaticIpView) => {
    wizardContext.onUpdateStaticIpView(view);
    setViewChanged(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasLoadError) {
    return (
      <PageSection hasBodyWrapper={false}  isFilled>
        <ErrorState
          title="Cannot load the Static IP configuration for this cluster"
          content="For non-multi-architecture clusters, make sure you select the Day1 cpu architecture"
          actions={[
            <Button key="restart-wizard" variant={ButtonVariant.primary} onClick={restartWizard}>
              Back to Wizard
            </Button>,
          ]}
        />
      </PageSection>
    );
  } else if (!infraEnv) {
    // It's still loading
    return <LoadingState />;
  }

  const onFormStateChange = (formState: StaticIpFormState) => {
    const hasFilledData =
      wizardContext.currentStepId === 'static-ip-host-configurations' || !formState.isEmpty;
    setConfirmOnChangeView(hasFilledData);
    setFormState(formState);
  };

  const viewProps: StaticIpViewProps = {
    infraEnv,
    onFormStateChange,
    updateInfraEnv: async (updateParams: InfraEnvUpdateParams) => {
      const updatedInfraEnv = await InfraEnvsService.syncStaticIpConfigs(
        cluster.id,
        infraEnv.id,
        updateParams.staticNetworkConfig!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      );
      setInfraEnv(updatedInfraEnv);
      return updatedInfraEnv;
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
        <Day2WizardFooter
          isSubmitting={formState?.isSubmitting || false}
          isNextDisabled={!formState?.isValid || formState.isAutoSaveRunning}
          onCancel={day2DiscoveryImageDialog.close}
        />
      }
    >
      <Grid hasGutter>
        <Content>
          <Content component={ContentVariants.h2}>Static network configurations</Content>
          <Content component={ContentVariants.small}>
            Network configuration can be done using either the form view or YAML view.
            Configurations done in this step are for discovering hosts.
          </Content>
        </Content>

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
