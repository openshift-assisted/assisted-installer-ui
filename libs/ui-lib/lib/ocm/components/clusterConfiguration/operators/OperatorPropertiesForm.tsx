import * as React from 'react';
import {
  ExpandableSection,
  FormGroup,
  FormSelect,
  FormSelectOption,
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
import { getOperatorPropertyLabel } from './utils';
import './OperatorPropertiesForm.css';

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
  operatorTitle: string;
  properties: (ApiOperatorProperty | OperatorProperty)[];
  isDisabled?: boolean;
}

type OperatorPropertyValue = string | number | boolean;
type OperatorPropertyValues = Record<string, OperatorPropertyValue>;

const parseOperatorProperties = (propertiesJson: string): OperatorPropertyValues => {
  try {
    const parsed: unknown = JSON.parse(propertiesJson);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as OperatorPropertyValues;
  } catch {
    return {};
  }
};

const normalizeOperatorProperty = (
  prop: ApiOperatorProperty | OperatorProperty,
): NormalizedOperatorProperty => {
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
const computeNumberInputValue = (currentValue: unknown, defaultValue: unknown): number => {
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
  operatorTitle,
  properties,
  isDisabled = false,
}) => {
  const { values, setFieldValue } = useFormikContext<OperatorsValues>();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const initializationRef = React.useRef(false);

  // Parse current properties JSON or use defaults
  const currentProperties = React.useMemo(
    () => parseOperatorProperties(values.operatorProperties?.[operatorId] || '{}'),
    [values.operatorProperties, operatorId],
  );

  // Initialize with default values if not set
  React.useEffect(() => {
    if (
      !initializationRef.current &&
      (!values.operatorProperties || !values.operatorProperties[operatorId])
    ) {
      initializationRef.current = true;
      const defaults: OperatorPropertyValues = {};
      properties.forEach((prop) => {
        // Normalize API response to match type definition
        const normalized = normalizeOperatorProperty(prop);
        const defaultValue = normalized.defaultValue;
        const dataType = normalized.dataType;

        if (defaultValue !== undefined && prop.name) {
          if (dataType === 'boolean' || dataType === 'Boolean') {
            defaults[prop.name] =
              defaultValue === 'true' || String(defaultValue).toLowerCase() === 'true';
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

  const updateProperty = (propertyName: string, value: OperatorPropertyValue) => {
    setFieldValue('operatorProperties', {
      ...(values.operatorProperties || {}),
      [operatorId]: JSON.stringify({ ...currentProperties, [propertyName]: value }),
    });
  };

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <ExpandableSection
      className="ai-operator-properties-form"
      toggleText={`Configure ${operatorTitle} properties`}
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
          const propertyOptions = normalized.options;
          const hasOptions = !!propertyOptions?.length;

          return (
            <StackItem key={property.name}>
              <FormGroup
                fieldId={fieldId}
                label={getOperatorPropertyLabel(operatorId, property.name)}
                isRequired={isRequired}
              >
                {property.description && (
                  <HelperText>
                    <HelperTextItem>{property.description}</HelperTextItem>
                  </HelperText>
                )}
                {hasOptions ? (
                  <FormSelect
                    id={fieldId}
                    value={String(currentValue ?? defaultValue ?? '')}
                    onChange={(_, value) => updateProperty(property.name || '', value)}
                    isDisabled={isDisabled}
                    aria-label={getOperatorPropertyLabel(operatorId, property.name)}
                    data-testid={`operator-property-${operatorId}-${property.name}`}
                  >
                    {propertyOptions.map((option) => (
                      <FormSelectOption key={option} value={option} label={option} />
                    ))}
                  </FormSelect>
                ) : dataType === 'boolean' || dataType === 'Boolean' ? (
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
