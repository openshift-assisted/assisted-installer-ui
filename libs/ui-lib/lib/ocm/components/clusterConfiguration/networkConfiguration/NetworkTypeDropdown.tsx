import React from 'react';
import { useField, useFormikContext } from 'formik';
import {
  Alert,
  AlertVariant,
  Dropdown,
  DropdownItem,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  NETWORK_TYPE_CALICO,
  NETWORK_TYPE_CILIUM,
  NETWORK_TYPE_CISCO_ACI,
  NETWORK_TYPE_LABELS,
  NETWORK_TYPE_NONE,
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_SDN,
} from '../../../../common/config';
import { getFieldId, ExternalLink } from '../../../../common/components/ui';
import {
  NewFeatureSupportLevelMap,
  useNewFeatureSupportLevel,
} from '../../../../common/components/newFeatureSupportLevels';
import type { NetworkConfigurationValues } from '../../../../common/types/clusters';
import { isThirdPartyCNI } from '../../utils';

const RED_HAT_CNI_SUPPORT_MATRIX_URL = 'https://access.redhat.com/articles/5436171';

const allOptions = [
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_SDN,
  NETWORK_TYPE_CISCO_ACI,
  NETWORK_TYPE_CILIUM,
  NETWORK_TYPE_CALICO,
  NETWORK_TYPE_NONE,
].map((value) => ({ value, label: NETWORK_TYPE_LABELS[value] }));

export interface NetworkTypeDropDownProps {
  isDisabled?: boolean;
  isSDNSelectable: boolean;
  featureSupportLevelData: NewFeatureSupportLevelMap | null;
}

export const NetworkTypeDropDown = ({
  isDisabled = false,
  isSDNSelectable,
  featureSupportLevelData,
}: NetworkTypeDropDownProps) => {
  const [field, , { setValue }] = useField<string>('networkType');
  const [isOpen, setOpen] = React.useState(false);
  const { values } = useFormikContext<NetworkConfigurationValues>();
  const { getFeatureDisabledReason } = useNewFeatureSupportLevel();
  const fieldId = getFieldId('networkType', 'input');
  const showThirdPartyBanner = isThirdPartyCNI(values.networkType);

  const sdnDisabledReason = React.useMemo(() => {
    if (!isSDNSelectable) {
      return 'SDN is not supported for SNO clusters or when IPv6 is detected.';
    }
    if (featureSupportLevelData?.['SDN_NETWORK_TYPE'] === 'unavailable') {
      return 'SDN is not available for the selected configuration.';
    }
    return getFeatureDisabledReason('SDN_NETWORK_TYPE', featureSupportLevelData ?? undefined);
  }, [isSDNSelectable, featureSupportLevelData, getFeatureDisabledReason]);

  React.useEffect(() => {
    if (field.value === NETWORK_TYPE_SDN && sdnDisabledReason) {
      setValue(NETWORK_TYPE_OVN);
    }
  }, [sdnDisabledReason, field.value, setValue]);

  const currentDisplayValue =
    allOptions.find((opt) => opt.value === field.value)?.label ?? allOptions[0].label;

  const dropdownItems = allOptions.map(({ value, label }) => {
    const isSDN = value === NETWORK_TYPE_SDN;
    const disabledReason = isSDN ? sdnDisabledReason : undefined;
    return (
      <DropdownItem
        key={value}
        id={value}
        value={value}
        isAriaDisabled={disabledReason !== undefined}
      >
        <Tooltip hidden={!disabledReason} content={disabledReason} position="top">
          <div>{label}</div>
        </Tooltip>
      </DropdownItem>
    );
  });

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>): void => {
    const nextValue = event?.currentTarget.id;
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
      {showThirdPartyBanner && (
        <StackItem>
          <Alert
            variant={AlertVariant.warning}
            isInline
            title="Third-party CNI (Technology Preview)"
          >
            <Stack hasGutter>
              <StackItem>
                Third-party CNIs require uploading CNI manifests. Please verify you have the
                required manifests and that the chosen CNI is compatible with your platform and
                OpenShift version.
              </StackItem>
              <StackItem>
                <ExternalLink href={RED_HAT_CNI_SUPPORT_MATRIX_URL}>
                  Red Hat CNI Support Matrix
                </ExternalLink>
              </StackItem>
            </Stack>
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};
