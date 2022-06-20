import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { SelectField } from '../../../../../common';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { HostsFormValues, HostsFormProps, NodePoolFormValue } from './types';
import { Button, Form, Grid, GridItem } from '@patternfly/react-core';
import NodePoolForm from './NodePoolForm';
import { PlusCircleIcon } from '@patternfly/react-icons';

const HostsForm: React.FC<HostsFormProps> = ({
  onValuesChanged,
  infraEnvs,
  agents,
  clusterName,
  initReleaseImage,
}) => {
  const { values } = useFormikContext<HostsFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const infraEnvOptions = infraEnvs.length
    ? infraEnvs.map((ie) => ({
        label: ie.metadata?.namespace || '',
        value: ie.metadata?.namespace || '',
      }))
    : [
        {
          label: 'No namespace with hosts is available',
          value: 'NOT_AVAILABLE',
        },
      ];

  return (
    <Grid hasGutter>
      <GridItem>
        <Form>
          <Grid hasGutter>
            <GridItem>
              <SelectField
                label="Hosts namespace"
                name="agentNamespace"
                options={infraEnvOptions}
                isRequired
                isDisabled={!infraEnvOptions.length}
              />
            </GridItem>
            <FieldArray name="nodePools">
              {({ remove, push }) => (
                <>
                  {values.nodePools.map((nodePool, index) => (
                    <GridItem key={index}>
                      <NodePoolForm
                        index={index}
                        agents={agents}
                        infraEnvs={infraEnvs}
                        onRemove={() => remove(index)}
                      />
                    </GridItem>
                  ))}
                  <GridItem>
                    <Button
                      variant="link"
                      icon={<PlusCircleIcon />}
                      iconPosition="right"
                      onClick={() =>
                        push({
                          name: `nodepool-${clusterName}-${values.nodePools.length + 1}`,
                          count: 1,
                          autoSelectedAgentIDs: [],
                          manualHostSelect: false,
                          selectedAgentIDs: [],
                          agentLabels: [],
                          releaseImage: initReleaseImage,
                          clusterName,
                        } as NodePoolFormValue)
                      }
                    >
                      Add Nodepool
                    </Button>
                  </GridItem>
                </>
              )}
            </FieldArray>
          </Grid>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default HostsForm;
