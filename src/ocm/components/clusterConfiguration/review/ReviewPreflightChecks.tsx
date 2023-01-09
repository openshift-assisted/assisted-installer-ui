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
  global_success_color_100 as okColor,
  global_info_color_100 as infoColor,
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';

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

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { ValidationsInfo as ClusterValidationsInfo } from '../../../../common/types/clusters';
import { ValidationsInfo as HostValidationsInfo } from '../../../../common/types/hosts';

const PreflightChecksDetailExpanded = ({ cluster }: { cluster: Cluster }) => {
  const clusterWizardContext = useClusterWizardContext();

  return (
    <DetailList>
      <DetailItem
        title="Cluster preflight checks"
        value={
          <ClusterValidations<ClusterWizardStepsType>
            validationsInfo={cluster.validationsInfo}
            setCurrentStepId={(stepId) => clusterWizardContext.setCurrentStepId(stepId)}
            wizardStepNames={wizardStepNames}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />
        }
        classNameValue={'pf-u-mb-md'}
        testId="cluster-preflight-checks"
      />
      <DetailItem
        title="Host preflight checks"
        value={
          <HostsValidations<ClusterWizardStepsType, typeof allClusterWizardSoftValidationIds>
            hosts={cluster.hosts}
            setCurrentStepId={(stepId) => clusterWizardContext.setCurrentStepId(stepId)}
            wizardStepNames={wizardStepNames}
            allClusterWizardSoftValidationIds={allClusterWizardSoftValidationIds}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />
        }
        classNameValue={'pf-u-mb-md'}
        testId="host-preflight-checks"
      />
      <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
    </DetailList>
  );
};

const PreflightCheckInfo = ({
  title,
  icon,
  span = 3,
  offset,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  span?: gridSpans;
  offset?: gridSpans;
  className?: string;
}) => {
  return (
    <GridItem span={span} offset={offset} className={className}>
      <Split hasGutter>
        <SplitItem>{icon}</SplitItem>
        <SplitItem>
          <b>{title}</b>
        </SplitItem>
      </Split>
    </GridItem>
  );
};

const getCheckIcon = (validationStatuses: string[]) => {
  if (validationStatuses.includes('failure') || validationStatuses.includes('error')) {
    return <ExclamationCircleIcon color={dangerColor.value} size="sm" />;
  } else if (validationStatuses.includes('warning')) {
    return <ExclamationTriangleIcon color={warningColor.value} />;
  } else if (validationStatuses.includes('pending')) {
    return <InfoCircleIcon size="sm" color={infoColor.value} />;
  }
  return <CheckCircleIcon color={okColor.value} />;
};

const PreflightChecksDetailCollapsed = ({ cluster }: { cluster: Cluster }) => {
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
      <PreflightCheckInfo
        title="Cluster preflight checks"
        icon={getCheckIcon(clusterValidations)}
      />
      <PreflightCheckInfo title="Host preflight checks" icon={getCheckIcon(hostValidations)} />
      <PreflightCheckInfo
        title={`Cluster support level: ${isFullySupported ? 'Full' : 'Limited'}`}
        icon={supportLevelIcon}
        span={4}
      />
    </>
  );
};

const ReviewPreflightChecks = ({ cluster }: { cluster: Cluster }) => {
  const [isChecksExpanded, setChecksExpanded] = React.useState(false);
  return (
    <>
      <Divider />

      <ExpandableSection
        toggleContent={
          <Grid>
            <GridItem span={2}>Preflight checks</GridItem>
            {!isChecksExpanded && <PreflightChecksDetailCollapsed cluster={cluster} />}
          </Grid>
        }
        isIndented
        isExpanded={isChecksExpanded}
        onToggle={() => setChecksExpanded(!isChecksExpanded)}
        className={'review-expandable'}
      >
        <PreflightChecksDetailExpanded cluster={cluster} />
      </ExpandableSection>
      <Divider />
    </>
  );
};

export default ReviewPreflightChecks;
