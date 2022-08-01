import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { SelectField } from '../../../../../common';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { HostsFormValues, HostsFormProps, NodePoolFormValue } from './types';
import { Alert, Button, Form, Grid, GridItem } from '@patternfly/react-core';
import NodePoolForm from './NodePoolForm';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

const HostsForm: React.FC<HostsFormProps> = ({
  onValuesChanged,
  infraEnvs,
  agents,
  clusterName,
  initReleaseImage,
}) => {
  const { values } = useFormikContext<HostsFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const { t } = useTranslation();
  const infraEnvOptions = infraEnvs.length
    ? infraEnvs.map((ie) => ({
        label: ie.metadata?.namespace || '',
        value: ie.metadata?.namespace || '',
      }))
    : [
        {
          label: t('ai:No namespace with hosts is available'),
          value: 'NOT_AVAILABLE',
        },
      ];

  const totalHosts = values.nodePools.reduce((acc, nodePool) => {
    acc += nodePool.count;
    return acc;
  }, 0);

  return (
    <Form>
      <Grid hasGutter>
        <GridItem>
          <SelectField
            label={t('ai:Hosts namespace')}
            name="agentNamespace"
            options={infraEnvOptions}
            isRequired
            isDisabled={!infraEnvs.length}
          />
        </GridItem>
        {totalHosts === 0 && (
          <GridItem>
            <Alert
              isInline
              variant="warning"
              title={t('ai:The cluster has 0 hosts. No workloads will be able to run.')}
            />
          </GridItem>
        )}
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
                      agentLabels: [],
                      releaseImage: initReleaseImage,
                      clusterName,
                    } as NodePoolFormValue)
                  }
                >
                  {t('ai:Add Nodepool')}
                </Button>
              </GridItem>
            </>
          )}
        </FieldArray>
      </Grid>
    </Form>
  );
};

export default HostsForm;
