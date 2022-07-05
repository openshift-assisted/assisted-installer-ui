import * as React from 'react';
import { Alert, AlertVariant, FlexItem, Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { SNOControlGroup } from '../clusterConfiguration';
import { StaticTextField } from '../ui/StaticTextField';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';
import { PullSecret } from '../clusters';
import { ManagedDomain } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import {
  CheckboxField,
  InputField,
  RichInputField,
  SelectField,
  ACM_CLUSTER_NAME_VALIDATION_MESSAGES,
} from '../ui/formik';
import DiskEncryptionControlGroup from '../clusterConfiguration/DiskEncryptionFields/DiskEncryptionControlGroup';
import { ClusterDetailsValues } from './types';
import { isSNO } from '../../selectors/clusterSelectors';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type ClusterDetailsFormFieldsProps = {
  canEditPullSecret: boolean;
  forceOpenshiftVersion?: string;
  isNameDisabled?: boolean;
  isBaseDnsDomainDisabled?: boolean;
  defaultPullSecret?: string;
  isOcm: boolean;
  extensionAfter?: { [key: string]: React.ReactElement };
  managedDomains?: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
  toggleRedHatDnsService?: (checked: boolean) => void;
  isPullSecretSet: boolean;
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
      <strong>
        {name || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
      </strong>
    </>
  );
};

export const ClusterDetailsFormFields: React.FC<ClusterDetailsFormFieldsProps> = ({
  managedDomains = [],
  toggleRedHatDnsService,
  canEditPullSecret,
  isNameDisabled,
  isBaseDnsDomainDisabled,
  versions,
  defaultPullSecret,
  forceOpenshiftVersion,
  extensionAfter,
  isOcm, // TODO(mlibra): make it optional, false by default
  isPullSecretSet,
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { name, baseDnsDomain, highAvailabilityMode, useRedHatDnsService } = values;
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
  const atListOneDiskEncryptionEnableOn =
    values.enableDiskEncryptionOnMasters || values.enableDiskEncryptionOnWorkers;

  const { t } = useTranslation();
  // TODO(mlibra): Disable fields based on props passed from the caller context. In CIM, the name or domain can not be edited.
  return (
    <Form id="wizard-cluster-details__form">
      <RichInputField
        ref={nameInputRef}
        label={t('ai:Cluster name')}
        name="name"
        placeholder={isOcm ? '' : t('ai:Enter cluster name')}
        isDisabled={isNameDisabled}
        richValidationMessages={ACM_CLUSTER_NAME_VALIDATION_MESSAGES}
        isRequired
      />
      {extensionAfter?.['name'] && extensionAfter['name']}
      {!!managedDomains.length && toggleRedHatDnsService && (
        <CheckboxField
          name="useRedHatDnsService"
          label={t('ai:Use a temporary 60-day domain')}
          helperText={t(
            'ai:A base domain will be provided for temporary, non-production clusters.',
          )}
          onChange={toggleRedHatDnsService}
        />
      )}
      {useRedHatDnsService ? (
        <SelectField
          label={t('ai:Base domain')}
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          options={managedDomains.map((d) => ({
            label: `${d.domain} (${d.provider})`,
            value: d.domain,
          }))}
          isRequired
        />
      ) : (
        <InputField
          label={t('ai:Base domain')}
          name="baseDnsDomain"
          helperText={<BaseDnsHelperText name={name} baseDnsDomain={baseDnsDomain} />}
          placeholder="example.com"
          isDisabled={isBaseDnsDomainDisabled || useRedHatDnsService}
          isRequired
        />
      )}
      {forceOpenshiftVersion ? (
        <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
          {t('ai:OpenShift')} {forceOpenshiftVersion}
        </StaticTextField>
      ) : (
        <OpenShiftVersionSelect versions={versions} />
      )}
      <SNOControlGroup versions={versions} highAvailabilityMode={highAvailabilityMode} />
      {extensionAfter?.['openshiftVersion'] && extensionAfter['openshiftVersion']}
      {canEditPullSecret && <PullSecret isOcm={isOcm} defaultPullSecret={defaultPullSecret} />}
      {extensionAfter?.['pullSecret'] && extensionAfter['pullSecret']}
      {isOcm && (
        <DiskEncryptionControlGroup
          values={values}
          isDisabled={isPullSecretSet}
          isSNO={isSNO({ highAvailabilityMode })}
        />
      )}

      {atListOneDiskEncryptionEnableOn && values.diskEncryptionMode === 'tpmv2' && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={
            <FlexItem>
              {t(
                'ai:To use this encryption method, enable TPMv2 encryption in the BIOS of each selected host.',
              )}
            </FlexItem>
          }
        />
      )}
      {atListOneDiskEncryptionEnableOn && values.diskEncryptionMode === 'tang' && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={
            <FlexItem>
              {t(
                'ai:The use of Tang encryption mode to encrypt your disks is only supported for bare metal or vSphere installations on user-provisioned infrastructure.',
              )}
            </FlexItem>
          }
        />
      )}
    </Form>
  );
};
