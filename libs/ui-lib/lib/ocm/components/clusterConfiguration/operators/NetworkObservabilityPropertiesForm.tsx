import * as React from 'react';
import {
  ExpandableSection,
  FormGroup,
  HelperText,
  HelperTextItem,
  NumberInput,
  Stack,
  StackItem,
  Switch,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { getFieldId, OperatorsValues } from '../../../../common';
import {
  DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES,
  NETWORK_OBSERVABILITY_OPERATOR_ID,
  NetworkObservabilityProperties,
  parseNetworkObservabilityProperties,
  serializeNetworkObservabilityProperties,
} from './networkObservabilityProperties';
import './NetworkObservabilityPropertiesForm.css';

interface NetworkObservabilityPropertiesFormProps {
  isDisabled?: boolean;
}

const NetworkObservabilityPropertiesForm: React.FC<NetworkObservabilityPropertiesFormProps> = ({
  isDisabled = false,
}) => {
  const { values, setFieldValue, errors } = useFormikContext<OperatorsValues>();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const initializationRef = React.useRef(false);

  const currentProperties = React.useMemo(
    () =>
      parseNetworkObservabilityProperties(
        values.operatorProperties[NETWORK_OBSERVABILITY_OPERATOR_ID],
      ),
    [values.operatorProperties],
  );

  React.useEffect(() => {
    if (
      !initializationRef.current &&
      !values.operatorProperties[NETWORK_OBSERVABILITY_OPERATOR_ID]
    ) {
      initializationRef.current = true;
      setFieldValue('operatorProperties', {
        ...values.operatorProperties,
        [NETWORK_OBSERVABILITY_OPERATOR_ID]: serializeNetworkObservabilityProperties(
          DEFAULT_NETWORK_OBSERVABILITY_PROPERTIES,
        ),
      });
    }
  }, [setFieldValue, values.operatorProperties]);

  const updateProperties = (nextProperties: NetworkObservabilityProperties) => {
    setFieldValue('operatorProperties', {
      ...values.operatorProperties,
      [NETWORK_OBSERVABILITY_OPERATOR_ID]: serializeNetworkObservabilityProperties(nextProperties),
    });
  };

  const createFlowCollectorFieldId = getFieldId(
    'network-observability-createFlowCollector',
    'input',
  );
  const samplingFieldId = getFieldId('network-observability-sampling', 'input');
  const operatorPropertiesError = errors.operatorProperties?.[NETWORK_OBSERVABILITY_OPERATOR_ID];

  return (
    <ExpandableSection
      className="ai-network-observability-properties-form"
      toggleText="Configure Network Observability properties"
      onToggle={(_, expanded) => setIsExpanded(expanded)}
      isExpanded={isExpanded}
      isIndented
      data-testid="operator-properties-network-observability"
    >
      <Stack hasGutter>
        <StackItem>
          <FormGroup fieldId={createFlowCollectorFieldId} label="Create FlowCollector">
            <HelperText>
              <HelperTextItem>
                Whether to create a FlowCollector resource automatically. If false, only the
                operator will be installed.
              </HelperTextItem>
            </HelperText>
            <Switch
              id={createFlowCollectorFieldId}
              label="Create FlowCollector"
              isChecked={currentProperties.createFlowCollector}
              onChange={(_, checked) =>
                updateProperties({
                  ...currentProperties,
                  createFlowCollector: checked,
                })
              }
              isDisabled={isDisabled}
              data-testid="operator-property-network-observability-createFlowCollector"
            />
          </FormGroup>
        </StackItem>
        {currentProperties.createFlowCollector && (
          <StackItem>
            <FormGroup fieldId={samplingFieldId} label="Sampling rate">
              <HelperText>
                <HelperTextItem>
                  Sampling rate for the eBPF agent. A value of 50 means one packet every 50 is
                  sampled. Lower values increase resource utilization.
                </HelperTextItem>
              </HelperText>
              <NumberInput
                id={samplingFieldId}
                value={currentProperties.sampling}
                min={1}
                onMinus={() =>
                  updateProperties({
                    ...currentProperties,
                    sampling: Math.max(1, currentProperties.sampling - 1),
                  })
                }
                onPlus={() =>
                  updateProperties({
                    ...currentProperties,
                    sampling: currentProperties.sampling + 1,
                  })
                }
                onChange={(event) => {
                  const value = parseInt((event.target as HTMLInputElement).value, 10);
                  if (!isNaN(value)) {
                    updateProperties({
                      ...currentProperties,
                      sampling: value,
                    });
                  }
                }}
                isDisabled={isDisabled}
                data-testid="operator-property-network-observability-sampling"
              />
              {operatorPropertiesError && (
                <HelperText>
                  <HelperTextItem variant="error">{operatorPropertiesError}</HelperTextItem>
                </HelperText>
              )}
            </FormGroup>
          </StackItem>
        )}
      </Stack>
    </ExpandableSection>
  );
};

export default NetworkObservabilityPropertiesForm;
