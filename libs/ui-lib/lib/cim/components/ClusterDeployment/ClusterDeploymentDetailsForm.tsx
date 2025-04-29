import * as React from 'react';
import {
  Alert,
  AlertVariant,
  Stack,
  StackItem,
  useWizardContext,
  useWizardFooter,
  WizardFooter,
} from '@patternfly/react-core';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource, OsImage } from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import { getOCPVersions, getSelectedVersion } from '../helpers';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  ClusterDetailsFormFields,
  ClusterDetailsFormFieldsProps,
} from './ClusterDetailsFormFields';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues, CpuArchitecture, SupportedCpuArchitecture } from '../../../common';
import { ClusterDeploymentWizardContext } from './ClusterDeploymentWizardContext';
import { ValidationSection } from './components/ValidationSection';
import { toNumber } from 'lodash-es';
import {
  K8sResourceCommon,
  ResourcesObject,
  WatchK8sResults,
} from '@openshift-console/dynamic-plugin-sdk';
import { ManifestFormData } from '../../../ocm/components/clusterConfiguration/manifestsConfiguration/data/dataTypes';

type ClusterDeploymentDetailsFormProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  extensionAfter?: ClusterDetailsFormFieldsProps['extensionAfter'];
  isNutanix?: boolean;
  osImages?: OsImage[];
  useCustomManifests?: (
    agentClusterInstall?: AgentClusterInstallK8sResource,
  ) => WatchK8sResults<ResourcesObject>;
  onSyncCustomManifests?: (
    agentClusterInstall: AgentClusterInstallK8sResource,
    val: ManifestFormData,
    existingManifests: K8sResourceCommon[],
  ) => Promise<void>;
};

export const ClusterDeploymentDetailsFormWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeStep, goToPrevStep, goToNextStep, close } = useWizardContext();
  const { syncError } = React.useContext(ClusterDeploymentWizardContext);
  const { submitForm, isSubmitting, isValid, isValidating, dirty } =
    useFormikContext<ClusterDetailsValues>();
  const { t } = useTranslation();

  const handleOnNext = React.useCallback(() => {
    if (dirty) {
      void submitForm();
    } else {
      void goToNextStep();
    }
  }, [dirty, goToNextStep, submitForm]);

  const footer = React.useMemo(
    () => (
      <WizardFooter
        activeStep={activeStep}
        onNext={handleOnNext}
        isNextDisabled={!isValid || isValidating || isSubmitting}
        nextButtonProps={{ isLoading: isSubmitting }}
        nextButtonText={t('ai:Next')}
        onBack={goToPrevStep}
        onClose={close}
        isBackHidden
      />
    ),
    [activeStep, close, goToPrevStep, handleOnNext, isSubmitting, isValid, isValidating, t],
  );

  useWizardFooter(footer);

  return (
    <Stack hasGutter>
      {children}
      {syncError && (
        <StackItem>
          <ValidationSection currentStepId={'networking'} hosts={[]}>
            <Alert variant={AlertVariant.danger} title={t('ai:An error occured')} isInline>
              {syncError}
            </Alert>
          </ValidationSection>
        </StackItem>
      )}
    </Stack>
  );
};

const ClusterDeploymentDetailsForm: React.FC<ClusterDeploymentDetailsFormProps> = ({
  agentClusterInstall,
  clusterDeployment,
  clusterImages,
  extensionAfter,
  isNutanix,
  osImages,
  useCustomManifests,
  onSyncCustomManifests,
}) => {
  const { t } = useTranslation();
  const versions = React.useMemo(
    () => getOCPVersions(clusterImages, isNutanix, osImages),
    [clusterImages, isNutanix, osImages],
  );

  const allVersions = React.useMemo(
    () => getOCPVersions(clusterImages, isNutanix, osImages, true),
    [clusterImages, isNutanix, osImages],
  );

  const forceOpenshiftVersion = agentClusterInstall
    ? getSelectedVersion(clusterImages, agentClusterInstall)
    : undefined;
  const isEditFlow = !!clusterDeployment;

  const { values } = useFormikContext<ClusterDetailsValues>();

  const [cpuArchitectures, allowHighlyAvailable] = React.useMemo(() => {
    const cpuArchitectures = [CpuArchitecture.x86, CpuArchitecture.ARM, CpuArchitecture.s390x];
    const version = allVersions.find((ver) => ver.value === values.openshiftVersion);
    const isMulti = version?.cpuArchitectures?.[0] === CpuArchitecture.MULTI;

    const highlyAvailableSupported = toNumber(version?.version?.split('.')?.[1]) >= 18;
    return [
      (isMulti ? cpuArchitectures : version?.cpuArchitectures) as SupportedCpuArchitecture[],
      highlyAvailableSupported && !isMulti,
    ];
  }, [allVersions, values.openshiftVersion]);

  return (
    <>
      {isEditFlow && (
        <StackItem>
          <Alert
            isInline
            variant="info"
            title={t('ai:Some details are not editable after the draft cluster was created.')}
          />
        </StackItem>
      )}
      <StackItem>
        <ClusterDetailsFormFields
          versions={versions}
          allVersions={allVersions}
          isEditFlow={isEditFlow}
          forceOpenshiftVersion={forceOpenshiftVersion}
          extensionAfter={extensionAfter}
          isNutanix={isNutanix}
          cpuArchitectures={cpuArchitectures}
          allowHighlyAvailable={allowHighlyAvailable}
          agentClusterInstall={agentClusterInstall}
          useCustomManifests={useCustomManifests}
          onSyncCustomManifests={onSyncCustomManifests}
        />
      </StackItem>
    </>
  );
};

export default ClusterDeploymentDetailsForm;
