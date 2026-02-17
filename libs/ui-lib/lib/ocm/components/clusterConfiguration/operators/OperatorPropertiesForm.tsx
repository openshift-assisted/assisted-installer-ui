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

// API response type: matches the actual OpenAPI spec with snake_case fields
// The API returns data_type and default_value (snake_case)
interface ApiOperatorProperty {
  name?: string;
  data_type?: string;
  default_value?: string;
  description?: string;
  mandatory?: boolean;
  options?: string[];
}

// Normalized internal type with camelCase fields
interface NormalizedOperatorProperty {
  name?: string;
  dataType?: string;
  defaultValue?: string;
  description?: string;
  mandatory?: boolean;
  options?: string[];
}

interface OperatorPropertiesFormProps {
  operatorId: string;
  // Accept API response type - may be snake_case (API contract) or camelCase (if axios-case-converter converted it)
  // Will be normalized internally via normalizeOperatorProperty
  properties: (ApiOperatorProperty | OperatorProperty)[];
  isDisabled?: boolean;
}

// Helper function to sanitize a value to ensure it's JSON-serializable
// This function ALWAYS returns a primitive (string, number, or boolean)
// It rejects: objects, arrays, functions, symbols, bigint, and any other non-primitive types
//
// Note: The extensive defensive checks here serve multiple purposes:
// 1. Safety against corrupted state from previous versions or edge cases
// 2. Ensuring JSON serialization always succeeds (operatorProperties must be JSON-serializable)
// 3. Future-proofing against unexpected input types from form state or component callbacks
// While callers should pass primitives directly, this layer provides a safety net.
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

// Shared helper to filter and sanitize a properties object
// This ensures we ONLY have primitive values (string, number, boolean) - NO objects, NO functions
// Used by both cleanProperties and updateProperty to maintain consistency
const filterToSerializableProperties = (
  props: Record<string, unknown>,
): Record<string, string | number | boolean> => {
  const filtered: Record<string, string | number | boolean> = {};
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key) && typeof key === 'string') {
      const value = props[key];

      // CRITICAL: Skip functions explicitly (including methods like isDefaultPrevented, preventDefault, etc.)
      if (typeof value === 'function') {
        continue;
      }

      // CRITICAL: If the value is an object (including event objects, DOM elements, arrays, etc.), skip it entirely
      // We only want primitive values
      // This handles event objects with nested properties like:
      // - createFlowCollector: { isDefaultPrevented: function, nativeEvent: object, currentTarget: DOM element, etc. }
      if (typeof value === 'object' && value !== null) {
        // Skip objects entirely - we only want primitives
        continue;
      }

      // Sanitize the value (should be primitive now: string, number, boolean, null, or undefined)
      filtered[key] = sanitizeValue(value);
    }
  }
  return filtered;
};

// Helper function to clean properties object, removing any non-serializable values
// This ensures we ONLY have primitive values (string, number, boolean) - NO objects, NO functions
const cleanProperties = (props: Record<string, unknown>): Record<string, string | number | boolean> => {
  try {
    const cleaned = filterToSerializableProperties(props);
    // Verify the cleaned object can be stringified
    JSON.stringify(cleaned);
    return cleaned;
  } catch (error) {
    // If cleaning fails, return empty object
    console.warn('Failed to clean properties:', error);
    return {};
  }
};

// Deserialization layer: maps API fields (snake_case) to internal camelCase fields
// The API returns snake_case (data_type, default_value) per the OpenAPI spec.
// Note: axios-case-converter may convert responses to camelCase at runtime,
// but the type reflects the actual API contract (snake_case).
// This function normalizes the API response to camelCase for internal use.
const normalizeOperatorProperty = (prop: ApiOperatorProperty | OperatorProperty): NormalizedOperatorProperty => {
  // Handle both snake_case (API contract) and camelCase (if axios-case-converter converted it)
  // Prefer snake_case as the source of truth per the OpenAPI spec
  const apiProp = prop as ApiOperatorProperty;
  const camelProp = prop as OperatorProperty;

  return {
    name: prop.name,
    // Prefer snake_case from API, fallback to camelCase if converter was applied
    dataType: apiProp.data_type ?? camelProp.dataType,
    defaultValue: apiProp.default_value ?? camelProp.defaultValue,
    description: prop.description,
    mandatory: prop.mandatory,
    options: prop.options,
  };
};

