import React from 'react';
import { useHistory } from 'react-router-dom';
import { TextVariants, Spinner, Button, ButtonVariant } from '@patternfly/react-core';
import { WarningTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { FormikErrors } from 'formik';
import { Cluster, ClusterUpdateParams } from '../../api';
import ClusterValidationSection from '../clusterConfiguration/ClusterValidationSection';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton, ToolbarText } from '../ui';
import { routeBasePath } from '../../config';

const ClusterWizardToolbar: React.FC<{
  cluster: Cluster;
  errors?: FormikErrors<ClusterUpdateParams>;
  dirty?: boolean;
  isSubmitting?: boolean;
  onNext?: () => void;
  isNextDisabled?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  onInstall?: () => Promise<void>;
}> = ({
  cluster,
  errors = {},
  dirty = false,
  isSubmitting = false,
  onCancel,
  onNext,
  onInstall,
  isNextDisabled,
  onBack,
}) => {
  const [isValidationSectionOpen, setIsValidationSectionOpen] = React.useState(false);
  const [isStartingInstallation, setIsStartingInstallation] = React.useState(false);
  const history = useHistory();

  const handleCancel = React.useCallback(() => {
    onCancel && onCancel();
    history.push(`${routeBasePath}/clusters/`);
  }, [onCancel, history]);

  const handleClusterInstall = React.useCallback(() => {
    if (!onInstall) {
      return;
    }

    setIsStartingInstallation(true);
    onInstall().then(() => {
      setIsStartingInstallation(false);
    });
  }, [setIsStartingInstallation, onInstall]);

  return (
    <ClusterToolbar
      validationSection={
        isValidationSectionOpen ? (
          <ClusterValidationSection
            cluster={cluster}
            dirty={dirty}
            formErrors={errors}
            onClose={() => setIsValidationSectionOpen(false)}
          />
        ) : null
      }
    >
      {onInstall && (
        <ToolbarButton
          variant={ButtonVariant.primary}
          name="install"
          onClick={handleClusterInstall}
          isDisabled={isStartingInstallation || cluster.status !== 'ready'}
        >
          Install Cluster
        </ToolbarButton>
      )}
      {onNext && (
        <ToolbarButton
          variant={ButtonVariant.primary}
          name="next"
          onClick={onNext}
          isDisabled={isNextDisabled}
        >
          Next
        </ToolbarButton>
      )}
      {onBack && (
        <ToolbarButton
          variant={ButtonVariant.secondary}
          name="back"
          onClick={onBack}
          isDisabled={false}
        >
          Back
        </ToolbarButton>
      )}
      <ToolbarButton
        variant={ButtonVariant.link}
        name="cancel"
        onClick={handleCancel}
        isDisabled={false}
      >
        Cancel
      </ToolbarButton>

      {isSubmitting && (
        <ToolbarText component={TextVariants.small}>
          <Spinner size="sm" /> Saving changes...
        </ToolbarText>
      )}
      {isStartingInstallation ? (
        <ToolbarText component={TextVariants.small}>
          <Spinner size="sm" /> Starting installation...
        </ToolbarText>
      ) : (
        <ToolbarText component={TextVariants.small}>
          {!Object.keys(errors).length && !dirty && cluster.status === 'ready' ? (
            <>
              <CheckCircleIcon color={successColor.value} /> The cluster is ready to be installed.
            </>
          ) : (
            <>
              <Button
                variant={ButtonVariant.link}
                onClick={() => setIsValidationSectionOpen(!isValidationSectionOpen)}
                isInline
              >
                <WarningTriangleIcon color={warningColor.value} />{' '}
                <small>The cluster is not ready to be installed yet</small>
              </Button>
            </>
          )}
        </ToolbarText>
      )}
    </ClusterToolbar>
  );
};

export default ClusterWizardToolbar;
