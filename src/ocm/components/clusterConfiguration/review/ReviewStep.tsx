import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionListItem, Button, ButtonVariant, Grid, GridItem } from '@patternfly/react-core';
import {
  Cluster,
  ClusterWizardStepHeader,
  useAlerts,
  ClusterWizardStep,
  ErrorState,
  useFeatureSupportLevel,
} from '../../../../common';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';
import { getApiErrorMessage, handleApiError } from '../../../api';
import { updateCluster } from '../../../reducers/clusters';
import ClusterWizardFooter from '../../clusterWizard/ClusterWizardFooter';
import ClusterWizardNavigation from '../../clusterWizard/ClusterWizardNavigation';
import { ClustersService } from '../../../services';
import { useStateSafely } from '../../../../common/hooks';
import { selectCurrentClusterPermissionsState } from '../../../selectors';
import ReviewPreflightChecks from './ReviewPreflightChecks';
import ReviewSummary from './ReviewSummary';
import { getLimitedFeatureSupportLevels } from '../../../../common/components/featureSupportLevels/utils';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

import './ReviewCluster.css';

const ReviewStep = ({ cluster }: { cluster: Cluster }) => {
  const { addAlert } = useAlerts();
  const clusterWizardContext = useClusterWizardContext();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const [isStartingInstallation, setIsStartingInstallation] = useStateSafely(false);
  const featureSupportLevelData = useFeatureSupportLevel();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const hasSupportLevel = React.useMemo<boolean>(() => {
    try {
      getLimitedFeatureSupportLevels(cluster, featureSupportLevelData, t);
      return true;
    } catch (e) {
      return false;
    }
  }, [cluster, featureSupportLevelData, t]);

  const handleClusterInstall = async () => {
    setIsStartingInstallation(true);
    try {
      const { data } = await ClustersService.install(cluster.id, cluster.tags);
      dispatch(updateCluster(data));
      setIsStartingInstallation(false);
      // If successful, backend changes cluster state which leads to unmounting the Wizard
      // If validation fails, the wizard stays on this step and shows alerts
    } catch (e) {
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to start cluster installation',
          message: getApiErrorMessage(e),
        }),
      );
      setIsStartingInstallation(false);
    }
  };

  if (!hasSupportLevel) {
    return (
      <ErrorState
        title={'Feature support levels not available'}
        content={`OpenShift version ${
          cluster.openshiftVersion || ''
        } does not currently include feature support levels.`}
      />
    );
  }

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      onBack={() => clusterWizardContext.moveBack()}
      isSubmitting={isStartingInstallation}
      submittingText="Starting installation..."
      additionalActions={
        <ActionListItem>
          <Button
            variant={ButtonVariant.primary}
            name="install"
            data-testid="button-install-cluster"
            onClick={() => void handleClusterInstall()}
            isDisabled={isViewerMode || isStartingInstallation || cluster.status !== 'ready'}
          >
            Install cluster
          </Button>
        </ActionListItem>
      }
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <Grid hasGutter>
        <GridItem>
          <ClusterWizardStepHeader>Review and create</ClusterWizardStepHeader>
        </GridItem>
        <ReviewPreflightChecks cluster={cluster} />
        <ReviewSummary cluster={cluster} />
      </Grid>
    </ClusterWizardStep>
  );
};

export default ReviewStep;
