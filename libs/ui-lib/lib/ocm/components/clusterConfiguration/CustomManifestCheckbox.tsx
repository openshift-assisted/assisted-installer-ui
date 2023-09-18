import * as React from 'react';
import { Alert, FormGroup } from '@patternfly/react-core';
import { useField } from 'formik';
import { getFieldId, HelperText, PopoverIcon } from '../../../common';
import { OcmCheckbox } from '../ui/OcmFormFields';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import DeleteCustomManifestModal from './manifestsConfiguration/DeleteCustomManifestModal';
import useClusterCustomManifests from '../../hooks/useClusterCustomManifests';
import { ClustersService } from '../../services';

const Label = () => {
  return (
    <>
      Include custom manifests{' '}
      <PopoverIcon
        noVerticalAlign
        bodyContent={
          <p>
            Incorporate third-party manifests that are not supported in Assisted Installer and APIs.
          </p>
        }
      />
    </>
  );
};

type CustomManifestCheckboxProps = { clusterId: string; isDisabled: boolean };

const CustomManifestCheckbox = ({ clusterId, isDisabled }: CustomManifestCheckboxProps) => {
  const [{ name }, , { setValue }] = useField('addCustomManifest');
  const fieldId = getFieldId(name, 'input');
  const clusterWizardContext = useClusterWizardContext();
  const { customManifests } = useClusterCustomManifests(clusterId, false);
  const [isDeleteCustomManifestsOpen, setDeleteCustomManifestsOpen] = React.useState(false);
  const [manifestsRemoved, setManifestsRemoved] = React.useState(false);
  const cleanCustomManifests = React.useCallback(() => {
    setValue(false);
    clusterWizardContext.setCustomManifestsStep(false);
    setDeleteCustomManifestsOpen(false);
    setManifestsRemoved(true);
    //if cluster exists remove existing cluster manifests
    if (clusterId && customManifests) {
      void ClustersService.removeClusterManifests(customManifests, clusterId);
    }
  }, [clusterWizardContext, setValue, clusterId, customManifests]);

  const onChanged = React.useCallback(
    (checked: boolean) => {
      clusterWizardContext.setCustomManifestsStep(checked);
    },
    [setValue, clusterWizardContext, setDeleteCustomManifestsOpen, cleanCustomManifests, clusterId],
  );

  const onClose = React.useCallback(() => {
    setValue(true);
    clusterWizardContext.setCustomManifestsStep(true);
    setDeleteCustomManifestsOpen(false);
    setManifestsRemoved(false);
  }, [clusterWizardContext, setValue]);

  const customManifestsActivated =
    clusterWizardContext.customManifestsStep || (customManifests && customManifests.length > 0);
  return (
    <>
      <FormGroup id={`form-control__${fieldId}`} isInline fieldId={fieldId}>
        <OcmCheckbox
          id={fieldId}
          name={name}
          label={<Label />}
          aria-describedby={`${fieldId}-helper`}
          description={
            <HelperText fieldId={fieldId}>
              Additional manifests will be applied at the install time for advanced configuration of
              the cluster.
            </HelperText>
          }
          onChange={(checked: boolean) => onChanged(checked)}
          className="with-tooltip"
          isChecked={manifestsRemoved ? false : customManifestsActivated}
          isDisabled={isDisabled}
        />
        <DeleteCustomManifestModal
          isOpen={isDeleteCustomManifestsOpen}
          onClose={onClose}
          onDelete={() => cleanCustomManifests()}
        />
      </FormGroup>
      {customManifestsActivated && (
        <Alert isInline variant="info" title={'This is an advanced configuration feature.'}>
          Custom manifests will be added to the wizard as a new step.
        </Alert>
      )}
    </>
  );
};

export default CustomManifestCheckbox;
