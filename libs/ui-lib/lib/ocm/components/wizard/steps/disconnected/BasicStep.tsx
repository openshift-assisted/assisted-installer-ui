import * as React from 'react';
import {
  Alert,
  AlertVariant,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  Content,
  Flex,
  Form,
} from '@patternfly/react-core';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import OfflineOpenshiftVersionsAPI from '../../../../../common/api/assisted-service/OfflineOpenshiftVersionsAPI';
import {
  ClusterWizardStep,
  StaticTextField,
  WithErrorBoundary,
  LoadingState,
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

export const BasicStep = () => {
  const { moveNext, disconnectedOpenshiftVersion, setDisconnectedOpenshiftVersion } =
    useClusterWizardContext();
  const [versions, setVersions] = React.useState<OpenshiftVersionOptionType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const [selectedVersion, setSelectedVersion] = React.useState<string>(
    disconnectedOpenshiftVersion,
  );

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

  React.useEffect(() => {
    if (!selectedVersion && versions.length > 0) {
      const defaultVersion =
        versions.find((version) => version.default) ?? versions[versions.length - 1];
      setSelectedVersion(defaultVersion.value);
    }
  }, [selectedVersion, versions]);

  React.useEffect(() => {
    if (selectedVersion) {
      setDisconnectedOpenshiftVersion(selectedVersion);
    }
  }, [selectedVersion, setDisconnectedOpenshiftVersion]);

  const selectedVersionItem = versions.find((version) => version.value === selectedVersion);
  const cpuArchitecture = selectedVersionItem?.cpuArchitectures?.[0] ?? 'x86_64';

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={moveNext}
          isNextDisabled={loading || !!error || !selectedVersion}
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
                <FormGroup
                  fieldId="disconnected-openshift-version"
                  label="OpenShift version"
                  isRequired
                >
                  <FormSelect
                    id="disconnected-openshift-version"
                    value={selectedVersion}
                    onChange={(_event, value) => setSelectedVersion(value)}
                    isRequired
                    aria-label="OpenShift version"
                  >
                    {versions.map((version) => (
                      <FormSelectOption
                        key={version.value}
                        value={version.value}
                        label={version.version}
                      />
                    ))}
                  </FormSelect>
                </FormGroup>
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
