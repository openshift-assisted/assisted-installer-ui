import React from 'react';
import { Grid, Flex, FlexItem, ExpandableSectionToggle, Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { getFormikArrayItemFieldName } from '../../../../../common';
import { getManifestName } from './utils';
import CollapsedManifest from './CollapsedManifest';
import ExpandedManifest from './ExpandedManifest';

type CustomManifestProps = {
  manifestIdx: number;
  onRemove: () => void;
  onToggleExpand: (isExpanded: boolean) => void;
  isExpanded: boolean;
  isDisabled: boolean;
  fieldName: string;
  enableRemoveManifest: boolean;
};

export const RemoveItemButton = ({
  onRemove,
  showRemoveButton,
  dataTestId,
}: {
  onRemove: () => void;
  showRemoveButton: boolean;
  dataTestId: string;
}) => (
  <Button icon={<MinusCircleIcon onClick={onRemove} />}
    data-testid={dataTestId}
    aria-label="remove manifest"
    style={{ visibility: showRemoveButton ? 'visible' : 'hidden' }}
    variant="plain"
   />
);

export const CustomManifest = ({
  fieldName,
  manifestIdx,
  onRemove,
  onToggleExpand,
  isExpanded,
  isDisabled,
  enableRemoveManifest,
}: CustomManifestProps) => {
  const [showRemoveButton, setShowRemoveButton] = React.useState(false);
  const updateShowRemoveButton = (value: boolean) => {
    if (isDisabled) {
      return;
    }
    if (!enableRemoveManifest) {
      setShowRemoveButton(false);
    } else {
      setShowRemoveButton(value);
    }
  };
  const manifestFieldName = getFormikArrayItemFieldName(fieldName, manifestIdx);

  return (
    <Grid
      onMouseEnter={() => updateShowRemoveButton(true)}
      onMouseLeave={() => updateShowRemoveButton(false)}
      hasGutter
    >
      <Flex>
        <FlexItem>
          <ExpandableSectionToggle
            isExpanded={isExpanded}
            onToggle={onToggleExpand}
            direction="down"
            data-testid={`toggle-manifest-${manifestIdx}`}
          >
            {getManifestName(manifestIdx)}
          </ExpandableSectionToggle>
        </FlexItem>
        {!isDisabled && enableRemoveManifest && (
          <FlexItem align={{ default: 'alignRight' }}>
            <RemoveItemButton
              onRemove={onRemove}
              showRemoveButton={showRemoveButton}
              dataTestId={`remove-manifest-${manifestIdx}`}
            />
          </FlexItem>
        )}
      </Flex>

      {isExpanded ? (
        <ExpandedManifest
          fieldName={manifestFieldName}
          manifestIdx={manifestIdx}
          isDisabled={isDisabled}
        />
      ) : (
        <CollapsedManifest manifestIdx={manifestIdx} fieldName={manifestFieldName} />
      )}
    </Grid>
  );
};
