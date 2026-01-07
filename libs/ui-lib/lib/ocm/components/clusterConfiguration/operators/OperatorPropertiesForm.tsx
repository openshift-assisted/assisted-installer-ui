import * as React from 'react';
import {
  ExpandableSection,
  FormGroup,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
  TextInput,
  NumberInput,
  Switch,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { OperatorProperty } from '@openshift-assisted/types/assisted-installer-service';
import { OperatorsValues } from '../../../../common/types/clusters';
import { getFieldId } from '../../../../common';

interface OperatorPropertiesFormProps {
  operatorId: string;
  operatorName: string;
  properties: OperatorProperty[];
  isDisabled?: boolean;
}

// Helper function to sanitize a value to ensure it's JSON-serializable
// This function ALWAYS returns a primitive (string, number, or boolean)
// It rejects: objects, arrays, functions, symbols, bigint, and any other non-primitive types
const sanitizeValue = (value: unknown): string | number | boolean => {
  // Handle null and undefined - convert to empty string
  if (value === null || value === undefined) {
    return '';
  }

  // If it's already a primitive, return it directly
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Explicitly reject functions (including methods like isDefaultPrevented)
  if (typeof value === 'function') {
    return '';
  }

  // For ANY object type (including DOM elements, event objects, arrays, plain objects, etc.)
  // we return empty string - we only want primitives
  // This includes objects with nested properties like nativeEvent, currentTarget, target, etc.
  if (typeof value === 'object') {
    // Even if it's a plain object that could be stringified, we don't want objects
    // We only want primitive values (string, number, boolean)
    // This handles event objects with properties like:
    // - isDefaultPrevented (function)
    // - nativeEvent (object)
    // - currentTarget (DOM element)
    // - target (DOM element)
    // - preventDefault (function)
    // etc.
    return '';
  }

  // For other types (symbols, bigint, etc.), return empty string
  return '';
};

// Helper function to clean properties object, removing any non-serializable values
// This ensures we ONLY have primitive values (string, number, boolean) - NO objects, NO functions
const cleanProperties = (props: Record<string, unknown>): Record<string, string | number | boolean> => {
  const cleaned: Record<string, string | number | boolean> = {};
  try {
    for (const [key, value] of Object.entries(props)) {
      // Skip if key is not a string (shouldn't happen, but be defensive)
      if (typeof key !== 'string') {
        continue;
      }

      // CRITICAL: Skip functions explicitly (including methods like isDefaultPrevented, preventDefault, etc.)
      if (typeof value === 'function') {
        continue;
      }

      // CRITICAL: If the value is an object (including event objects, DOM elements, arrays, etc.), skip it entirely
      // We only want primitive values
      // This handles event objects with nested properties like:
      // - createFlowCollector: { isDefaultPrevented: function, nativeEvent: object, currentTarget: DOM element, etc. }
      if (typeof value === 'object' && value !== null) {
        // Skip this property - we don't want objects, only primitives
        continue;
      }

      // Sanitize the value (should be primitive now: string, number, boolean, null, or undefined)
      const sanitized = sanitizeValue(value);
      cleaned[key] = sanitized;
    }
    // Verify the cleaned object can be stringified
    JSON.stringify(cleaned);
  } catch (error) {
    // If cleaning fails, return empty object
    console.warn('Failed to clean properties:', error);
    return {};
  }
  return cleaned;
};

const OperatorPropertiesForm: React.FC<OperatorPropertiesFormProps> = ({
  operatorId,
  operatorName,
  properties,
  isDisabled = false,
}) => {
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Parse current properties JSON or use defaults
  const currentProperties = React.useMemo(() => {
    const propertiesJson = values.operatorProperties?.[operatorName] || '{}';
    try {
      // First, verify the JSON string is valid
      if (typeof propertiesJson !== 'string') {
        return {};
      }
      const parsed = JSON.parse(propertiesJson);
      // Ensure parsed is an object
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return {};
      }
      // Clean the parsed properties to remove any non-serializable values
      const cleaned = cleanProperties(parsed);
      // Verify the cleaned object can be stringified (sanity check)
      try {
        JSON.stringify(cleaned);
        return cleaned;
      } catch {
        // If cleaned object still can't be stringified, return empty
        return {};
      }
    } catch {
      return {};
    }
  }, [values.operatorProperties, operatorName]);

  // Initialize with default values if not set
  React.useEffect(() => {
    if (!values.operatorProperties || !values.operatorProperties[operatorName]) {
      const defaults: Record<string, unknown> = {};
      properties.forEach((prop) => {
        // Handle both snake_case and camelCase property names
        const defaultValue = (prop as any).default_value ?? (prop as any).defaultValue;
        const dataType = (prop as any).data_type ?? (prop as any).dataType;

        if (defaultValue !== undefined && prop.name) {
          if (dataType === 'boolean' || dataType === 'Boolean') {
            defaults[prop.name] = defaultValue === 'true' || defaultValue === true;
          } else if (dataType === 'integer' || dataType === 'Integer') {
            defaults[prop.name] = parseInt(String(defaultValue), 10);
          } else {
            defaults[prop.name] = defaultValue;
          }
        }
      });
      if (Object.keys(defaults).length > 0) {
        const currentProps = values.operatorProperties || {};
        setFieldValue('operatorProperties', {
          ...currentProps,
          [operatorName]: JSON.stringify(defaults),
        });
      }
    }
  }, [operatorName, properties, setFieldValue, values.operatorProperties]);

  const updateProperty = (propertyName: string, value: unknown) => {
    try {
      // Sanitize the value to ensure it's JSON-serializable (primitive only)
      const sanitizedValue = sanitizeValue(value);

      // Create a completely new object from scratch to avoid any reference issues
      const newProperties: Record<string, string | number | boolean> = {};

      // Safely copy existing properties by iterating and sanitizing each one
      // This ensures we only have primitives, no objects (including event objects), no functions
      for (const key in currentProperties) {
        if (Object.prototype.hasOwnProperty.call(currentProperties, key) && typeof key === 'string') {
          const existingValue = currentProperties[key];

          // Explicitly skip functions (including methods like isDefaultPrevented, preventDefault, etc.)
          if (typeof existingValue === 'function') {
            continue;
          }

          // Double-check: if the existing value is an object, skip it entirely
          // This handles cases where event objects (with nested properties like nativeEvent, currentTarget, etc.)
          // or HTML elements were accidentally stored
          if (typeof existingValue === 'object' && existingValue !== null) {
            // Skip objects entirely - we only want primitives
            // This prevents event objects like:
            // { isDefaultPrevented: function, nativeEvent: object, currentTarget: DOM element, target: DOM element, ... }
            continue;
          }

          // Sanitize the value (should already be primitive, but be safe)
          newProperties[key] = sanitizeValue(existingValue);
        }
      }

      // Set the new property value (which is already sanitized to a primitive)
      newProperties[propertyName] = sanitizedValue;

      // Verify the new object can be stringified before proceeding
      let propertiesJson: string;
      try {
        propertiesJson = JSON.stringify(newProperties);
      } catch (error) {
        console.error('Failed to stringify properties:', error, { propertyName, sanitizedValue, newProperties });
        // Fallback: create a minimal safe object with just this property
        propertiesJson = JSON.stringify({ [propertyName]: sanitizedValue });
      }

      // Safely update the operatorProperties
      const currentProps = values.operatorProperties || {};
      const updatedProps = { ...currentProps };
      updatedProps[operatorName] = propertiesJson;

      setFieldValue('operatorProperties', updatedProps);
    } catch (error) {
      console.error('Error updating property:', error, { propertyName, value });
      // Don't update if there's an error to prevent corrupting the state
    }
  };

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <ExpandableSection
      toggleText={`Configure ${operatorName} properties`}
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      data-testid={`operator-properties-${operatorId}`}
    >
      <Stack hasGutter>
        {properties.map((property) => {
          if (!property.name) return null;

          const fieldId = getFieldId(`${operatorId}-${property.name}`, 'input');
          const currentValue = currentProperties[property.name];
          const isRequired = property.mandatory || false;

          // Handle both snake_case and camelCase property names
          const dataType = (property as any).data_type ?? (property as any).dataType;
          const defaultValue = (property as any).default_value ?? (property as any).defaultValue;

          return (
            <StackItem key={property.name}>
              <FormGroup
                fieldId={fieldId}
                label={property.name}
                isRequired={isRequired}
              >
                {property.description && (
                  <HelperText>
                    <HelperTextItem>{property.description}</HelperTextItem>
                  </HelperText>
                )}
                {dataType === 'boolean' || dataType === 'Boolean' ? (
                  <Switch
                    id={fieldId}
                    label="Enabled"
                    isChecked={currentValue === true || currentValue === 'true'}
                    onChange={(_, checked) => updateProperty(property.name || '', checked)}
                    isDisabled={isDisabled}
                    data-testid={`operator-property-${operatorId}-${property.name}`}
                  />
                ) : dataType === 'integer' || dataType === 'Integer' ? (
                  <NumberInput
                    id={fieldId}
                    value={(() => {
                      // Ensure we always return a number for NumberInput
                      if (typeof currentValue === 'number') {
                        return currentValue;
                      }
                      if (typeof currentValue === 'string') {
                        const parsed = parseInt(currentValue, 10);
                        if (!isNaN(parsed)) {
                          return parsed;
                        }
                      }
                      // Fall back to defaultValue
                      if (typeof defaultValue === 'number') {
                        return defaultValue;
                      }
                      if (typeof defaultValue === 'string') {
                        const parsed = parseInt(defaultValue, 10);
                        if (!isNaN(parsed)) {
                          return parsed;
                        }
                      }
                      return 0;
                    })()}
                    onMinus={() => {
                      const numValue =
                        typeof currentValue === 'number'
                          ? currentValue
                          : parseInt(String(currentValue ?? defaultValue ?? 0), 10);
                      updateProperty(property.name || '', Math.max(0, numValue - 1));
                    }}
                    onPlus={() => {
                      const numValue =
                        typeof currentValue === 'number'
                          ? currentValue
                          : parseInt(String(currentValue ?? defaultValue ?? 0), 10);
                      updateProperty(property.name || '', numValue + 1);
                    }}
                    onChange={(event) => {
                      const value = parseInt((event.target as HTMLInputElement).value, 10);
                      if (!isNaN(value)) {
                        updateProperty(property.name || '', value);
                      }
                    }}
                    isDisabled={isDisabled}
                    data-testid={`operator-property-${operatorId}-${property.name}`}
                  />
                ) : (
                  <TextInput
                    id={fieldId}
                    type="text"
                    value={String(currentValue ?? defaultValue ?? '')}
                    onChange={(_, value) => {
                      // Extract value from event object if needed
                      // PatternFly TextInput onChange can pass either a string or an event object
                      let stringValue = '';
                      if (value && typeof value === 'object' && 'currentTarget' in value) {
                        const event = value as React.FormEvent<HTMLInputElement>;
                        stringValue = event.currentTarget.value;
                      } else if (typeof value === 'string') {
                        stringValue = value;
                      } else {
                        stringValue = String(value ?? '');
                      }
                      updateProperty(property.name || '', stringValue);
                    }}
                    isDisabled={isDisabled}
                    data-testid={`operator-property-${operatorId}-${property.name}`}
                  />
                )}
              </FormGroup>
            </StackItem>
          );
        })}
      </Stack>
    </ExpandableSection>
  );
};

export default OperatorPropertiesForm;

