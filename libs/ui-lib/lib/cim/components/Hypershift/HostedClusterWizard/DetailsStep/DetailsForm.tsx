import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { InputField, PullSecret } from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { BaseDnsHelperText } from '../../../ClusterDeployment/ClusterDetailsFormFields';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { DetailsFormProps, DetailsFormValues } from './types';
import { OpenShiftVersionDropdown } from '../../../../../common/components/ui/OpenShiftVersionDropdown';
import { OpenShiftVersionModal } from '../../../../../common/components/ui/OpenShiftVersionModal';

const DetailsForm: React.FC<DetailsFormProps> = ({
  onValuesChanged,
  extensionAfter,
  ocpVersions,
  allVersions,
}) => {
  const { t } = useTranslation();
  const [openshiftVersionModalOpen, setOpenshiftVersionModalOpen] = React.useState(false);
  const { values } = useFormikContext<DetailsFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const selectOptions = React.useMemo(
    () =>
      ocpVersions.map((version) => ({
        label: version.label,
        value: version.value,
      })),
    [ocpVersions],
  );

  const additionalSelectOptions = React.useMemo(() => {
    if (
      values.customOpenshiftSelect &&
      !selectOptions.some((option) => option.value === values.customOpenshiftSelect?.value)
    ) {
      return [
        {
          value: values.customOpenshiftSelect.value,
          label: values.customOpenshiftSelect.label,
        },
      ];
    }
    return [];
  }, [selectOptions, values.customOpenshiftSelect]);

  return (
    <Form>
      <InputField
        ref={nameInputRef}
        label={t('ai:Cluster name')}
        name="name"
        placeholder={t('ai:Enter cluster name')}
        isRequired
      />
      {extensionAfter?.['name'] && extensionAfter['name']}
      <InputField
        label={t('ai:Base domain')}
        name="baseDnsDomain"
        helperText={<BaseDnsHelperText name={values.name} baseDnsDomain={values.baseDnsDomain} />}
        placeholder="example.com"
        isRequired
      />
      <OpenShiftVersionDropdown
        name="openshiftVersion"
        items={selectOptions}
        versions={ocpVersions}
        showReleasesLink={false}
        showOpenshiftVersionModal={() => setOpenshiftVersionModalOpen(true)}
        customItems={additionalSelectOptions}
      />
      {openshiftVersionModalOpen && (
        <OpenShiftVersionModal
          allVersions={allVersions}
          setOpenshiftVersionModalOpen={setOpenshiftVersionModalOpen}
        />
      )}

      <PullSecret />
    </Form>
  );
};

export default DetailsForm;
