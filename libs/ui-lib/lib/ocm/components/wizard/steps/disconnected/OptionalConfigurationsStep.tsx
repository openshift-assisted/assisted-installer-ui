import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { Alert, AlertVariant, Form, Grid, GridItem, Content } from '@patternfly/react-core';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStep,
  WithErrorBoundary,
  UploadSSH,
  useAlerts,
  sshPublicKeyValidationSchema,
  InfraEnvsAPI,
  handleApiError,
  getApiErrorMessage,
  useTranslation,
  InputField,
  ipValidationSchema,
  getFormikErrorFields,
  CheckboxField,
  AdditionalNTPSourcesField,
  conditionalNtpSourceValidationSchema,
} from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { canonicalizeIp, getHostIpsFromInfraEnv } from '../staticIp/data/fromInfraEnv';

type OptionalConfigurationsValues = {
  sshPublicKey: string;
  rendezvousIp: string;
  enableNtpSources: boolean;
  additionalNtpSources: string;
};

type OptionalConfigurationsFormProps = {
  isSubmitting: boolean;
};

const isRendezvousIpInStaticHostList = (
  rendezvousIp: string | undefined,
  infraEnv: InfraEnv | undefined,
): boolean => {
  if (!rendezvousIp?.trim()) {
    return true;
  }
  const staticHostIps = getHostIpsFromInfraEnv(infraEnv);
  if (!staticHostIps.length) {
    return true;
  }
  const canonicalRendezvousIp = canonicalizeIp(rendezvousIp.trim());
  return staticHostIps.some((ip) => canonicalizeIp(ip) === canonicalRendezvousIp);
};

const OptionalConfigurationsForm: React.FC<OptionalConfigurationsFormProps> = ({
  isSubmitting,
}) => {
  const { moveBack, disconnectedInfraEnv } = useClusterWizardContext();
  const { isValid, submitForm, errors, touched, values } =
    useFormikContext<OptionalConfigurationsValues>();
  const errorFields = getFormikErrorFields(errors, touched);

  const showRendezvousIpMismatchWarning =
    !!disconnectedInfraEnv?.staticNetworkConfig &&
    !!values.rendezvousIp.trim() &&
    !isRendezvousIpInStaticHostList(values.rendezvousIp, disconnectedInfraEnv);

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          onBack={moveBack}
          isSubmitting={isSubmitting}
          isNextDisabled={!isValid}
          errorFields={errorFields}
        />
      }
    >
      <WithErrorBoundary title="Failed to load Optional configurations step">
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Optional configurations</Content>
          </GridItem>
          <GridItem>
            <Form id="wizard-cluster-optional-config__form">
              <InputField
                label="Rendezvous IP"
                name="rendezvousIp"
                helperText="The IP address that hosts will use to communicate with the bootstrap node during installation."
                maxLength={45}
              />
              {showRendezvousIpMismatchWarning && (
                <Alert
                  isInline
                  variant="warning"
                  title="Rendezvous IP does not match a configured static IP"
                >
                  The rendezvous IP does not match any of the configured static IP addresses. The
                  installation may fail if the rendezvous IP is unreachable.
                </Alert>
              )}
              <UploadSSH />

              <CheckboxField
                label={'Provide additional NTP sources'}
                name="enableNtpSources"
                className="ai-ntp-sources-fields"
                helperText={
                  'Additional NTP sources are added to all hosts to ensure all hosts clocks are synchronized with a valid NTP server.'
                }
                body={
                  values.enableNtpSources && (
                    <Grid hasGutter>
                      <AdditionalNTPSourcesField
                        name="additionalNtpSources"
                        label={'Additional NTP sources'}
                        helperText={
                          'A comma separated list of IP or domain names of the NTP pools or servers.'
                        }
                        isRequired
                      />
                    </Grid>
                  )
                }
              />
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const OptionalConfigurationsStep = () => {
  const { t } = useTranslation();
  const { moveNext, disconnectedInfraEnv, setDisconnectedInfraEnv } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        sshPublicKey: sshPublicKeyValidationSchema(t),
        rendezvousIp: Yup.string()
          .max(45, 'IP address must be at most 45 characters')
          .concat(ipValidationSchema(t)),
        additionalNtpSources: conditionalNtpSourceValidationSchema(t),
      }),
    [t],
  );

  const initialValues: OptionalConfigurationsValues = {
    sshPublicKey: disconnectedInfraEnv?.sshAuthorizedKey ?? '',
    rendezvousIp: disconnectedInfraEnv?.rendezvousIp ?? '',
    enableNtpSources: !!disconnectedInfraEnv?.additionalNtpSources?.trim(),
    additionalNtpSources: disconnectedInfraEnv?.additionalNtpSources ?? '',
  };

  const handleNext = React.useCallback(
    async (values: OptionalConfigurationsValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        if (!disconnectedInfraEnv?.id) {
          throw new Error('No disconnected infraEnv available');
        }

        const { data: updatedInfraEnv } = await InfraEnvsAPI.update(disconnectedInfraEnv.id, {
          sshAuthorizedKey: values.sshPublicKey,
          rendezvousIp: values.rendezvousIp,
          additionalNtpSources: values.enableNtpSources ? values.additionalNtpSources : '',
        });

        setDisconnectedInfraEnv(updatedInfraEnv);
        moveNext();
      } catch (error) {
        handleApiError(error, () => {
          addAlert({
            title: 'Failed to save optional configurations',
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearAlerts, disconnectedInfraEnv, setDisconnectedInfraEnv, addAlert, moveNext],
  );

  return (
    <Formik<OptionalConfigurationsValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => void handleNext(values)}
    >
      <OptionalConfigurationsForm isSubmitting={isSubmitting} />
    </Formik>
  );
};

export default OptionalConfigurationsStep;
