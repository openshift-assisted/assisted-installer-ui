import { Form } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import {
  BaseDnsHelperText,
  InputField,
  OpenShiftVersionSelect,
  PullSecret,
} from '../../../../../common';
import { getOCPVersions } from '../../../helpers';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { DetailsFormProps, DetailsFormValues } from './types';

const DetailsForm: React.FC<DetailsFormProps> = ({
  onValuesChanged,
  extensionAfter,
  clusterImages,
}) => {
  const { values } = useFormikContext<DetailsFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const ocpVersions = React.useMemo(() => getOCPVersions(clusterImages), [clusterImages]);

  return (
    <Form>
      <InputField
        ref={nameInputRef}
        label="Cluster name"
        name="name"
        placeholder="Enter cluster name"
        isRequired
      />
      {extensionAfter?.['name'] && extensionAfter['name']}
      <InputField
        label="Base domain"
        name="baseDnsDomain"
        helperText={<BaseDnsHelperText name={values.name} baseDnsDomain={values.baseDnsDomain} />}
        placeholder="example.com"
        isRequired
      />
      <OpenShiftVersionSelect versions={ocpVersions} />
      <PullSecret isOcm={false} />
    </Form>
  );
};

export default DetailsForm;
