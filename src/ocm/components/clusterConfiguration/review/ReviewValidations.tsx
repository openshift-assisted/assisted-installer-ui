import React from 'react';
import {
  Divider,
  ExpandableSection,
  Grid,
  GridItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { CheckCircleIcon, InfoCircleIcon } from '@patternfly/react-icons';
import {
  Cluster,
  ClusterValidations,
  DetailItem,
  DetailList,
  HostsValidations,
  useFeatureSupportLevel,
} from '../../../../common';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';
import { useOpenshiftVersions } from '../../../hooks';
import { wizardStepNames } from '../../clusterWizard/constants';
import {
  ClusterWizardStepsType,
  wizardStepsValidationsMap,
  allClusterWizardSoftValidationIds,
} from '../../clusterWizard/wizardTransition';
import { ClusterFeatureSupportLevelsDetailItem } from '../../featureSupportLevels';
import {
  SupportLevelMemo,
  getSupportLevelInfo,
} from '../../featureSupportLevels/ReviewClusterFeatureSupportLevels';
import {
  global_success_color_100 as okColor,
  global_info_color_100 as infoColor,
} from '@patternfly/react-tokens';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

const ValidationsDetailExpanded = ({ cluster }: { cluster: Cluster }) => {
  const clusterWizardContext = useClusterWizardContext();

  return (
    <DetailList>
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
      <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
    </DetailList>
  );
};

const ValidationsInfo = ({ title, icon }: { title: string; icon: unknown }) => {
  return (
    <GridItem span={3}>
      <Split hasGutter>
        <SplitItem>{icon}</SplitItem>
        <SplitItem>
          <b>{title}</b>
        </SplitItem>
      </Split>
    </GridItem>
  );
};

const ValidationsDetailCollapsed = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const featureSupportLevelData = useFeatureSupportLevel();
  const { isSupportedOpenShiftVersion } = useOpenshiftVersions();

  const { isFullySupported } = React.useMemo<SupportLevelMemo>(
    () => getSupportLevelInfo(cluster, featureSupportLevelData, isSupportedOpenShiftVersion, t),
    [cluster, featureSupportLevelData, t, isSupportedOpenShiftVersion],
  );

  const allClusterValidationsPassed = false;

  return (
    <>
      <ValidationsInfo
        title="Cluster validations"
        icon={
          allClusterValidationsPassed ? (
            <CheckCircleIcon color={okColor.value} />
          ) : (
            <InfoCircleIcon size="sm" color={infoColor.value} />
          )
        }
      />
      <ValidationsInfo title="Host validations" icon={<CheckCircleIcon color={okColor.value} />} />
      <ValidationsInfo
        title={`Cluster support level: ${isFullySupported ? 'Full' : 'Limited'}`}
        icon={
          isFullySupported ? (
            <CheckCircleIcon color={okColor.value} />
          ) : (
            <InfoCircleIcon size="sm" color={infoColor.value} />
          )
        }
      />
    </>
  );
};

export const ReviewValidations = ({ cluster }: { cluster: Cluster }) => {
  const [isValidationsExpanded, setValidationsExpanded] = React.useState(false);
  return (
    <>
      <Divider />

      <ExpandableSection
        toggleContent={
          <Grid>
            <GridItem span={3}>Validations</GridItem>
            {!isValidationsExpanded && <ValidationsDetailCollapsed cluster={cluster} />}
          </Grid>
        }
        isIndented
        isExpanded={isValidationsExpanded}
        onToggle={() => setValidationsExpanded(!isValidationsExpanded)}
        className={'review-expandable'}
      >
        <ValidationsDetailExpanded cluster={cluster} />
      </ExpandableSection>
      <Divider />
    </>
  );
};
