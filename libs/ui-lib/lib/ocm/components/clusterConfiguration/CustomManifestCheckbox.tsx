import * as React from 'react';
import { Alert, FormGroup } from '@patternfly/react-core';
import { useField } from 'formik';
import { getFieldId, HelperText, PopoverIcon } from '../../../common';
import { OcmCheckbox } from '../ui/OcmFormFields';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import DeleteCustomManifestModal from './manifestsConfiguration/DeleteCustomManifestModal';
import { ClustersService } from '../../services';
import { ClustersAPI } from '../../services/apis';

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
  const [{ name }, { value }, { setValue }] = useField('addCustomManifest');
  const fieldId = getFieldId(name, 'input');
  const clusterWizardContext = useClusterWizardContext();
  const [isDeleteCustomManifestsOpen, setDeleteCustomManifestsOpen] = React.useState(false);

  const cleanCustomManifests = React.useCallback(async () => {
    const { data: manifests } = await ClustersAPI.getManifests(clusterId);
    void ClustersService.removeClusterManifests(manifests, clusterId);

    setValue(false);
    clusterWizardContext.setCustomManifestsStep(false);
    setDeleteCustomManifestsOpen(false);
    await clusterWizardContext.updateUISettings({
      addCustomManifests: false,
      customManifestsAdded: false,
    });
  }, [clusterWizardContext, setValue, clusterId]);

  const onChange = React.useCallback(
    (checked: boolean) => {
      if (!checked && clusterWizardContext.uiSettings?.customManifestsAdded) {
        setDeleteCustomManifestsOpen(true);
      }

      setValue(checked);
      clusterWizardContext.setCustomManifestsStep(checked);
    },
    [setValue, clusterWizardContext, setDeleteCustomManifestsOpen, clusterId],
  );

  const onClose = React.useCallback(() => {
    setValue(true);
    clusterWizardContext.setCustomManifestsStep(true);
    setDeleteCustomManifestsOpen(false);
  }, [clusterWizardContext, setValue]);

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
          onChange={(checked: boolean) => onChange(checked)}
          className="with-tooltip"
          isChecked={value}
          isDisabled={isDisabled}
        />
        <DeleteCustomManifestModal
          isOpen={isDeleteCustomManifestsOpen}
          onClose={onClose}
          onDelete={cleanCustomManifests}
        />
      </FormGroup>
      {value && (
        <Alert isInline variant="info" title={'This is an advanced configuration feature.'}>
          Custom manifests will be added to the wizard as a new step.
        </Alert>
      )}
    </>
  );
};

export default CustomManifestCheckbox;
