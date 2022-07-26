import React from 'react';
import { GridItem, Grid, Button } from '@patternfly/react-core';
import { ArrayHelpers, FieldArray } from 'formik';
import { PlusCircleIcon } from '@patternfly/react-icons';
import {
  getFormikArrayItemFieldName,
  InputField,
  MacInterfaceMap,
  RemovableField,
} from '../../../../../../common';

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
      Add another mapping
    </Button>
  );
};

const MacMappingItem: React.FC<{
  fieldName: string;
  onRemove: () => void;
  mapIdx: number;
  hostIdx: number;
  enableRemove: boolean;
}> = ({ fieldName, onRemove, mapIdx, enableRemove, hostIdx }) => {
  return (
    <RemovableField hideRemoveButton={!enableRemove} onRemove={onRemove}>
      <Grid hasGutter>
        <GridItem span={6}>
          <InputField
            label="MAC address"
            isRequired
            name={`${fieldName}.macAddress`}
            data-testid={`mac-address-${hostIdx}-${mapIdx}`}
          />
        </GridItem>
        <GridItem span={6}>
          <InputField
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

export const MacIpMapping: React.FC<{
  fieldName: string;
  macInterfaceMap: MacInterfaceMap;
  hostIdx: number;
}> = ({ fieldName, macInterfaceMap, hostIdx }) => {
  return (
    <Grid className="mac-ip-mapping">
      <GridItem span={6}>
        <FieldArray
          name={fieldName}
          validateOnChange={false}
          render={({ push, remove }) => (
            <Grid hasGutter>
              {macInterfaceMap.map((value, idx) => (
                <MacMappingItem
                  key={getFormikArrayItemFieldName(fieldName, idx)}
                  fieldName={getFormikArrayItemFieldName(fieldName, idx)}
                  onRemove={() => remove(idx)}
                  mapIdx={idx}
                  enableRemove={idx > 0}
                  hostIdx={hostIdx}
                />
              ))}

              <AddMapping onPush={push} />
            </Grid>
          )}
        />
      </GridItem>
    </Grid>
  );
};
