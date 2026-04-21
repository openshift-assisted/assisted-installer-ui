import React from 'react';
import { useField, useFormikContext } from 'formik';
import {
  Dropdown,
  DropdownItem,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { getFieldId } from '../../../../common/components/ui';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import type { NetworkConfigurationValues } from '../../../../common/types/clusters';
import {
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_LABELS,
  NETWORK_TYPE_FEATURE_IDS,
  isThirdPartyCNI,
} from '../../../../common/types/networkType';
import { useTranslation } from '../../../../common/hooks';
import { ThirdPartyCNIBanner } from '../../../../common';

export interface NetworkTypeDropDownProps {
  isDisabled?: boolean;
  featureSupportLevelData: NewFeatureSupportLevelMap | null;
}

export const NetworkTypeDropDown = ({
  isDisabled = false,
  featureSupportLevelData,
}: NetworkTypeDropDownProps) => {
  const { t } = useTranslation();
  const [field, , { setValue }] = useField<string>('networkType');
  const [isOpen, setOpen] = React.useState(false);
  const { values } = useFormikContext<NetworkConfigurationValues>();
  const { getFeatureDisabledReason, getFeatureSupportLevel } = useNewFeatureSupportLevel();
  const fieldId = getFieldId('networkType', 'input');
  const showThirdPartyBanner = isThirdPartyCNI(values.networkType);

  React.useEffect(() => {
    if (
      getFeatureDisabledReason(
        NETWORK_TYPE_FEATURE_IDS[field.value],
        featureSupportLevelData ?? undefined,
      ) !== undefined
    ) {
      setValue(NETWORK_TYPE_OVN);
    }
  }, [field.value, setValue, featureSupportLevelData, getFeatureDisabledReason]);

  const currentDisplayValue = NETWORK_TYPE_LABELS(t)[field.value];

  const dropdownItems = Object.entries(NETWORK_TYPE_LABELS(t)).map(([value, label]) => {
    const disabledReason = getFeatureDisabledReason(
      NETWORK_TYPE_FEATURE_IDS[value],
      featureSupportLevelData ?? undefined,
    );
    const featureId = NETWORK_TYPE_FEATURE_IDS[value];
    const supportLevel = featureId
      ? getFeatureSupportLevel(featureId, featureSupportLevelData ?? undefined)
      : undefined;
    const shouldDisable =
      supportLevel === 'unavailable' ||
      supportLevel === 'unsupported' ||
      disabledReason !== undefined;
    return (
      <DropdownItem key={value} id={value} value={value} isAriaDisabled={shouldDisable}>
        <Tooltip hidden={!disabledReason} content={disabledReason} position="top">
          <div>
            {label}
            <span onClick={(event) => event.stopPropagation()}>
              <NewFeatureSupportLevelBadge featureId={featureId} supportLevel={supportLevel} />
            </span>
          </div>
        </Tooltip>
      </DropdownItem>
    );
  });

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>, nextValue?: string): void => {
    if (nextValue) {
      setValue(nextValue);
    }
    setOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      id={fieldId}
      className="pf-v6-u-w-100"
      style={{ minWidth: '100%' }}
    >
      {currentDisplayValue}
    </MenuToggle>
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <FormGroup fieldId={fieldId} label="Network type" id={`form-control__${fieldId}`}>
          <Dropdown
            id={`${fieldId}-dropdown`}
            onOpenChange={(open: boolean) => setOpen(open)}
            onSelect={onSelect}
            toggle={toggle}
            isOpen={isOpen}
          >
            {dropdownItems}
          </Dropdown>
        </FormGroup>
      </StackItem>
      {showThirdPartyBanner && <ThirdPartyCNIBanner />}
    </Stack>
  );
};
