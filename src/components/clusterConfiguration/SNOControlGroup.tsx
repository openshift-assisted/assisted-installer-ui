import React from 'react';
import { OpenshiftVersionOptionType } from '../../types/versions';
import SNODisclaimer from './SNODisclaimer';
import SingleNodeCheckbox from '../ui/formik/SingleNodeCheckbox';
import { ClusterDetailsValues } from '../clusterWizard/types';

type SNOControlGroupProps = {
  isDisabled: boolean;
  versions: OpenshiftVersionOptionType[];
  highAvailabilityMode: ClusterDetailsValues['highAvailabilityMode'];
};

const SNOControlGroup = ({ versions, highAvailabilityMode, isDisabled }: SNOControlGroupProps) => (
  <>
    <SingleNodeCheckbox name="highAvailabilityMode" versions={versions} isDisabled={isDisabled} />
    {highAvailabilityMode === 'None' && <SNODisclaimer isDisabled={isDisabled} />}
  </>
);

export default SNOControlGroup;
