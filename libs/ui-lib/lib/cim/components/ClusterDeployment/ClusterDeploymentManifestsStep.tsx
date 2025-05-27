import React from 'react';
import * as Yup from 'yup';
import { dump, load } from 'js-yaml';
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
  AlertVariant,
  AlertGroup,
} from '@patternfly/react-core';
import { FieldArray, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ClusterWizardStepHeader,
  ErrorState,
  LoadingState,
  ManifestFormData,
  useAlerts,
  useTranslation,
} from '../../../common';
import { AgentClusterInstallK8sResource } from '../../types';
import { CustomManifestsArray } from '../../../common/components/CustomManifests/CustomManifestsArray';
import { CustomManifestService } from '../../services/CustomManifestService';
import { ValidationSection } from './components/ValidationSection';
import { ClusterDeploymentWizardContext } from './ClusterDeploymentWizardContext';

const CustomManifestsForm = ({
  agentClusterInstall,
}: {
  agentClusterInstall: AgentClusterInstallK8sResource;
}) => {
  const { t } = useTranslation();
  const { activeStep, goToPrevStep, close } = useWizardContext();
  const { clearAlerts } = useAlerts();
  const { isValid, isSubmitting, submitForm } = useFormikContext<ManifestFormData>();

  const handleSubmit = React.useCallback(async () => {
    await submitForm();
  }, [submitForm]);

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
        onBack={() => {
          clearAlerts();
          void goToPrevStep();
        }}
        onClose={close}
      />
    ),
    [
      activeStep,
      handleSubmit,
      isSubmitting,
      isValid,
      submittingText,
      t,
      close,
      clearAlerts,
      goToPrevStep,
    ],
  );

  useWizardFooter(footer);

  return (
    <Form>
      <FieldArray name="manifests">
        {(arrayProps) => (
          <CustomManifestsArray
            {...arrayProps}
            yamlOnly
            agentClusterInstall={agentClusterInstall}
          />
        )}
      </FieldArray>
    </Form>
  );
};

export const ClusterDeploymentManifestsStep = ({
  agentClusterInstall,
}: {
  agentClusterInstall: AgentClusterInstallK8sResource;
}) => {
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);

  const { t } = useTranslation();
  const { goToNextStep } = useWizardContext();
  const { alerts, clearAlerts, addAlert } = useAlerts();

  const { customManifests, isLoading, isError } =
    CustomManifestService.useCustomManifests(agentClusterInstall);

  const initialValues = React.useMemo(
    () =>
      ({
        manifests: customManifests.length
          ? customManifests.map((manifest) => ({
              manifestYaml: !!manifest ? dump(manifest) : '',
              filename: manifest?.metadata?.name || '',
              created: true,
              folder: 'manifests',
            }))
          : [{ manifestYaml: '', filename: '', created: false, folder: 'manifests' }],
      } as ManifestFormData),
    [customManifests],
  );

  const handleSubmit = React.useCallback(
    async (values: ManifestFormData, _formikHelpers: FormikHelpers<ManifestFormData>) => {
      try {
        clearAlerts();
        await CustomManifestService.onSyncCustomManifests(
          agentClusterInstall,
          values,
          customManifests,
        );
        void goToNextStep();
      } catch (e) {
        if (Array.isArray(e)) {
          (e as PromiseSettledResult<K8sResourceCommon>[]).forEach((res) => {
            if (res.status === 'rejected') {
              addAlert({
                title: t('ai:Failed to save custom manifests'),
                message: (res.reason as { message: string }).message,
                variant: AlertVariant.danger,
              });
            }
          });
        } else {
          addAlert({
            title: t('ai:Failed to save custom manifests'),
            variant: AlertVariant.danger,
          });
        }
      }
    },
    [addAlert, agentClusterInstall, clearAlerts, customManifests, goToNextStep, t],
  );

  let content: React.ReactNode;
  if (isLoading) {
    content = <LoadingState />;
  } else if (isError) {
    content = <ErrorState />;
  } else {
    content = (
      <Formik
        initialValues={initialValues}
        validateOnMount
        validationSchema={Yup.object({
          manifests: Yup.array().of(
            Yup.object({
              manifestYaml: Yup.string()
                .required()
                .test('metadata-name', t('ai:metadata.name is required.'), (val) => {
                  try {
                    const manifest = load(val) as K8sResourceCommon;
                    return !!manifest.metadata?.name;
                  } catch (error) {
                    return false;
                  }
                })
                .test('kind', t('ai:Custom manifest must be of MachineConfig kind.'), (val) => {
                  try {
                    const manifest = load(val) as K8sResourceCommon;
                    return manifest.kind === 'MachineConfig';
                  } catch (error) {
                    return false;
                  }
                }),
            }),
          ),
        })}
        onSubmit={handleSubmit}
      >
        <CustomManifestsForm agentClusterInstall={agentClusterInstall} />
      </Formik>
    );
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>{t('ai:Custom manifests')}</ClusterWizardStepHeader>
      </GridItem>
      <GridItem>
        <TextContent>
          <Text component={TextVariants.small}>
            {t(
              'ai:Upload additional manifests that will be applied at the install time for advanced configuration of the cluster.',
            )}
          </Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <Alert
          isInline
          variant="warning"
          title={t(
            'ai:No validation is performed for the custom manifest contents. Only include resources that are necessary for initial setup to reduce the chance of installation failures.',
          )}
        />
      </GridItem>

      <GridItem>{content}</GridItem>

      {!!alerts.length && (
        <GridItem>
          <AlertGroup>
            {alerts.map((alert) => (
              <Alert key={alert.key} title={alert.title} variant={alert.variant} isInline>
                {alert.message}
              </Alert>
            ))}
          </AlertGroup>
        </GridItem>
      )}
      {syncError && (
        <GridItem>
          <ValidationSection currentStepId={'review'} hosts={[]}>
            <Alert variant={AlertVariant.danger} title={t('ai:An error occured')} isInline>
              {syncError}
            </Alert>
          </ValidationSection>
        </GridItem>
      )}
    </Grid>
  );
};
