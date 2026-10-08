import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { Alert, AlertVariant, Grid, GridItem, Content, Flex, Form } from '@patternfly/react-core';
import { ImageType, OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import OfflineOpenshiftVersionsAPI from '../../../../../common/api/assisted-service/OfflineOpenshiftVersionsAPI';
import {
  ClusterWizardStep,
  StaticTextField,
  WithErrorBoundary,
  useAlerts,
  ClustersAPI,
  InfraEnvsAPI,
  handleApiError,
  getApiErrorMessage,
  isInOcm,
  PullSecret,
  pullSecretValidationSchema,
  useTranslation,
  getFormikErrorFields,
  LoadingState,
  OpenShiftVersionDropdown,
  getKeys,
  OpenshiftVersionOptionType,
  CpuArchitecture,
} from '../../../../../common';
import { usePullSecret } from '../../../../hooks';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { HostsNetworkConfigurationControlGroup } from '../clusterDetails/fields/HostsNetworkConfigurationControlGroup';
import { HostsNetworkConfigurationType } from '../../../../services/types';
import { getDummyInfraEnvField } from '../staticIp/data/dummyData';
import { getStaticNetworkConfig } from '../staticIp/data/fromInfraEnv';
import { InstallDisconnectedSwitch } from './InstallDisconnectedSwitch';

const DISCONNECTED_IMAGE_TYPE: ImageType = 'disconnected-iso';
const DISCONNECTED_CLUSTER_NAME = 'disconnected-cluster';

const sortVersions = (versions: OpenshiftVersionOptionType[]) =>
  [...versions].sort((version1, version2) =>
    version1.value.localeCompare(version2.value, undefined, { numeric: true }),
  );

const mapOfflineVersions = (
  data: Record<string, OpenshiftVersion>,
): OpenshiftVersionOptionType[] => {
  const versions = getKeys(data).map((key) => {
    const versionItem = data[key];
    const version = versionItem.displayName;

    return {
      label: `OpenShift ${version}`,
      value: String(key),
      version,
      default: Boolean(versionItem.default),
      supportLevel: versionItem.supportLevel,
      cpuArchitectures: versionItem.cpuArchitectures as CpuArchitecture[],
    } satisfies OpenshiftVersionOptionType;
  });

  return sortVersions(versions);
};

type BasicStepValues = {
  openshiftVersion: string;
  hostsNetworkConfigurationType: HostsNetworkConfigurationType;
  pullSecret: string;
};

type BasicStepFormProps = {
  isSubmitting: boolean;
  defaultPullSecret?: string;
  versions: OpenshiftVersionOptionType[];
  loading: boolean;
  error?: string;
};

const BasicStepForm: React.FC<BasicStepFormProps> = ({
  isSubmitting,
  defaultPullSecret,
  versions,
  loading,
  error,
}) => {
  const { setDisconnectedOpenshiftVersion } = useClusterWizardContext();
  const { submitForm, isValid, errors, touched, values } = useFormikContext<BasicStepValues>();
  const errorFields = getFormikErrorFields(errors, touched);

  React.useEffect(() => {
    if (values.openshiftVersion) {
      setDisconnectedOpenshiftVersion(values.openshiftVersion);
    }
  }, [values.openshiftVersion, setDisconnectedOpenshiftVersion]);

  const selectedVersionItem = versions.find((version) => version.value === values.openshiftVersion);
  const cpuArchitecture = selectedVersionItem?.cpuArchitectures?.[0] ?? 'x86_64';

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          isSubmitting={isSubmitting}
          isNextDisabled={
            loading || !!error || !isValid || isSubmitting || !values.openshiftVersion
          }
          errorFields={errorFields}
        />
      }
    >
      <WithErrorBoundary title="Failed to load Basic step">
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Basic information</Content>
          </GridItem>
          <GridItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <InstallDisconnectedSwitch />
            </Flex>
          </GridItem>
          <GridItem>
            {loading && <LoadingState />}
            {error && (
              <Alert
                isInline
                variant={AlertVariant.danger}
                title="Failed to retrieve list of supported OpenShift versions."
              >
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <Form id="wizard-cluster-basic-info__form">
                <OpenShiftVersionDropdown
                  name="openshiftVersion"
                  versions={versions}
                  showReleasesLink={false}
                  showOpenshiftVersionModal={() => {
                    /* no-op — all offline versions are already shown */
                  }}
                />
                <StaticTextField name="cpuArchitecture" label="CPU architecture">
                  {cpuArchitecture}
                </StaticTextField>
                <HostsNetworkConfigurationControlGroup clusterExists={false} isDisabled={false} />
                {!isInOcm && <PullSecret isOcm={false} defaultPullSecret={defaultPullSecret} />}
              </Form>
            )}
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const BasicStep = () => {
  const { t } = useTranslation();
  const {
    moveNext,
    disconnectedCluster,
    setDisconnectedCluster,
    disconnectedInfraEnv,
    setDisconnectedInfraEnv,
    disconnectedOpenshiftVersion,
  } = useClusterWizardContext();
  const { addAlert, clearAlerts } = useAlerts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const defaultPullSecret = usePullSecret();

  React.useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const { data } = await OfflineOpenshiftVersionsAPI.list();
        const mappedVersions = mapOfflineVersions(data);
        setVersions(mappedVersions);
        if (mappedVersions.length === 0) {
          setError('No OpenShift versions available.');
        }
      } catch (e) {
        handleApiError(e, (err) => {
          setError(getApiErrorMessage(err));
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchVersions();
  }, []);

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        openshiftVersion: Yup.string().required('OpenShift version is required'),
        pullSecret: isInOcm ? Yup.string() : pullSecretValidationSchema(t),
      }),
    [t],
  );

  const initialValues: BasicStepValues = {
    openshiftVersion: disconnectedOpenshiftVersion,
    hostsNetworkConfigurationType: disconnectedInfraEnv?.staticNetworkConfig
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP,
    pullSecret: defaultPullSecret ?? '',
  };

  const handleNext = React.useCallback(
    async (values: BasicStepValues) => {
      clearAlerts();
      setIsSubmitting(true);
      try {
        const isStatic =
          values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC;
        let infraEnvToUse = disconnectedInfraEnv;

        if (!disconnectedCluster?.id || !infraEnvToUse?.id) {
          const { data: cluster } = await ClustersAPI.registerDisconnected({
            name: DISCONNECTED_CLUSTER_NAME,
            openshiftVersion: values.openshiftVersion,
          });
          setDisconnectedCluster(cluster);

          const pullSecret = isInOcm ? defaultPullSecret ?? '' : values.pullSecret;
          const { data: createdInfraEnv } = await InfraEnvsAPI.register({
            name: 'disconnected-infra-env',
            pullSecret,
            clusterId: cluster.id,
            imageType: DISCONNECTED_IMAGE_TYPE,
            openshiftVersion: values.openshiftVersion,
            staticNetworkConfig: isStatic ? getDummyInfraEnvField() : undefined,
          });
          infraEnvToUse = createdInfraEnv;
        } else {
          const staticNetworkConfig = isStatic
            ? getStaticNetworkConfig(infraEnvToUse) ?? getDummyInfraEnvField()
            : [];
          const { data: updatedInfraEnv } = await InfraEnvsAPI.update(infraEnvToUse.id, {
            staticNetworkConfig,
          });
          infraEnvToUse = updatedInfraEnv;
        }

        setDisconnectedInfraEnv(infraEnvToUse);
        moveNext();
      } catch (error) {
        handleApiError(error, () => {
          addAlert({
            title: 'Failed to save basic information',
            message: getApiErrorMessage(error),
            variant: AlertVariant.danger,
          });
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      clearAlerts,
      defaultPullSecret,
      disconnectedCluster,
      disconnectedInfraEnv,
      setDisconnectedCluster,
      setDisconnectedInfraEnv,
      addAlert,
      moveNext,
    ],
  );

  return (
    <Formik<BasicStepValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnMount
      onSubmit={(values) => void handleNext(values)}
    >
      <BasicStepForm
        isSubmitting={isSubmitting}
        defaultPullSecret={defaultPullSecret}
        versions={versions}
        loading={loading}
        error={error}
      />
    </Formik>
  );
};

export default BasicStep;
