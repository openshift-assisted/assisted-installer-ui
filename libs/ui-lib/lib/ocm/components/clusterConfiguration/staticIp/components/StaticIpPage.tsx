import React from 'react';
import { Content, ContentVariants, Alert, AlertVariant, Grid } from '@patternfly/react-core';
import { StaticIpInfo, StaticIpView } from '../data/dataTypes';
import StaticIpViewRadioGroup from './StaticIpViewRadioGroup';
import { getStaticIpInfo } from '../data/fromInfraEnv';
import { StaticIpFormState, StaticIpPageProps, StaticIpViewProps } from './propTypes';
import { YamlView } from './YamlView/YamlView';
import { useClusterWizardContext } from '../../../clusterWizard/ClusterWizardContext';
import { FormViewHosts } from './FormViewHosts/FormViewHosts';
import { FormViewNetworkWide } from './FormViewNetworkWide/FormViewNetworkWide';
import './staticIp.css';

const isoRegenerationAlert = (
  <Alert
    variant={AlertVariant.warning}
    isInline={true}
    data-testid="regenerate-iso-alert"
    title="To add new hosts that will use the new or edited configurations, you'll need to regenerate the
  Discovery ISO in the 'Host discovery' step and boot your new hosts from it."
  />
);

export const StaticIpPage: React.FC<StaticIpPageProps> = ({
  infraEnv,
  updateInfraEnv,
  onFormStateChange: onFormStateChangeParent,
}) => {
  const clusterWizardContext = useClusterWizardContext();
  const [confirmOnChangeView, setConfirmOnChangeView] = React.useState<boolean>(false);
  const [viewChanged, setViewChanged] = React.useState<boolean>(false);

  const onChangeView = React.useCallback(
    (view: StaticIpView) => {
      clusterWizardContext.onUpdateStaticIpView(view);
      setViewChanged(true);
    },
    [clusterWizardContext],
  );

  const initialStaticIpInfo = React.useMemo<StaticIpInfo | undefined>(() => {
    return getStaticIpInfo(infraEnv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!initialStaticIpInfo) {
    return null;
  }
  const onFormStateChange = (formState: StaticIpFormState) => {
    const hasFilledData =
      clusterWizardContext.currentStepId === 'static-ip-host-configurations' || !formState.isEmpty;
    setConfirmOnChangeView(hasFilledData);
    onFormStateChangeParent(formState);
  };

  const viewProps: StaticIpViewProps = {
    onFormStateChange,
    infraEnv,
    updateInfraEnv,
    showEmptyValues: viewChanged,
  };

  const getContent = () => {
    switch (clusterWizardContext.currentStepId) {
      case 'static-ip-yaml-view':
        return <YamlView {...viewProps} />;
      case 'static-ip-network-wide-configurations':
        return <FormViewNetworkWide {...viewProps} />;
      case 'static-ip-host-configurations':
        return <FormViewHosts {...viewProps} />;
      default:
        throw `Unexpected wizard step id ${clusterWizardContext.currentStepId} when entering static ip page`;
    }
  };

  const content = getContent();
  if (!content) {
    return null;
  }
  return (
    <Grid hasGutter>
      <Content>
        <Content component={ContentVariants.h2}>Static network configurations</Content>
        <Content component={ContentVariants.small}>
          Network configuration can be done using either the form view or YAML view. Configurations
          done in this step are for discovering hosts.
        </Content>
      </Content>

      {clusterWizardContext.currentStepId === 'static-ip-network-wide-configurations' && (
        <StaticIpViewRadioGroup
          initialView={initialStaticIpInfo.view}
          confirmOnChangeView={confirmOnChangeView}
          onChangeView={onChangeView}
        />
      )}
      {initialStaticIpInfo.isDataComplete && isoRegenerationAlert}
      {content}
    </Grid>
  );
};