// Helper function to compute NumberInput value from currentValue and defaultValue
const computeNumberInputValue = (
  currentValue: unknown,
  defaultValue: unknown,
): number => {
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
};

const OperatorPropertiesForm: React.FC<OperatorPropertiesFormProps> = ({
  operatorId,
  properties,
  isDisabled = false,
}) => {
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const initializationRef = React.useRef(false);

  // Parse current properties JSON or use defaults
  const currentProperties = React.useMemo(() => {
    const propertiesJson = values.operatorProperties?.[operatorId] || '{}';
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
  }, [values.operatorProperties, operatorId]);

  // Initialize with default values if not set
  // Note: initializationRef prevents re-initialization after the first render, which works for the typical
  // use case (operator checked → component mounts → defaults initialized → operator unchecked → component
  // unmounts → operator checked again → component remounts with fresh ref). However, there's an edge case:
  // if values.operatorProperties[operatorId] is cleared by an external action while the component remains
  // mounted, re-initialization won't occur because initializationRef.current stays true. This seems unlikely
  // in practice but worth noting for future maintenance.
  React.useEffect(() => {
    if (!initializationRef.current && (!values.operatorProperties || !values.operatorProperties[operatorId])) {
      initializationRef.current = true;
      const defaults: Record<string, unknown> = {};
      properties.forEach((prop) => {
        // Normalize API response to match type definition
        const normalized = normalizeOperatorProperty(prop);
        const defaultValue = normalized.defaultValue;
        const dataType = normalized.dataType;

        if (defaultValue !== undefined && prop.name) {
          if (dataType === 'boolean' || dataType === 'Boolean') {
            defaults[prop.name] = defaultValue === 'true' || String(defaultValue).toLowerCase() === 'true';
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
          [operatorId]: JSON.stringify(defaults),
        });
      }
    }
  }, [operatorId, properties, setFieldValue, values.operatorProperties]);

  const updateProperty = (propertyName: string, value: unknown) => {
    try {
      // Sanitize the value to ensure it's JSON-serializable (primitive only)
      const sanitizedValue = sanitizeValue(value);

      // Create a completely new object from scratch to avoid any reference issues
      // Use shared filtering logic to ensure consistency with cleanProperties
      // Note: currentProperties is already cleaned in the memo, but we re-filter here defensively
      // to guard against race conditions or unexpected mutations
      const newProperties = filterToSerializableProperties(currentProperties);

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
      updatedProps[operatorId] = propertiesJson;

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
      toggleText={`Configure ${operatorId} properties`}
      onToggle={(_, expanded) => setIsExpanded(expanded)}
      isExpanded={isExpanded}
      data-testid={`operator-properties-${operatorId}`}
    >
      <Stack hasGutter>
        {properties.map((property) => {
          if (!property.name) return null;

          const fieldId = getFieldId(`${operatorId}-${property.name}`, 'input');
          const currentValue = currentProperties[property.name];
          const isRequired = property.mandatory || false;

          // Normalize API response to match type definition
          const normalized = normalizeOperatorProperty(property);
          const dataType = normalized.dataType;
          const defaultValue = normalized.defaultValue;

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
                    value={computeNumberInputValue(currentValue, defaultValue)}
                    onMinus={() => {
                      const numValue = computeNumberInputValue(currentValue, defaultValue);
                      // Note: Currently enforces minimum of 0, but no maximum limit.
                      // If the API adds optional min/max metadata to property definitions,
                      // this could be enhanced to use property.minValue and property.maxValue.
                      updateProperty(property.name || '', Math.max(0, numValue - 1));
                    }}
                    onPlus={() => {
                      const numValue = computeNumberInputValue(currentValue, defaultValue);
                      // Note: No upper limit currently enforced. If the API adds optional min/max
                      // metadata to property definitions, this could be enhanced to use property.maxValue.
                      updateProperty(property.name || '', numValue + 1);
                    }}
                    onChange={(event) => {
                      const value = parseInt((event.target as HTMLInputElement).value, 10);
                      if (!isNaN(value)) {
                        // Note: Could validate against property.minValue/property.maxValue if API adds this metadata
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
                    onChange={(_, value) => updateProperty(property.name || '', value)}
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

