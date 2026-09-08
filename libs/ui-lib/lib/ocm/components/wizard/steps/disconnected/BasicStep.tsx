import * as React from 'react';
import * as Yup from 'yup';
import { Formik, useFormikContext } from 'formik';
import { Alert, AlertVariant, Grid, GridItem, Content, Flex, Form } from '@patternfly/react-core';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import OfflineOpenshiftVersionsAPI from '../../../../../common/api/assisted-service/OfflineOpenshiftVersionsAPI';
import {
  ClusterWizardStep,
  StaticTextField,
  WithErrorBoundary,
  LoadingState,
  SelectField,
  getKeys,
  handleApiError,
  getApiErrorMessage,
  OpenshiftVersionOptionType,
  CpuArchitecture,
} from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { InstallDisconnectedSwitch } from './InstallDisconnectedSwitch';

export const DISCONNECTED_BASE_VERSION = '4.22';

type BasicStepValues = {
  openshiftVersion: string;
};

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

type BasicStepFormProps = {
  versions: OpenshiftVersionOptionType[];
  loading: boolean;
  error?: string;
};

const BasicStepForm: React.FC<BasicStepFormProps> = ({ versions, loading, error }) => {
  const { setDisconnectedOpenshiftVersion } = useClusterWizardContext();
  const { values, setFieldValue, isValid, submitForm } = useFormikContext<BasicStepValues>();

  React.useEffect(() => {
    if (!values.openshiftVersion && versions.length > 0) {
      const defaultVersion =
        versions.find((version) => version.default) ?? versions[versions.length - 1];
      void setFieldValue('openshiftVersion', defaultVersion.value);
    }
  }, [values.openshiftVersion, versions, setFieldValue]);

  React.useEffect(() => {
    if (values.openshiftVersion) {
      setDisconnectedOpenshiftVersion(values.openshiftVersion);
    }
  }, [values.openshiftVersion, setDisconnectedOpenshiftVersion]);

  const selectedVersionItem = versions.find((version) => version.value === values.openshiftVersion);
  const cpuArchitecture = selectedVersionItem?.cpuArchitectures?.[0] ?? 'x86_64';

  const selectOptions = versions.map((version) => ({
    value: version.value,
    label: version.version,
  }));

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => void submitForm()}
          isNextDisabled={loading || !!error || !isValid || !values.openshiftVersion}
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
          <GridItem span={12} lg={10} xl={9} xl2={7}>
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
                <SelectField
                  name="openshiftVersion"
                  label="OpenShift version"
                  options={selectOptions}
                  isRequired
                />
                <StaticTextField name="cpuArchitecture" label="CPU architecture">
                  {cpuArchitecture}
                </StaticTextField>
              </Form>
            )}
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export const BasicStep = () => {
  const { moveNext, disconnectedOpenshiftVersion } = useClusterWizardContext();
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const { data } = await OfflineOpenshiftVersionsAPI.list(DISCONNECTED_BASE_VERSION);
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

  return (
    <Formik<BasicStepValues>
      initialValues={{ openshiftVersion: disconnectedOpenshiftVersion }}
      validationSchema={Yup.object({
        openshiftVersion: Yup.string().required('OpenShift version is required'),
      })}
      validateOnMount
      onSubmit={() => moveNext()}
    >
      <BasicStepForm versions={versions} loading={loading} error={error} />
    </Formik>
  );
};
