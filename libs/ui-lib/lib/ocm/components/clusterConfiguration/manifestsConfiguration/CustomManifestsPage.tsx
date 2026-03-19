import React from 'react';
import {
  Content,
  ContentVariants,
  Alert,
  AlertVariant,
  Grid,
  FormGroup,
  Switch,
  Tooltip,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { CustomManifests } from './components/CustomManifests';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { CustomManifestFormState } from './components/propTypes';
import { ClustersAPI, ClusterWizardStepHeader } from '../../../../common';
import { getFieldId } from '../../../../common/components/ui/formik';
import { isOciPlatformType, isThirdPartyCNI } from '../../utils';
import DeleteCustomManifestModal from './DeleteCustomManifestModal';
import { ClustersService } from '../../../services';
import { useClusterWizardContext } from '../../clusterWizard/ClusterWizardContext';

export const CustomManifestsPage = ({
  cluster,
  onFormStateChange,
}: {
  cluster: Cluster;
  onFormStateChange(formState: CustomManifestFormState): void;
}) => {
  const clusterWizardContext = useClusterWizardContext();
  const isRequired = isThirdPartyCNI(cluster.networkType) || isOciPlatformType(cluster);
  const [useCustomManifests, setUseCustomManifests] = React.useState(isRequired);
  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (isRequired || clusterWizardContext.uiSettings?.customManifestsAdded) {
      setUseCustomManifests(true);
    }
  }, [isRequired, clusterWizardContext]);

  // The form unmounts when the switch is off, but its last state persists in the parent.
  React.useEffect(() => {
    if (!useCustomManifests) {
      onFormStateChange({
        isValid: true,
        isSubmitting: false,
        isAutoSaveRunning: false,
        errors: {},
        touched: {},
        isEmpty: true,
      });
    }
  }, [useCustomManifests, onFormStateChange]);

  const handleSwitchChange = React.useCallback(
    (_event: React.FormEvent<HTMLInputElement>, on: boolean) => {
      if (!on && clusterWizardContext.uiSettings?.customManifestsAdded) {
        setDeleteModalOpen(true);
      } else {
        setUseCustomManifests(on);
        if (!on) {
          void clusterWizardContext.updateUISettings({ customManifestsAdded: false });
        }
      }
    },
    [clusterWizardContext],
  );

  const handleCloseDeleteModal = React.useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  const cleanCustomManifests = React.useCallback(async () => {
    if (!clusterWizardContext.uiSettings?.customManifestsAdded || !cluster.id) return;
    const { data: manifests } = await ClustersAPI.getManifests(cluster.id);
    await ClustersService.removeClusterManifests(manifests, cluster.id);
    setUseCustomManifests(false);
    setDeleteModalOpen(false);
    await clusterWizardContext.updateUISettings({ customManifestsAdded: false });
  }, [cluster.id, clusterWizardContext]);

  const fieldId = getFieldId('use-custom-manifests', 'switch');

  const tooltipWhenDisabled = isRequired
    ? 'Custom manifests are required when using a third-party CNI or Oracle Cloud Infrastructure.'
    : '';

  const showExternalPlatformReminder = isOciPlatformType(cluster);
  const showThirdPartyCnIReminder = isThirdPartyCNI(cluster.networkType);
  const showCombinedReminder = showExternalPlatformReminder && showThirdPartyCnIReminder;
  let reminderAlerts: React.ReactNode = null;
  if (showCombinedReminder) {
    reminderAlerts = (
      <Stack>
        <StackItem>
          <Alert
            variant={AlertVariant.info}
            isInline
            title="You're using an external platform and a third-party CNI"
          >
            Make sure to upload the required custom and CNI manifests in this step.
          </Alert>
        </StackItem>
      </Stack>
    );
  } else if (showExternalPlatformReminder) {
    reminderAlerts = (
      <Stack>
        <StackItem>
          <Alert variant={AlertVariant.info} isInline title="You're using an external platform">
            Make sure to upload the required custom manifests in this step.
          </Alert>
        </StackItem>
      </Stack>
    );
  } else if (showThirdPartyCnIReminder) {
    reminderAlerts = (
      <Stack>
        <StackItem>
          <Alert variant={AlertVariant.info} isInline title="You're using a third-party CNI">
            Make sure to upload the required CNI manifests in this step.
          </Alert>
        </StackItem>
      </Stack>
    );
  }

  return (
    <Grid hasGutter>
      <Content>
        <ClusterWizardStepHeader>Custom manifests</ClusterWizardStepHeader>
        <Content component={ContentVariants.small}>
          Upload additional manifests that will be applied at the install time for advanced
          configuration of the cluster.
        </Content>
      </Content>
      <FormGroup fieldId={fieldId} label="">
        <Tooltip content={tooltipWhenDisabled} hidden={!isRequired}>
          <span style={{ display: 'inline-block', cursor: isRequired ? 'not-allowed' : undefined }}>
            <Switch
              id={fieldId}
              data-testid={fieldId}
              data-checked={useCustomManifests}
              isChecked={useCustomManifests}
              isDisabled={isRequired}
              onChange={handleSwitchChange}
              label="Use custom manifests"
            />
          </span>
        </Tooltip>
      </FormGroup>
      {!useCustomManifests && <div style={{ minHeight: '120px' }} aria-hidden="true" />}
      {useCustomManifests && (
        <>
          {reminderAlerts}
          <Alert
            isInline
            variant="warning"
            title="No validation is performed for the custom manifest contents. Only include resources that are necessary for initial setup to reduce the chance of installation failures."
          />
          <CustomManifests cluster={cluster} onFormStateChange={onFormStateChange} />
        </>
      )}
      <DeleteCustomManifestModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={() => void cleanCustomManifests()}
      />
    </Grid>
  );
};
