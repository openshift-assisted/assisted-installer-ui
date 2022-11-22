import React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import {
  allClusterWizardSoftValidationIds,
  ClusterWizardStepsType,
  wizardStepsValidationsMap,
} from '../clusterWizard/wizardTransition';
import {
  Cluster,
  DetailList,
  DetailItem,
  RenderIf,
  ReviewHostsInventory,
  ClusterValidations,
  HostsValidations,
  isDualStack,
  isClusterPlatformTypeVM,
  PlatformType,
} from '../../../common';
import { wizardStepNames } from '../clusterWizard/constants';
import './ReviewCluster.css';
import OpenShiftVersionDetail from '../clusterDetail/OpenShiftVersionDetail';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { integrationPlatformLinks } from '../clusterWizard/ClusterPlatformIntegrationHint';

const PlatformIntegrationNote = ({ platformType }: { platformType: PlatformType | undefined }) => {
  const integrationPlatformLink: string = platformType
    ? (integrationPlatformLinks[platformType] as string)
    : '';

  return (
    <p>
      <ExclamationTriangleIcon color={warningColor.value} size="sm" /> You will need to modify your
      platform configuration after cluster installation is completed.{' '}
      <a
        href={integrationPlatformLink}
        target="_blank"
        rel="noopener noreferrer"
        data-ouia-component-id="vm-integration-kb-page"
      >
        Learn more <i className="fas fa-external-link-alt" />
      </a>
    </p>
  );
};

const ReviewCluster = ({ cluster }: { cluster: Cluster }) => {
  const clusterWizardContext = useClusterWizardContext();
  const { t } = useTranslation();
  return (
    <DetailList>
      <DetailItem
        title="Cluster address"
        value={`${cluster.name || ''}.${cluster.baseDnsDomain || ''}`}
        testId="cluster-address"
      />
      <OpenShiftVersionDetail cluster={cluster} />
      <DetailItem
        title={t('ai:Stack type')}
        value={isDualStack(cluster) ? 'Dual-stack' : 'IPv4'}
        testId="stack-type"
      />
      <DetailItem
        title="CPU architecture"
        value={cluster.cpuArchitecture}
        testId="cpu-architecture"
      />
      {cluster.machineNetworks?.length && (
        <DetailItem
          title="Cluster network CIDR"
          value={
            <>
              {cluster.clusterNetworks?.map((network) => (
                <span key={network.cidr}>
                  {network.cidr}
                  <br />
                </span>
              ))}
            </>
          }
          testId="network-cidr"
        />
      )}
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
            setCurrentStepId={(stepId) => clusterWizardContext.setCurrentStepId(stepId)}
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
            setCurrentStepId={(stepId) => clusterWizardContext.setCurrentStepId(stepId)}
            wizardStepNames={wizardStepNames}
            allClusterWizardSoftValidationIds={allClusterWizardSoftValidationIds}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />
        }
        testId="host-validations"
      />
      <RenderIf condition={isClusterPlatformTypeVM(cluster)}>
        <DetailItem
          title="Platform integration"
          value={<PlatformIntegrationNote platformType={cluster.platform?.type} />}
          testId="platform-integration"
        />
      </RenderIf>
      <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
    </DetailList>
  );
};

export default ReviewCluster;
