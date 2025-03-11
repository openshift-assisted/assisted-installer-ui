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

type ClusterDeploymentDetailsFormProps = {
  clusterImages: ClusterImageSetK8sResource[];
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  extensionAfter?: ClusterDetailsFormFieldsProps['extensionAfter'];
  isNutanix?: boolean;
  osImages?: OsImage[];
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
}) => {
  const { t } = useTranslation();
  const ocpVersions = React.useMemo(
    () => getOCPVersions(clusterImages, isNutanix, osImages),
    [clusterImages, isNutanix, osImages],
  );

  const forceOpenshiftVersion = agentClusterInstall
    ? getSelectedVersion(clusterImages, agentClusterInstall)
    : undefined;
  const isEditFlow = !!clusterDeployment;

  const { values } = useFormikContext<ClusterDetailsValues>();

  const cpuArchitectures = React.useMemo(() => {
    const cpuArchitectures = [CpuArchitecture.x86, CpuArchitecture.ARM, CpuArchitecture.s390x];
    if (!osImages) {
      return cpuArchitectures;
    }

    const openshiftVersion = ocpVersions
      .find((ver) => ver.value === values.openshiftVersion)
      ?.version.split('.')
      .slice(0, 2)
      .join('.');

    return osImages
      .filter((osImage) => osImage.openshiftVersion === openshiftVersion)
      .map((osImage) => osImage.cpuArchitecture as SupportedCpuArchitecture);
  }, [osImages, ocpVersions, values.openshiftVersion]);

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
          versions={ocpVersions}
          isEditFlow={isEditFlow}
          forceOpenshiftVersion={forceOpenshiftVersion}
          extensionAfter={extensionAfter}
          isNutanix={isNutanix}
          cpuArchitectures={cpuArchitectures}
        />
      </StackItem>
    </>
  );
};

export default ClusterDeploymentDetailsForm;
