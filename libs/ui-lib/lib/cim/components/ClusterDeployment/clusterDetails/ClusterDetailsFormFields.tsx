import * as React from 'react';
import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import {
  acmClusterNameValidationMessages,
  ExternalPlatformsDropdown,
  isMajorMinorVersionEqualOrGreater,
  OpenShiftVersionDropdown,
  OpenShiftVersionModal,
} from '../../../../common';
import { StaticTextField } from '../../../../common/components/ui/StaticTextField';
import { PullSecret } from '../../../../common/components/clusters';
import { OpenshiftVersionOptionType, SupportedCpuArchitecture } from '../../../../common/types';
import { InputField, RichInputField } from '../../../../common/components/ui/formik';
import { ClusterDetailsValues } from '../../../../common/components/clusterWizard/types';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import CpuArchitectureDropdown from '../../common/CpuArchitectureDropdown';
import ControlPlaneNodesDropdown from '../../../../common/components/clusterConfiguration/ControlPlaneNodesDropdown';
import { getNetworkType } from '../../helpers';

export type ClusterDetailsFormFieldsProps = {
  isEditFlow: boolean;
  extensionAfter?: { [key: string]: React.ReactElement };
  versions: OpenshiftVersionOptionType[];
  allVersions: OpenshiftVersionOptionType[];
  isNutanix?: boolean;
  cpuArchitectures?: SupportedCpuArchitecture[];
  allowHighlyAvailable?: boolean;
};

export const BaseDnsHelperText: React.FC<{ name?: string; baseDnsDomain?: string }> = ({
  name,
  baseDnsDomain,
}) => {
  const { t } = useTranslation();
  return (
    <>
      {t(
        'ai:All DNS records must be subdomains of this base and include the cluster name. This cannot be changed after cluster installation. The full cluster address will be:',
      )}{' '}
      <br />
      <span className="pf-v6-u-font-weight-bold">
        {name || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
      </span>
    </>
  );
};

export const ClusterDetailsFormFields: React.FC<ClusterDetailsFormFieldsProps> = ({
  isEditFlow,
  versions,
  allVersions,
  extensionAfter,
  isNutanix,
  cpuArchitectures,
  allowHighlyAvailable,
}) => {
  const { t } = useTranslation();
  const nameInputRef = React.useRef<HTMLInputElement>();
  const [openshiftVersionModalOpen, setOpenshiftVersionModalOpen] = React.useState(false);
  const { values, setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const { name, baseDnsDomain } = values;

  React.useEffect(() => {
    if (!versions.length && !values.openshiftVersion && !isEditFlow) {
      const fallbackOpenShiftVersion = allVersions.find((version) => version.default);
      setFieldValue('customOpenshiftSelect', fallbackOpenShiftVersion?.value);
      setFieldValue('openshiftVersion', fallbackOpenShiftVersion?.value);
      setFieldValue('networkType', getNetworkType(fallbackOpenShiftVersion));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const additionalSelectOption = React.useMemo(() => {
    if (
      values.customOpenshiftSelect &&
      !versions.some((version) => version.value === values.customOpenshiftSelect)
    ) {
      return allVersions.find((option) => option.value === values.customOpenshiftSelect);
    }
    return undefined;
  }, [allVersions, values.customOpenshiftSelect, versions]);

  const allowTNA = React.useMemo(() => {
    const current =
      values.customOpenshiftSelect ||
      versions.find((version) => version.value === values.openshiftVersion)?.version;

    return isMajorMinorVersionEqualOrGreater(current, '4.19') && values.platform === 'baremetal';
  }, [values.customOpenshiftSelect, values.openshiftVersion, values.platform, versions]);

  return (
    <Form id="wizard-cluster-details__form">
      {isEditFlow ? (
        <StaticTextField name="name" label={t('ai:Cluster name')} isRequired>
          {name}
        </StaticTextField>
      ) : (
        <RichInputField
          ref={nameInputRef}
          label={t('ai:Cluster name')}
          name="name"
          placeholder={t('ai:Enter cluster name')}
          richValidationMessages={acmClusterNameValidationMessages(t)}
          isRequired
        />
      )}
      {extensionAfter?.['name'] && extensionAfter['name']}
      {isEditFlow ? (
        <StaticTextField
          name="baseDnsDomain"
          label={t('ai:Base domain')}
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          isRequired
        >
          {baseDnsDomain}
        </StaticTextField>
      ) : (
        <InputField
          label={t('ai:Base domain')}
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          placeholder="example.com"
          isRequired
        />
      )}
      {isEditFlow ? (
        <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
          {t('ai:OpenShift')}{' '}
          {allVersions.find((v) => v.value === values.openshiftVersion)?.version ||
            values.openshiftVersion}
        </StaticTextField>
      ) : (
        <>
          <OpenShiftVersionDropdown
            name="openshiftVersion"
            versions={versions}
            showReleasesLink={false}
            showOpenshiftVersionModal={() => setOpenshiftVersionModalOpen(true)}
            customVersion={additionalSelectOption}
          />
          {openshiftVersionModalOpen && (
            <OpenShiftVersionModal
              allVersions={allVersions}
              onClose={() => setOpenshiftVersionModalOpen(false)}
            />
          )}
        </>
      )}
      <ControlPlaneNodesDropdown
        isDisabled={isEditFlow}
        allowHighlyAvailable={allowHighlyAvailable}
        allowTNA={allowTNA}
      />
      {!isNutanix && (
        <CpuArchitectureDropdown cpuArchitectures={cpuArchitectures} isDisabled={isEditFlow} />
      )}

      <ExternalPlatformsDropdown isDisabled={isEditFlow} />

      {extensionAfter?.['openshiftVersion'] && extensionAfter['openshiftVersion']}

      {!isEditFlow && <PullSecret />}

      {extensionAfter?.['pullSecret'] && extensionAfter['pullSecret']}
    </Form>
  );
};
