import React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import {
  allClusterWizardSoftValidationIds,
  ClusterWizardStepsType,
  wizardStepsValidationsMap,
} from '../clusterWizard/wizardTransition';
import {
  Cluster,
  DetailList,
  DetailItem,
  VSPHERE_CONFIG_LINK,
  ReviewHostsInventory,
  ClusterValidations,
  HostsValidations,
} from '../../../common';
import { isSingleStack, RenderIf } from '../../../common/components/ui/';
import { wizardStepNames } from '../clusterWizard/constants';
import './ReviewCluster.css';

const PlatformIntegrationNote: React.FC<{}> = () => {
  return (
    <p>
      <ExclamationTriangleIcon color={warningColor.value} size="sm" /> You will need to modify your
      platform configuration after cluster installation is completed.{' '}
      <a
        href={VSPHERE_CONFIG_LINK}
        target="_blank"
        rel="noopener noreferrer"
        data-ouia-component-id="vm-integration-kb-page"
      >
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
        title={'Stack type'}
        value={
          isSingleStack(cluster.machineNetworks, cluster.clusterNetworks, cluster.serviceNetworks)
            ? 'Single-stack'
            : 'Dual-stack'
        }
      />
      <DetailItem
        title="CPU architecture"
        value={cluster.cpuArchitecture}
        testId="cpu-architecture"
      />
      <DetailItem
        title="Cluster network CIDR"
        value={
          <>
            {cluster.machineNetworks?.map((network, index) => (
              <span key={index}>
                {network.cidr}
                <br />
              </span>
            ))}
          </>
        }
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
