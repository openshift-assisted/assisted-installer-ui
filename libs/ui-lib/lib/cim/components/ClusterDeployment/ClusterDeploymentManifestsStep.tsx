import React from 'react';
import * as Yup from 'yup';
import { dump } from 'js-yaml';
import {
  Alert,
  Grid,
  GridItem,
  TextContent,
  TextVariants,
  Text,
  WizardFooter,
  useWizardContext,
  useWizardFooter,
} from '@patternfly/react-core';
import { ClusterWizardStepHeader, useTranslation } from '../../../common';
import { FieldArray, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { AgentClusterInstallK8sResource } from '../../types';
import { CustomManifestsArray } from '../../../ocm/components/clusterConfiguration/manifestsConfiguration/components/CustomManifestsArray';
import { ManifestFormData } from '../../../ocm/components/clusterConfiguration/manifestsConfiguration/data/dataTypes';
import {
  K8sResourceCommon,
  ResourcesObject,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';

const CustomManifestsForm = ({
  agentClusterInstall,
}: {
  agentClusterInstall: AgentClusterInstallK8sResource;
  onSyncCustomManifests: (
    agentClusterInstall: AgentClusterInstallK8sResource,
    val: ManifestFormData,
    existingManifests: K8sResourceCommon[],
  ) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
  const { values, isValid, isSubmitting, submitForm } = useFormikContext<ManifestFormData>();

  const handleSubmit = React.useCallback(async () => {
    try {
      await submitForm();
      await goToNextStep();
    } catch (error) {
      console.error(error);
    }
  }, [goToNextStep, submitForm]);

  const submittingText = React.useMemo(() => {
    if (isSubmitting) {
      return t('ai:Saving changes...');
    }
    return undefined;
  }, [isSubmitting, t]);

  const footer = React.useMemo(
    () => (
      <WizardFooter
        activeStep={activeStep}
        onNext={handleSubmit}
        isNextDisabled={isSubmitting || !isValid}
        nextButtonText={submittingText || t('ai:Next')}
        nextButtonProps={{ isLoading: !!submittingText }}
        onBack={goToPrevStep}
        onClose={close}
      />
    ),
    [activeStep, handleSubmit, isSubmitting, isValid, submittingText, t, goToPrevStep, close],
  );

  useWizardFooter(footer);

  return (
    <Form>
      <FieldArray name="manifests">
        {(arrayProps) => (
          <CustomManifestsArray
            clusterId={''}
            {...arrayProps}
            yamlOnly
            agentClusterInstall={agentClusterInstall}
            onRemoveManifest={async (manifestId: number) => {
              console.log('removing manifest', values.manifests[manifestId]);
              values.manifests.splice(manifestId, 1);
              return Promise.resolve();
            }}
          />
        )}
      </FieldArray>
    </Form>
  );
};

export const ClusterDeploymentManifestsStep = ({
  agentClusterInstall,
  useCustomManifests,
  onSyncCustomManifests,
}: {
  agentClusterInstall: AgentClusterInstallK8sResource;
  useCustomManifests: (
    agentClusterInstall?: AgentClusterInstallK8sResource,
  ) => WatchK8sResults<ResourcesObject>;
  onSyncCustomManifests: (
    agentClusterInstall: AgentClusterInstallK8sResource,
    val: ManifestFormData,
    existingManifests: K8sResourceCommon[],
  ) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const customManifests = useCustomManifests(agentClusterInstall);
  const initialValues = React.useMemo(
    () =>
      ({
        manifests: Object.values(customManifests || {})?.length
          ? Object.values(customManifests || {}).map((manifest) => ({
              manifestYaml: manifest?.data ? dump(manifest?.data) : '',
              filename: (manifest.data as K8sResourceCommon)?.metadata?.name || '',
              created: true,
              folder: 'manifests',
            }))
          : [{ manifestYaml: '', filename: '', created: false, folder: 'manifests' }],
      } as ManifestFormData),
    [customManifests],
  );

  const handleSubmit = async (
    values: ManifestFormData,
    _formikHelpers: FormikHelpers<ManifestFormData>,
  ) => {
    try {
      await onSyncCustomManifests(
        agentClusterInstall,
        values,
        Object.values(customManifests || {}).map(
          (manifest: { data?: object }) => manifest.data,
        ) as K8sResourceCommon[],
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>{t('ai:Custom manifests')}</ClusterWizardStepHeader>
      </GridItem>
      <GridItem>
        <TextContent>
          <Text component={TextVariants.small}>
            Upload additional manifests that will be applied at the install time for advanced
            configuration of the cluster.
          </Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <Alert
          isInline
          variant="warning"
          title={
            'No validation is performed for the custom manifest contents. Only include resources that are necessary for initial setup to reduce the chance of installation failures.'
          }
        />
      </GridItem>
      <GridItem>
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object({
            manifests: Yup.array().of(
              Yup.object({
                manifestYaml: Yup.string().required(),
              }),
            ),
          })}
          onSubmit={handleSubmit}
        >
          <CustomManifestsForm
            agentClusterInstall={agentClusterInstall}
            onSyncCustomManifests={onSyncCustomManifests}
          />
        </Formik>
      </GridItem>
    </Grid>
  );
};
