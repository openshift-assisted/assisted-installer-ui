import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  TextVariants,
  Spinner,
  Button,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { WarningTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { FormikErrors } from 'formik';
import { Cluster, ClusterUpdateParams } from '../../api';
import ClusterValidationSection from '../clusterConfiguration/ClusterValidationSection';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton, ToolbarText } from '../ui';
import { routeBasePath } from '../../config';
import Alerts from '../ui/Alerts';
import { AlertsContext } from '../AlertsContextProvider';
import { getWizardStepClusterStatus } from './wizardTransition';
import ClusterWizardContext from './ClusterWizardContext';

type ValidationSectionToggleProps = {
  cluster: Cluster;
  formErrors: FormikErrors<ClusterUpdateParams>;
  isSubmitting?: boolean;
  isStartingInstallation?: boolean;
  onInstall?: () => Promise<void>;
  toggleValidationSection: () => void;
};

type ClusterWizardToolbarProps = {
  cluster?: Cluster;
  formErrors?: FormikErrors<ClusterUpdateParams>;
  dirty?: boolean;
  isSubmitting?: boolean;
  onSaveChanges?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  isSaveChangesDisabled?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  onInstall?: () => Promise<void>;
};

const ValidationSectionToggle: React.FC<ValidationSectionToggleProps> = ({
  cluster,
  isStartingInstallation,
  isSubmitting,
  formErrors,
  onInstall,
  toggleValidationSection,
}) => {
  const { currentStepId } = React.useContext(ClusterWizardContext);

  if (isSubmitting) {
    return (
      <ToolbarText component={TextVariants.small}>
        <Spinner size="sm" /> Saving changes...
      </ToolbarText>
    );
  }

  if (isStartingInstallation) {
    return (
      <ToolbarText component={TextVariants.small}>
        <Spinner size="sm" /> Starting installation...
      </ToolbarText>
    );
  }

  if (Object.keys(formErrors).length) {
    return (
      <ToolbarButton variant={ButtonVariant.link} onClick={toggleValidationSection} isInline>
        <WarningTriangleIcon color={warningColor.value} />
        &nbsp;<small>The configuration form has unresolved validation errors.</small>
      </ToolbarButton>
    );
  }

  if (getWizardStepClusterStatus(cluster, currentStepId) !== 'ready') {
    return (
      <Button variant={ButtonVariant.link} onClick={toggleValidationSection} isInline>
        <WarningTriangleIcon color={warningColor.value} />
        &nbsp;<small>Cluster is not ready.</small>
      </Button>
    );
  }

  if (onInstall) {
    if (cluster.status === 'ready') {
      return (
        <>
          <CheckCircleIcon color={successColor.value} />
          &nbsp;
          <small>The cluster is ready to be installed.</small>
        </>
      );
    }

    return (
      <>
        <WarningTriangleIcon color={warningColor.value} />
        &nbsp;
        <small>The cluster is not ready to be installed yet</small>
      </>
    );
  }

  return null;
};

const ClusterWizardToolbar: React.FC<ClusterWizardToolbarProps> = ({
  cluster,
  formErrors = {},
  dirty = false,
  isSubmitting = false,
  onCancel,
  onNext,
  onSaveChanges,
  isSaveChangesDisabled,
  onInstall,
  isNextDisabled,
  onBack,
}) => {
  const [isValidationSectionOpen, setIsValidationSectionOpen] = React.useState(false);
  const [isStartingInstallation, setIsStartingInstallation] = React.useState(false);
  const { alerts } = React.useContext(AlertsContext);
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
    <Stack hasGutter>
      {!!alerts.length && (
        <StackItem>
          <Alerts />
        </StackItem>
      )}
      <StackItem>
        <ClusterToolbar
          validationSection={
            isValidationSectionOpen && cluster ? (
              <ClusterValidationSection
                cluster={cluster}
                dirty={dirty}
                formErrors={formErrors}
                onClose={() => setIsValidationSectionOpen(false)}
              />
            ) : null
          }
        >
          {onInstall && cluster && (
            <ToolbarButton
              variant={ButtonVariant.primary}
              name="install"
              onClick={handleClusterInstall}
              isDisabled={isStartingInstallation || cluster.status !== 'ready'}
            >
              Install Cluster
            </ToolbarButton>
          )}
          {onSaveChanges && dirty && (
            <ToolbarButton
              variant={ButtonVariant.primary}
              name="saveChanges"
              onClick={onSaveChanges}
              isDisabled={isSaveChangesDisabled}
            >
              Save Changes
            </ToolbarButton>
          )}
          {onNext && (!dirty || !onSaveChanges) && (
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

          {cluster && (
            <ValidationSectionToggle
              cluster={cluster}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              isStartingInstallation={isStartingInstallation}
              onInstall={onInstall}
              toggleValidationSection={() => setIsValidationSectionOpen(!isValidationSectionOpen)}
            />
          )}
        </ClusterToolbar>
      </StackItem>
    </Stack>
  );
};

export default ClusterWizardToolbar;
