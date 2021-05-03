import React from 'react';
import { useFormikContext } from 'formik';
import { OpenshiftVersionOptionType } from '../../types/versions';
import SNODisclaimer from './SNODisclaimer';
import SingleNodeCheckbox from '../ui/formik/SingleNodeCheckbox';
import { ClusterCreateParams } from '../../api/types';

type SNOControlGroupProps = {
  isDisabled: boolean;
  versions: OpenshiftVersionOptionType[];
};

const SNOControlGroup = ({ versions, isDisabled }: SNOControlGroupProps) => {
  const { values } = useFormikContext<ClusterCreateParams>();
  return (
    <>
      <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} isDisabled={isDisabled} />
      {values.highAvailabilityMode === 'None' && <SNODisclaimer isDisabled={isDisabled} />}
    </>
  );
};

export default SNOControlGroup;
