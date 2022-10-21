import { Grid, TextContent, Text, TextVariants } from '@patternfly/react-core';
import React from 'react';
import { ClusterWizardStep, WizardFooter } from '../../../../common';
import useInfraEnv from '../../../hooks/useInfraEnv';
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
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';

export const Day2StaticIP = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { data } = day2DiscoveryImageDialog;
  const cluster = data.cluster;
  const { infraEnv } = useInfraEnv(cluster.id);

  const { close } = day2DiscoveryImageDialog;
  const wizardContext = useDay2WizardContext();

  const [confirmOnChangeView, setConfirmOnChangeView] = React.useState<boolean>(false);
  const [viewChanged, setViewChanged] = React.useState<boolean>(false);

  const onChangeView = React.useCallback((view: StaticIpView) => {
    wizardContext.onUpdateStaticIpView(view);
    setViewChanged(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialStaticIpInfo = React.useMemo<StaticIpInfo | undefined>(() => {
    return infraEnv && getStaticIpInfo(infraEnv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialStaticIpInfo || !infraEnv) {
    console.log('no', initialStaticIpInfo, infraEnv);
    return null;
  }

  const onFormStateChange = (formState: StaticIpFormState) => {
    const hasFilledData =
      wizardContext.currentStepId === 'static-ip-host-configurations' || !formState.isEmpty;
    setConfirmOnChangeView(hasFilledData);
    onFormStateChange(formState);
  };

  const viewProps: StaticIpViewProps = {
    onFormStateChange,
    infraEnv,
    updateInfraEnv: () => new Promise(() => console.log('update infra Env')),
    showEmptyValues: viewChanged,
  };

  const getContent = () => {
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
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onNext={() => wizardContext.moveNext()}
          onBack={() => wizardContext.moveBack()}
          isBackDisabled={wizardContext.currentStepId === 'cluster-details'}
          isNextDisabled={wizardContext.currentStepId === 'download-iso'}
          onCancel={close}
        />
      }
    >
      {
        <Grid hasGutter>
          <TextContent>
            <Text component={TextVariants.h2}>Static network configurations</Text>
            <Text component={TextVariants.small}>
              Network configuration can be done using either the form view or YAML view.
              Configurations done in this step are for discovering hosts.
            </Text>
          </TextContent>

          <StaticIpViewRadioGroup
            initialView={'form' as StaticIpView}
            confirmOnChangeView={confirmOnChangeView}
            onChangeView={onChangeView}
          />
          {content}
        </Grid>
      }
    </ClusterWizardStep>
  );
};
