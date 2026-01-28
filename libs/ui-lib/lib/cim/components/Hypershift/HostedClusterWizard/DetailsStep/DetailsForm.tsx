import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import {
  InputField,
  OpenShiftVersionDropdown,
  OpenShiftVersionModal,
  PullSecret,
} from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { BaseDnsHelperText } from '../../../ClusterDeployment/clusterDetails/ClusterDetailsFormFields';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { DetailsFormProps, DetailsFormValues } from './types';

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

  const additionalSelectOption = React.useMemo(() => {
    if (
      values.customOpenshiftSelect &&
      !ocpVersions.some((option) => option.value === values.customOpenshiftSelect)
    ) {
      return allVersions.find((version) => version.value === values.customOpenshiftSelect);
    }
    return undefined;
  }, [allVersions, ocpVersions, values.customOpenshiftSelect]);

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
        versions={ocpVersions}
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

      <PullSecret />
    </Form>
  );
};

export default DetailsForm;
