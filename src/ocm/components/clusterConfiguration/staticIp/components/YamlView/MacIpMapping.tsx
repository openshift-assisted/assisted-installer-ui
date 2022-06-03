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

const MacMappingItem = ({
  fieldName,
  onRemove,
  mapIdx,
  enableRemove,
  hostIdx,
  isDisabled,
}: {
  fieldName: string;
  onRemove: () => void;
  mapIdx: number;
  hostIdx: number;
  enableRemove: boolean;
  isDisabled: boolean;
}) => {
  return (
    <RemovableField hideRemoveButton={!enableRemove} onRemove={onRemove}>
      <Grid hasGutter>
        <GridItem span={6}>
          <InputField
            label="MAC address"
            isRequired
            isDisabled={isDisabled}
            name={`${fieldName}.macAddress`}
            data-testid={`mac-address-${hostIdx}-${mapIdx}`}
          ></InputField>
        </GridItem>
        <GridItem span={6}>
          <InputField
            label="Interface name"
            isRequired
            isDisabled={isDisabled}
            name={`${fieldName}.logicalNicName`}
            data-testid={`interface-name-${hostIdx}-${mapIdx}`}
          ></InputField>
        </GridItem>
      </Grid>
    </RemovableField>
  );
};

export const MacIpMapping = ({
  fieldName,
  macInterfaceMap,
  hostIdx,
  isDisabled,
}: {
  fieldName: string;
  macInterfaceMap: MacInterfaceMap;
  hostIdx: number;
  isDisabled: boolean;
}) => {
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
                  isDisabled={isDisabled}
                  onRemove={() => remove(idx)}
                  mapIdx={idx}
                  enableRemove={!isDisabled && idx > 0}
                  hostIdx={hostIdx}
                />
              ))}

              {!isDisabled && <AddMapping onPush={push} />}
            </Grid>
          )}
        ></FieldArray>
      </GridItem>
    </Grid>
  );
};
