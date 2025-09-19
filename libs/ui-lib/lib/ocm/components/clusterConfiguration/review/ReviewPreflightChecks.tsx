import React from 'react';
import {
  Divider,
  ExpandableSection,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  gridSpans,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { t_global_color_status_info_100 as infoColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_info_100';
import {
  ClusterValidations,
  DetailItem,
  DetailList,
  HostsValidations,
  UiIcon,
} from '../../../../common';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';
import { useOpenShiftVersionsContext } from '../../clusterWizard/OpenShiftVersionsContext';
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
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { stringToJSON } from '../../../../common/utils';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

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
        classNameValue={'pf-v6-u-mb-md'}
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
        classNameValue={'pf-v6-u-mb-md'}
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
      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem style={{ display: 'flex', alignItems: 'center' }}>{icon}</FlexItem>
        <FlexItem style={{ display: 'flex', alignItems: 'center' }}>
          <b>{title}</b>
        </FlexItem>
      </Flex>
    </GridItem>
  );
};

const getCheckIcon = (validationStatuses: string[]) => {
  if (validationStatuses.includes('failure') || validationStatuses.includes('error')) {
    return <UiIcon size="sm" status="danger" icon={<ExclamationCircleIcon />} />;
  } else if (validationStatuses.includes('warning')) {
    return <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />;
  } else if (validationStatuses.includes('pending')) {
    return <UiIcon size="sm" status="info" icon={<InfoCircleIcon />} />;
  }
  return <UiIcon size="sm" icon={<CheckCircleIcon color={okColor.value} />} />;
};

const PreflightChecksDetailCollapsed = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const featureSupportLevelData = useNewFeatureSupportLevel();
  const { isSupportedOpenShiftVersion } = useOpenShiftVersionsContext();

  const { isFullySupported } = React.useMemo<SupportLevelMemo>(
    () => getSupportLevelInfo(cluster, featureSupportLevelData, isSupportedOpenShiftVersion, t),
    [cluster, featureSupportLevelData, t, isSupportedOpenShiftVersion],
  );

  const supportLevelIcon = isFullySupported ? (
    <UiIcon size="sm" icon={<CheckCircleIcon color={okColor.value} />} />
  ) : (
    <UiIcon size="sm" icon={<InfoCircleIcon color={infoColor.value} />} />
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
        span={3}
      />
      <PreflightCheckInfo
        title="Host preflight checks"
        icon={getCheckIcon(hostValidations)}
        span={3}
      />
      <PreflightCheckInfo
        title={`Cluster support level: ${isFullySupported ? 'Full' : 'Limited'}`}
        icon={supportLevelIcon}
        span={3}
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
        data-testid="review-preflight-checks-main"
      >
        <PreflightChecksDetailExpanded cluster={cluster} />
      </ExpandableSection>
      <Divider />
    </>
  );
};

export default ReviewPreflightChecks;
