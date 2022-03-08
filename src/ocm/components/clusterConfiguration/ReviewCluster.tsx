import React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { Cluster, DetailList, DetailItem, ReviewHostsInventory } from '../../../common';
import { RenderIf } from '../../../common/components/ui/';
import { VSPHERE_CONFIG_LINK, ClusterValidations, HostsValidations } from '../../../common';
import { selectClusterNetworkCIDR } from '../../../common/selectors/clusterSelectors';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import {
  allClusterWizardSoftValidationIds,
  ClusterWizardStepsType,
  wizardStepsValidationsMap,
} from '../clusterWizard/wizardTransition';

import './ReviewCluster.css';
import { wizardStepNames } from '../clusterWizard/constants';

const PlatformIntegrationNote: React.FC<{}> = () => {
  return (
    <p>
      <ExclamationTriangleIcon color={warningColor.value} size="sm" /> You will need to modify your
      platform configuration after cluster installation is completed.{' '}
      <a href={VSPHERE_CONFIG_LINK} target="_blank" rel="noopener noreferrer">
        Learn more <i className="fas fa-external-link-alt" />
      </a>
    </p>
  );
};

const ReviewCluster: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  return (
    <DetailList>
      <DetailItem
        title="Cluster address"
        value={`${cluster.name}.${cluster.baseDnsDomain}`}
        testId="cluster-address"
      />
      <DetailItem
        title="OpenShift version"
        value={cluster.openshiftVersion}
        testId="openshift-version"
      />
      <DetailItem
        title="CPU architecture"
        value={cluster.cpuArchitecture}
        testId="cpu-architecture"
      />
      <DetailItem
        title="Management network CIDR"
        value={selectClusterNetworkCIDR(cluster)}
        testId="network-cidr"
      />
      <DetailItem
        title="Cluster summary"
        testId="cluster-summary"
        value={<ReviewHostsInventory hosts={cluster.hosts} />}
      />
      <DetailItem
        title="Cluster validations"
        value={
          <ClusterValidations<ClusterWizardStepsType>
            validationsInfo={cluster.validationsInfo}
            setCurrentStepId={setCurrentStepId}
            wizardStepNames={wizardStepNames}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />
        }
        testId="cluster-validations"
      />
      <DetailItem
        title="Host validations"
        value={
          <HostsValidations<ClusterWizardStepsType, typeof allClusterWizardSoftValidationIds>
            hosts={cluster.hosts}
            setCurrentStepId={setCurrentStepId}
            wizardStepNames={wizardStepNames}
            allClusterWizardSoftValidationIds={allClusterWizardSoftValidationIds}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />
        }
        testId="host-validations"
      />
      <RenderIf condition={cluster.platform?.type !== 'baremetal'}>
        <DetailItem
          title="Platform integration"
          value={<PlatformIntegrationNote />}
          testId="platform-integration"
        />
      </RenderIf>
      <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
    </DetailList>
  );
};

export default ReviewCluster;
