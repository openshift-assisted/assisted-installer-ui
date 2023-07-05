import * as React from 'react';
import { Alert, FormGroup } from '@patternfly/react-core';
import { useField } from 'formik';
import { getFieldId, HelperText, PopoverIcon } from '../../../common';
import { OcmCheckbox } from '../ui/OcmFormFields';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import DeleteCustomManifestModal from './manifestsConfiguration/DeleteCustomManifestModal';
import useClusterCustomManifests from '../../hooks/useClusterCustomManifests';
import { ClustersService } from '../../services';
import { ListManifestsExtended } from './manifestsConfiguration/data/dataTypes';

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

type CustomManifestCheckboxProps = { clusterId: string };

const CustomManifestCheckbox = ({ clusterId }: CustomManifestCheckboxProps) => {
  const [{ name }, , { setValue }] = useField('addCustomManifest');
  const fieldId = getFieldId(name, 'input');
  const clusterWizardContext = useClusterWizardContext();
  const { customManifests } = useClusterCustomManifests(clusterId, false);
  const [isDeleteCustomManifestsOpen, setDeleteCustomManifestsOpen] = React.useState(false);
  const [manifestsRemoved, setManifestsRemoved] = React.useState(false);
  const [manifestsDummy, setManifestsDummy] = React.useState<ListManifestsExtended | undefined>();
  const cleanCustomManifests = React.useCallback(() => {
    setValue(false);
    clusterWizardContext.setAddCustomManifests(false);
    setDeleteCustomManifestsOpen(false);
    setManifestsRemoved(true);
    //if cluster exists remove existing cluster manifests
    if (clusterId) {
      if (customManifests) {
        void ClustersService.removeClusterManifests(customManifests, clusterId).then(() => {
          setManifestsDummy(undefined);
        });
      }
      if (manifestsDummy !== undefined) {
        void ClustersService.removeClusterManifests(manifestsDummy, clusterId).then(() => {
          setManifestsDummy(undefined);
        });
      }
    }
  }, [clusterWizardContext, setValue, clusterId, customManifests, manifestsDummy]);

  const onChanged = React.useCallback(
    (checked: boolean) => {
      if (!checked) {
        //For new clusters is not necessary to show the delete modal
        if (clusterId) setDeleteCustomManifestsOpen(true);
        else {
          cleanCustomManifests();
        }
      } else {
        setValue(checked);
        setManifestsRemoved(false);
        clusterWizardContext.setAddCustomManifests(checked);
      }
    },
    [setValue, clusterWizardContext, setDeleteCustomManifestsOpen, cleanCustomManifests, clusterId],
  );

  const onClose = React.useCallback(() => {
    setValue(true);
    clusterWizardContext.setAddCustomManifests(true);
    setDeleteCustomManifestsOpen(false);
    setManifestsRemoved(false);
  }, [clusterWizardContext, setValue]);

  const customManifestsActivated =
    clusterWizardContext.addCustomManifests ||
    (customManifests && customManifests.length > 0) ||
    manifestsDummy !== undefined;
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
