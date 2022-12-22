import React from 'react';
import {
  Divider,
  ExpandableSection,
  Grid,
  GridItem,
  gridSpans,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import {
  Cluster,
  ClusterValidations,
  DetailItem,
  DetailList,
  HostsValidations,
  stringToJSON,
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
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

import { ValidationsInfo as ClusterValidationsInfo } from '../../../../common/types/clusters';
import { ValidationsInfo as HostValidationsInfo } from '../../../../common/types/hosts';

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

const ValidationsInfo = ({
  title,
  icon,
  span = 3,
}: {
  title: string;
  icon: React.ReactNode;
  span?: gridSpans;
}) => {
  return (
    <GridItem span={span}>
      <Split hasGutter>
        <SplitItem>{icon}</SplitItem>
        <SplitItem>
          <b>{title}</b>
        </SplitItem>
      </Split>
    </GridItem>
  );
};

const getValidationsIcon = (validationStatuses: string[]) => {
  if (validationStatuses.includes('failure') || validationStatuses.includes('error')) {
    return <ExclamationCircleIcon color={dangerColor.value} size="sm" />;
  } else if (validationStatuses.includes('warning')) {
    return <ExclamationTriangleIcon color={warningColor.value} />;
  } else if (validationStatuses.includes('pending')) {
    return <InfoCircleIcon size="sm" color={infoColor.value} />;
  }
  return <CheckCircleIcon color={okColor.value} />;
};

const ValidationsDetailCollapsed = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const featureSupportLevelData = useFeatureSupportLevel();
  const { isSupportedOpenShiftVersion } = useOpenshiftVersions();

  const { isFullySupported } = React.useMemo<SupportLevelMemo>(
    () => getSupportLevelInfo(cluster, featureSupportLevelData, isSupportedOpenShiftVersion, t),
    [cluster, featureSupportLevelData, t, isSupportedOpenShiftVersion],
  );

  const supportLevelIcon = isFullySupported ? (
    <CheckCircleIcon color={okColor.value} />
  ) : (
    <InfoCircleIcon size="sm" color={infoColor.value} />
  );

  const clusterValidations = React.useMemo(
    () =>
      Object.values(stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo) || {})
        .flat()
        .map((val) => val?.status || '')
        .filter(Boolean),
    [cluster.validationsInfo],
  );

  const hostValidations = React.useMemo(() => {
    const hostValidations = cluster.hosts
      ?.map((host) => Object.values(stringToJSON<HostValidationsInfo>(host.validationsInfo) || {}))
      .flat(2);

    return (
      hostValidations?.map((val) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        allClusterWizardSoftValidationIds.includes(val?.id || '') && val?.status !== 'success'
          ? 'warning'
          : val?.status || '',
      ) || []
    );
  }, [cluster.hosts]);

  return (
    <>
      <ValidationsInfo title="Cluster validations" icon={getValidationsIcon(clusterValidations)} />
      <ValidationsInfo title="Host validations" icon={getValidationsIcon(hostValidations)} />
      <ValidationsInfo
        title={`Cluster support level: ${isFullySupported ? 'Full' : 'Limited'}`}
        icon={supportLevelIcon}
        span={4}
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
            <GridItem span={2}>Validations</GridItem>
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
