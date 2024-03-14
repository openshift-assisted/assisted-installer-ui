import React from 'react';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { TFunction } from 'i18next';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  OPENSHIFT_LIFE_CYCLE_DATES_LINK,
  UiIcon,
  OpenshiftVersionOptionType,
} from '../../../common';
import { isInOcm } from '../../../common/api';
import { OpenShiftVersionDropdown } from '../../../common/components/ui/OpenShiftVersionDropdown';
import { OpenShiftVersionModal } from './OpenShiftVersionModal';

const OpenShiftLifeCycleDatesLink = () => {
  const { t } = useTranslation();
  return (
    <a href={OPENSHIFT_LIFE_CYCLE_DATES_LINK} target="_blank" rel="noopener noreferrer">
      {t('ai:Learn more')} <ExternalLinkAltIcon />
    </a>
  );
};

const getOpenshiftVersionHelperText = (
  versions: OpenshiftVersionOptionType[],
  selectedVersionValue: string | undefined,
  t: TFunction,
) => {
  if (!versions.length) {
    return (
      <>
        <UiIcon status="danger" size="sm" icon={<ExclamationCircleIcon />} />; &nbsp;{' '}
        {t('ai:No release image is available.')}
      </>
    );
  }

  const selectedVersion = versions.find((version) => version.value === selectedVersionValue);
  if (!selectedVersionValue || !selectedVersion) {
    return null;
  }

  if (selectedVersion.supportLevel !== 'production') {
    return (
      <>
        <UiIcon status="warning" icon={<ExclamationTriangleIcon />} />
        &nbsp;
        {t('ai:Please note that this version is not production-ready.')}&nbsp;
        <OpenShiftLifeCycleDatesLink />
      </>
    );
  }
  return null;
};

type OcmOpenShiftVersionSelectProps = {
  versions: OpenshiftVersionOptionType[];
};
const OcmOpenShiftVersionSelect = ({ versions }: OcmOpenShiftVersionSelectProps) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = React.useState<OpenshiftVersionOptionType>(); // Estado para almacenar el valor seleccionado

  const selectOptions = React.useMemo(
    () =>
      versions
        .filter((version) => version.supportLevel !== 'maintenance')
        .map((version) => ({
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

  const setValueSelected = (selectedValue: OpenshiftVersionOptionType) => {
    setSelectedValue(selectedValue);
  };

  const updatedSelectOptions = React.useMemo(() => {
    if (selectedValue && !selectOptions.find((option) => option.value === selectedValue.value)) {
      return [
        ...selectOptions,
        {
          label: selectedValue.label,
          value: selectedValue.value,
        },
      ];
    }
    return selectOptions;
  }, [selectOptions, selectedValue]);

  return (
    <>
      <OpenShiftVersionDropdown
        name="openshiftVersion"
        items={updatedSelectOptions}
        versions={versions}
        getHelperText={getOpenshiftVersionHelperText}
        showReleasesLink={isInOcm}
        showOpenshiftVersionModal={showOpenshiftVersionModal}
        valueSelected={selectedValue}
      />
      <OpenShiftVersionModal
        isOpen={isOpenshiftVersionModalOpen}
        setOpenhiftVersionModalOpen={setIsOpenshiftVersionModalOpen}
        setValueSelected={setValueSelected}
      />
    </>
  );
};

export default OcmOpenShiftVersionSelect;
