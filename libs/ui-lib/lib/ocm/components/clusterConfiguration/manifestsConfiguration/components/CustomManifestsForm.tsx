import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { Form } from '@patternfly/react-core';
import {
  FieldArray,
  FieldArrayRenderProps,
  Formik,
  FormikConfig,
  useFormikContext,
  yupToFormErrors,
} from 'formik';
import isEqual from 'lodash-es/isEqual.js';
import {
  ErrorState,
  LoadingState,
  getApiErrorMessage,
  handleApiError,
  useAlerts,
  useFormikAutoSave,
} from '../../../../../common';
import { CustomManifestsFormProps } from './propTypes';
import { CustomManifestValues, ManifestFormData } from '../data/dataTypes';
import useClusterCustomManifests from '../../../../hooks/useClusterCustomManifests';
import { ClustersService } from '../../../../services';
import { CustomManifestsArray } from './CustomManifestsArray';
import { selectCurrentClusterPermissionsState } from '../../../../store/slices/current-cluster/selectors';
import { useClusterWizardContext } from '../../../clusterWizard/ClusterWizardContext';
import { ClustersAPI } from '../../../../services/apis';

const fieldName = 'manifests';

const AutosaveWithParentUpdate = ({
  onFormStateChange,
  getEmptyValues,
}: {
  onFormStateChange: CustomManifestsFormProps['onFormStateChange'];
  getEmptyValues: CustomManifestsFormProps['getEmptyValues'];
}) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emptyValues = React.useMemo(() => getEmptyValues(), []);
  const { isSubmitting, isValid, touched, errors, values } = useFormikContext<ManifestFormData>();
  const isEmpty = React.useMemo<boolean>(() => {
    return isEqual(values, emptyValues);
  }, [values, emptyValues]);
  const isAutoSaveRunning = useFormikAutoSave();

  React.useEffect(() => {
    onFormStateChange({ isSubmitting, isAutoSaveRunning, isValid, touched, errors, isEmpty });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, isValid, isAutoSaveRunning, touched, errors]);

  return null;
};

const manifestUpdated = (manifest: CustomManifestValues, oldManifest: CustomManifestValues) => {
  return (
    oldManifest.filename !== manifest.filename ||
    oldManifest.folder !== manifest.folder ||
    oldManifest.manifestYaml !== manifest.manifestYaml
  );
};

export const CustomManifestsForm = ({
  onFormStateChange,
  getEmptyValues,
  cluster,
  getInitialValues,
  validationSchema,
}: PropsWithChildren<CustomManifestsFormProps>) => {
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const [initialValues, setInitialValues] = React.useState<ManifestFormData | undefined>();
  const { addAlert, clearAlerts } = useAlerts();
  const { customManifests, isLoading, error } = useClusterCustomManifests(cluster.id || '', true);
  const customManifestsLocalRef = React.useRef<CustomManifestValues[]>([]);
  const { updateUISettings, uiSettings } = useClusterWizardContext();

  React.useEffect(() => {
    if (customManifests && !customManifestsLocalRef.current.length) {
      const initValues = getInitialValues(customManifests);
      setInitialValues(initValues);
      customManifestsLocalRef.current = !!customManifests.length ? initValues.manifests : [];
    }
  }, [customManifests, getInitialValues]);

  const handleSubmit: FormikConfig<ManifestFormData>['onSubmit'] = React.useCallback(
    async ({ manifests }, actions) => {
      if (manifests.length < customManifestsLocalRef.current.length) {
        // submit was triggered by deleting a manifest

        customManifestsLocalRef.current = manifests;
        return;
      } else {
        clearAlerts();
        actions.setSubmitting(true);

        for (let index = 0; index < manifests.length; index++) {
          try {
            const manifest = manifests[index];
            if (index >= (customManifestsLocalRef.current?.length || 0)) {
              // manifest added
              await ClustersAPI.createCustomManifest(
                cluster.id,
                ClustersService.transformFormViewManifest(manifest),
              );
            } else {
              // manifest updated
              const oldManifest = customManifestsLocalRef.current[index];

              if (manifestUpdated(manifest, oldManifest)) {
                await ClustersService.updateCustomManifest(oldManifest, manifest, cluster.id);
              }
            }
          } catch (error) {
            const errorArray = new Array(manifests.length).fill(undefined);
            errorArray.splice(index, 1, { manifestYaml: 'Failed to save changes' });

            const errors = {
              manifests: errorArray,
            };
            actions.setErrors(errors);

            // handleApiErrorInForm(manifests, customManifestsLocalRef.current, actions);
            handleApiError(error, () =>
              addAlert({
                title: 'Failed to update the custom manifests',
                message: getApiErrorMessage(error),
              }),
            );
          }
        }

        customManifestsLocalRef.current = manifests;
        if (!uiSettings?.customManifestsAdded) {
          await updateUISettings({ customManifestsAdded: true });
        }

        actions.setSubmitting(false);
      }
    },
    [clearAlerts, uiSettings?.customManifestsAdded, cluster.id, addAlert, updateUISettings],
  );

  const onSubmit = isViewerMode ? () => Promise.resolve() : handleSubmit;

  const validate = (values: ManifestFormData) => {
    try {
      validationSchema.validateSync(values, { abortEarly: false, context: { values } });
      return {};
    } catch (error) {
      return yupToFormErrors(error);
    }
  };

  const renderManifests = React.useCallback(
    (arrayRenderProps: FieldArrayRenderProps) => (
      <CustomManifestsArray {...Object.assign({ clusterId: cluster.id }, arrayRenderProps)} />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (error) {
    return <ErrorState />;
  }

  if (isLoading || !initialValues) {
    return <LoadingState content="Loading custom manifests ..." />;
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      enableReinitialize
      validateOnMount
      validateOnChange
    >
      <Form>
        <FieldArray name={fieldName} render={renderManifests} />
        <AutosaveWithParentUpdate
          onFormStateChange={onFormStateChange}
          getEmptyValues={getEmptyValues}
        />
      </Form>
    </Formik>
  );
};
