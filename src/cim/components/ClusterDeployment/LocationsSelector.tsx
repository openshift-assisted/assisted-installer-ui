import React from 'react';
import countBy from 'lodash/countBy';
import { MultiSelectField, PopoverIcon } from '../../../common';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';
import { Trans } from 'react-i18next';

const LocationsLabelIcon: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PopoverIcon
      position="right"
      bodyContent={
        <>
          {t('ai:Select one or multiple locations to choose the hosts from.')}
          <br />
          <Trans
            t={t}
            components={{ bold: <strong /> }}
            i18nKey="ai:Keep the field empty to match <bold>any</bold> location."
          />

          <br />
          <Trans
            t={t}
            components={{ bold: <strong /> }}
            i18nKey="ai:Set <bold>{{agent_location_label_key}}</bold> label in Agent resource to specify it's location."
            values={{ agent_location_label_key: AGENT_LOCATION_LABEL_KEY }}
          />
        </>
      }
    />
  );
};

const getNumOfHosts = (size: number, t: TFunction) => {
  if (size === 0) {
    return t('ai:(no hosts available)');
  } else if (size === 1) {
    return t('ai:(1 host available)');
  }
  return t('ai:({{size}} hosts available)', { size });
};

const LocationsSelector: React.FC<{ agents: AgentK8sResource[] }> = ({ agents }) => {
  const locations = countBy(
    agents,
    ({ metadata }) => metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE,
  );
  const { t } = useTranslation();
  const agentLocationOptions = Object.keys(locations).map<MultiSelectOption>((location) => ({
    // Why is that bloody prop set as mandatory in the SelectOptionProps??
    isLastOptionBeforeFooter: (index: number): boolean => index === locations.length,
    id: location,
    value: location,
    displayName: `${
      location === AGENT_NOLOCATION_VALUE ? t('ai:No location') : location
    } ${getNumOfHosts(locations[location], t)}`,
  }));
  return (
    <MultiSelectField
      idPostfix="locations"
      name="locations"
      label={t('ai:Host locations')}
      labelIcon={<LocationsLabelIcon />}
      placeholderText={t('ai:Type or select location(s)')}
      helperText={t('ai:Select one or more locations to view hosts')}
      options={agentLocationOptions}
    />
  );
};

export default LocationsSelector;
