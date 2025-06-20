import React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  OpenshiftVersionOptionType,
  ClusterDetailsValues,
  OpenShiftVersionDropdown,
  OpenShiftVersionModal,
} from '../../../common';
import { isInOcm } from '../../../common/api';
import { useFormikContext } from 'formik';
import { getOpenshiftVersionHelperText } from './OpenshiftVersionHelperText';
import { useOpenShiftVersionsContext } from '../clusterWizard/OpenShiftVersionsContext';

type OcmOpenShiftVersionSelectProps = {
  versions: OpenshiftVersionOptionType[];
};
const OcmOpenShiftVersionSelect = ({ versions }: OcmOpenShiftVersionSelectProps) => {
  const { t } = useTranslation();
  const {
    values: { customOpenshiftSelect },
  } = useFormikContext<ClusterDetailsValues>();
  const selectOptions = React.useMemo(
    () =>
      versions.map((version) => ({
        label:
          version.supportLevel === 'beta'
            ? version.label + ' - ' + t('ai:Developer preview release')
            : version.label,
        // This is the "key" from openshift-versions API response
        // It can either be in the long or short (for default versions) form
        value: version.value,
      })),
    [versions, t],
  );
  const [isOpenshiftVersionModalOpen, setIsOpenshiftVersionModalOpen] = React.useState(false);

  const showOpenshiftVersionModal = () => {
    setIsOpenshiftVersionModalOpen(true);
  };

  const updatedSelectOptions = React.useMemo(() => {
    if (
      customOpenshiftSelect &&
      !selectOptions.find((option) => option.value === customOpenshiftSelect.value)
    ) {
      return [
        {
          label: customOpenshiftSelect.label,
          value: customOpenshiftSelect.value,
        },
      ];
    }
    return [];
  }, [selectOptions, customOpenshiftSelect]);

  const { allVersions } = useOpenShiftVersionsContext();

  const getHelperText = (value: string | undefined, inModal?: boolean) => {
    return getOpenshiftVersionHelperText(allVersions, value, t, inModal);
  };

  return (
    <>
      <OpenShiftVersionDropdown
        name="openshiftVersion"
        items={selectOptions}
        versions={versions}
        getHelperText={getHelperText}
        showReleasesLink={isInOcm}
        showOpenshiftVersionModal={showOpenshiftVersionModal}
        customItems={updatedSelectOptions}
      />
      {isOpenshiftVersionModalOpen && (
        <OpenShiftVersionModal
          allVersions={allVersions}
          setOpenshiftVersionModalOpen={setIsOpenshiftVersionModalOpen}
          getHelperText={getHelperText}
        />
      )}
    </>
  );
};

export default OcmOpenShiftVersionSelect;
