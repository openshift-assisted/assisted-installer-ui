import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Alert, Button, Form, Grid, GridItem } from '@patternfly/react-core';

import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { PopoverIcon, SelectField } from '../../../../../common';
import { getRandomString } from '../../../../../common/utils';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';

import NodePoolForm from './NodePoolForm';
import { HostsFormValues, HostsFormProps, NodePoolFormValue } from './types';

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
            label={t('ai:Namespace')}
            name="agentNamespace"
            options={infraEnvOptions}
            isRequired
            isDisabled={!infraEnvs.length}
            labelIcon={
              <PopoverIcon
                position="right"
                bodyContent={t(
                  'ai:Choose a namespace from your existing host inventory in order to select hosts for your node pools. The namespace will be composed of 1 or more infrastructure environments. After the cluster is created, a host will become a worker node.',
                )}
              />
            }
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
                  onClick={() => {
                    const uniquePoolName = `nodepool-${clusterName}-${getRandomString(5)}`;
                    push({
                      name: uniquePoolName,
                      count: 1,
                      agentLabels: [],
                      releaseImage: initReleaseImage,
                      clusterName,
                    } as NodePoolFormValue);
                  }}
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
