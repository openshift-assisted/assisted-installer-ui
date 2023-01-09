import React from 'react';
import { GridItem, Grid, Button } from '@patternfly/react-core';
import { ArrayHelpers, FieldArray } from 'formik';
import { PlusCircleIcon } from '@patternfly/react-icons';
import {
  getFormikArrayItemFieldName,
  MacInterfaceMap,
  RemovableField,
} from '../../../../../../common';
import { OcmInputField } from '../../../../ui/OcmFormFields';
import { useSelector } from 'react-redux';
import { selectCurrentClusterPermissionsState } from '../../../../../selectors';

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
      <GridItem span={6}>
        <FieldArray
          name={fieldName}
          validateOnChange={false}
          render={({ push, remove }) => (
            <Grid hasGutter>
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

              {!isViewerMode && <AddMapping onPush={push} />}
            </Grid>
          )}
        />
      </GridItem>
    </Grid>
  );
};
