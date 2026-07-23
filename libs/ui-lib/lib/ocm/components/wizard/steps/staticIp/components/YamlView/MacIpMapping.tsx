import React from 'react';
import { useSelector } from 'react-redux';
import { ArrayHelpers, FieldArray } from 'formik';
import { GridItem, Grid, Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { MacInterfaceMap } from '@openshift-assisted/types/assisted-installer-service';
import { getFormikArrayItemFieldName, RemovableField } from '../../../../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../../../../store';
import { OcmInputField } from '../../../../../ui/OcmFormFields';

const AddMapping: React.FC<{
  onPush: ArrayHelpers['push'];
}> = ({ onPush }) => {
  return (
    <Button
      icon={<PlusCircleIcon />}
      isInline
      onClick={() => onPush({ macAddress: '', logicalNicName: '' })}
      data-testid="add-mapping"
      variant="link"
    >
      Add another MAC to interface name mapping
    </Button>
  );
};

const MacMappingItem = ({
  fieldName,
  onRemove,
  mapIdx,
  enableRemove,
  hostIdx,
}: {
  fieldName: string;
  onRemove: () => void;
  mapIdx: number;
  hostIdx: number;
  enableRemove: boolean;
}) => {
  return (
    <RemovableField hideRemoveButton={!enableRemove} onRemove={onRemove}>
      <Grid hasGutter>
        <GridItem span={6}>
          <OcmInputField
            label="MAC address"
            isRequired
            name={`${fieldName}.macAddress`}
            data-testid={`mac-address-${hostIdx}-${mapIdx}`}
          />
        </GridItem>
        <GridItem span={6}>
          <OcmInputField
            label="Interface name"
            isRequired
            name={`${fieldName}.logicalNicName`}
            data-testid={`interface-name-${hostIdx}-${mapIdx}`}
          />
        </GridItem>
      </Grid>
    </RemovableField>
  );
};

export const MacIpMapping = ({
  fieldName,
  macInterfaceMap,
  hostIdx,
}: {
  fieldName: string;
  macInterfaceMap: MacInterfaceMap;
  hostIdx: number;
}) => {
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

  return (
    <Grid className="mac-ip-mapping">
      <FieldArray
        name={fieldName}
        validateOnChange={false}
        render={({ push, remove }) => (
          <Grid hasGutter>
            <GridItem span={6}>
              {macInterfaceMap.map((_, idx) => (
                <MacMappingItem
                  key={getFormikArrayItemFieldName(fieldName, idx)}
                  fieldName={getFormikArrayItemFieldName(fieldName, idx)}
                  onRemove={() => remove(idx)}
                  mapIdx={idx}
                  enableRemove={!isViewerMode && idx > 0}
                  hostIdx={hostIdx}
                />
              ))}
            </GridItem>
            <GridItem>{!isViewerMode && <AddMapping onPush={push} />}</GridItem>
          </Grid>
        )}
      />
    </Grid>
  );
};
