import * as React from 'react';
import {
  Grid,
  GridItem,
  Content,
  Flex,
  Form,
  FormGroup,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Spinner,
  HelperText,
  HelperTextItem,
  FormHelperText,
} from '@patternfly/react-core';
import {
  ClusterWizardStep,
  TechnologyPreview,
  StaticTextField,
  WithErrorBoundary,
} from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardNavigation, ClusterWizardFooter } from '../../wizardComponents';
import { InstallDisconnectedSwitch } from './InstallDisconnectedSwitch';
import { useOpenShiftVersionsContext } from '../../../../contexts/OpenShiftVersionsContext';
import { DISCONNECTED_OPENSHIFT_VERSION } from './constants';

export { DISCONNECTED_OPENSHIFT_VERSION };

const VERSION_FILTER_REGEX = new RegExp(String.raw`^${DISCONNECTED_OPENSHIFT_VERSION}(\..*)?$`);

export const BasicStep = () => {
  const { moveNext, disconnectedOpenshiftVersion, setDisconnectedOpenshiftVersion } =
    useClusterWizardContext();
  const { allVersions, loading } = useOpenShiftVersionsContext();
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = React.useState(false);

  const disconnectedVersions = React.useMemo(
    () => allVersions.filter((v) => VERSION_FILTER_REGEX.test(v.value)),
    [allVersions],
  );

  React.useEffect(() => {
    if (
      disconnectedVersions.length > 0 &&
      !disconnectedVersions.some((v) => v.value === disconnectedOpenshiftVersion)
    ) {
      const defaultVersion = disconnectedVersions.find((v) => v.default) ?? disconnectedVersions[0];
      setDisconnectedOpenshiftVersion(defaultVersion.value);
    }
  }, [disconnectedVersions, disconnectedOpenshiftVersion, setDisconnectedOpenshiftVersion]);

  const dropdownToggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsVersionDropdownOpen((prev) => !prev)}
      isExpanded={isVersionDropdownOpen}
      isDisabled={loading || disconnectedVersions.length === 0}
      data-testid="disconnected-version-dropdown-toggle"
    >
      {disconnectedOpenshiftVersion}
    </MenuToggle>
  );

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={<ClusterWizardFooter onNext={moveNext} />}
    >
      <WithErrorBoundary title="Failed to load Basic step">
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Basic information</Content>
          </GridItem>
          <GridItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <InstallDisconnectedSwitch />
              <span>I'm installing on a disconnected/air-gapped/secured environment</span>
              <TechnologyPreview />
            </Flex>
          </GridItem>
          <GridItem>
            <Form id="wizard-cluster-basic-info__form">
              <FormGroup label="OpenShift version" fieldId="disconnected-openshift-version">
                {loading ? (
                  <Spinner size="md" />
                ) : (
                  <Dropdown
                    id="disconnected-openshift-version-dropdown"
                    isOpen={isVersionDropdownOpen}
                    onSelect={(_, value) => {
                      if (value) {
                        setDisconnectedOpenshiftVersion(value as string);
                      }
                      setIsVersionDropdownOpen(false);
                    }}
                    onOpenChange={() => setIsVersionDropdownOpen(false)}
                    toggle={dropdownToggle}
                  >
                    {disconnectedVersions.map((v) => (
                      <DropdownItem key={v.value} value={v.value}>
                        {v.version}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                )}
                {!loading && disconnectedVersions.length === 0 && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="warning">
                        No versions available for OpenShift {DISCONNECTED_OPENSHIFT_VERSION}.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
              </FormGroup>
              <StaticTextField name="cpuArchitecture" label="CPU architecture">
                x86_64
              </StaticTextField>
            </Form>
          </GridItem>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};
