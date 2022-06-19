import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { SelectField } from '../../../../../common';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { HostsFormValues, HostsFormProps } from './types';
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

  const infraEnvOptions = infraEnvs.map((ie) => ({
    label: ie.metadata?.name || '',
    value: ie.metadata?.namespace || '',
  }));

  return (
    <Grid hasGutter>
      <GridItem>
        <Form>
          <Grid hasGutter>
            <GridItem>
              <SelectField
                label="Infrastructure environment"
                name="agentNamespace"
                options={infraEnvOptions}
                isRequired
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
                          name: `${clusterName}-${values.nodePools.length + 1}`,
                          count: 1,
                          autoSelectedAgentIDs: [],
                          autoSelectHosts: true,
                          selectedAgentIDs: [],
                          agentLabels: [],
                          releaseImage: initReleaseImage,
                          clusterName,
                        })
                      }
                    >
                      Add node pool
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
