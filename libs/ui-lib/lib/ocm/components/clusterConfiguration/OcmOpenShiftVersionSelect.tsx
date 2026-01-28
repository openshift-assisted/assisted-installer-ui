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

  const customItem = React.useMemo(() => {
    if (
      customOpenshiftSelect &&
      !versions.some((version) => version.value === customOpenshiftSelect)
    ) {
      return allVersions.find((version) => version.value === customOpenshiftSelect);
    }
    return undefined;
  }, [allVersions, customOpenshiftSelect, versions]);

  const getHelperText = (value: string | null, inModal?: boolean) => {
    return getOpenshiftVersionHelperText(allVersions, value, t, inModal);
  };

  return (
    <>
      <OpenShiftVersionDropdown
        name="openshiftVersion"
        versions={versions}
        getHelperText={getHelperText}
        showReleasesLink={isInOcm}
        showOpenshiftVersionModal={() => setIsOpenshiftVersionModalOpen(true)}
        customVersion={customItem}
      />
      {isOpenshiftVersionModalOpen && (
        <OpenShiftVersionModal
          allVersions={allVersions}
          onClose={() => setIsOpenshiftVersionModalOpen(false)}
          getHelperText={getHelperText}
        />
      )}
    </>
  );
};

export default OcmOpenShiftVersionSelect;
