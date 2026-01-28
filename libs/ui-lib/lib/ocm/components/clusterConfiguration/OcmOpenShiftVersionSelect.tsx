import React from 'react';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  OpenshiftVersionOptionType,
  ClusterDetailsValues,
  OpenShiftVersionDropdown,
  OpenShiftVersionModal,
  getComparableVersionInt,
} from '../../../common';
import { isInOcm } from '../../../common/api';
import { useFormikContext } from 'formik';
import { getOpenshiftVersionHelperText } from './OpenshiftVersionHelperText';
import { useOpenShiftVersionsContext } from '../clusterWizard/OpenShiftVersionsContext';

const filterMinVersions = (versions: OpenshiftVersionOptionType[], minVersion: number) =>
  versions.filter((v) => getComparableVersionInt(v.value) >= minVersion);

type OcmOpenShiftVersionSelectProps = {
  minVersionAllowed?: number;
};
const OcmOpenShiftVersionSelect = ({ minVersionAllowed }: OcmOpenShiftVersionSelectProps) => {
  const { t } = useTranslation();
  const {
    values: { customOpenshiftSelect },
  } = useFormikContext<ClusterDetailsValues>();
  const versionsCtx = useOpenShiftVersionsContext();

  const allVersions = minVersionAllowed
    ? filterMinVersions(versionsCtx.allVersions, minVersionAllowed)
    : versionsCtx.allVersions;
  const versions = minVersionAllowed
    ? filterMinVersions(versionsCtx.latestVersions, minVersionAllowed)
    : versionsCtx.latestVersions;

  const [isOpenshiftVersionModalOpen, setIsOpenshiftVersionModalOpen] = React.useState(false);

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

  const updatedSelectOptions = React.useMemo(() => {
    if (
      customOpenshiftSelect &&
      !selectOptions.some((version) => version.value === customOpenshiftSelect)
    ) {
      return allVersions.find((version) => version.value === customOpenshiftSelect);
    }
    return undefined;
  }, [allVersions, customOpenshiftSelect, selectOptions]);

  const getHelperText = (value: string | null, inModal?: boolean) => {
    return getOpenshiftVersionHelperText(allVersions, value, t, inModal);
  };

  const showOpenshiftVersionModal = () => {
    setIsOpenshiftVersionModalOpen(true);
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
        customItem={updatedSelectOptions}
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
