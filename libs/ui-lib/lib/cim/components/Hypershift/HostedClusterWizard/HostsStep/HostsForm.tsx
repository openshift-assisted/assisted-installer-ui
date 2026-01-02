import * as React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import {
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Form,
  FormGroup,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { PopoverIcon, RadioField } from '../../../../../common';
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
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<HostsFormValues>();
  const [namespaceDropdownOpen, setNamespaceDropdownOpen] = React.useState(false);
  useTemptiflySync({ values, onValuesChanged });

  const infraEnvOptions = infraEnvs.map((ie) => ({
    label: ie.metadata?.namespace || '',
    value: ie.metadata?.namespace || '',
  }));

  const totalHosts = values.nodePools.reduce((acc, nodePool) => {
    acc += nodePool.useAutoscaling ? nodePool.autoscaling.maxReplicas : nodePool.count;
    return acc;
  }, 0);

  return (
    <Form>
      <Grid hasGutter>
        <GridItem>
          <FormGroup isInline label={<>{t('ai:Controller availability policy')}</>} isRequired>
            <RadioField
              name={'controllerAvailabilityPolicy'}
              label={
                <>
                  {t('ai:Highly available')}{' '}
                  <PopoverIcon
                    bodyContent={t(
                      'ai:Highly available means components should be resilient to problems across fault boundaries as defined by the component to which the policy is attached. This usually means running critical workloads with 3 replicas and with little or no toleration of disruption of the component.',
                    )}
                  />
                </>
              }
              value={'HighlyAvailable'}
            />
            <RadioField
              name={'controllerAvailabilityPolicy'}
              label={
                <>
                  {t('ai:Single replica')}{' '}
                  <PopoverIcon
                    bodyContent={t(
                      'ai:Single replica means components are not expected to be resilient to problems across most fault boundaries associated with high availability. This usually means running critical workloads with just 1 replica and with toleration of full disruption of the component.',
                    )}
                  />
                </>
              }
              value={'SingleReplica'}
            />
          </FormGroup>
        </GridItem>

        <GridItem>
          <FormGroup isInline label={<>{t('ai:Infrastructure availability policy')}</>} isRequired>
            <RadioField
              name={'infrastructureAvailabilityPolicy'}
              label={
                <>
                  {t('ai:Highly available')}{' '}
                  <PopoverIcon
                    bodyContent={t(
                      'ai:Highly available means components should be resilient to problems across fault boundaries as defined by the component to which the policy is attached. This usually means running critical workloads with 3 replicas and with little or no toleration of disruption of the component.',
                    )}
                  />
                </>
              }
              value={'HighlyAvailable'}
            />
            <RadioField
              name={'infrastructureAvailabilityPolicy'}
              label={
                <>
                  {t('ai:Single replica')}{' '}
                  <PopoverIcon
                    bodyContent={t(
                      'ai:Single replica means components are not expected to be resilient to problems across most fault boundaries associated with high availability. This usually means running critical workloads with just 1 replica and with toleration of full disruption of the component.',
                    )}
                  />
                </>
              }
              value={'SingleReplica'}
            />
          </FormGroup>
        </GridItem>

        <GridItem>
          <FormGroup isInline label={<>{t('ai:OLM catalog placement')}</>} isRequired>
            <RadioField
              name={'olmCatalogPlacement'}
              label={
                <>
                  {t('ai:Management')}{' '}
                  <PopoverIcon
                    bodyContent={t(
                      'ai:OLM catalog components will be deployed onto the management cluster.',
                    )}
                  />
                </>
              }
              value={'management'}
            />
            <RadioField
              name={'olmCatalogPlacement'}
              label={
                <>
                  {t('ai:Guest')}{' '}
                  <PopoverIcon
                    bodyContent={t(
                      'ai:OLM catalog components will be deployed onto the guest cluster.',
                    )}
                  />
                </>
              }
              value={'guest'}
            />
          </FormGroup>
        </GridItem>

        <GridItem>
          <FormGroup
            label={t('ai:Namespace')}
            labelHelp={
              <PopoverIcon
                position="right"
                bodyContent={t(
                  'ai:Choose a namespace from your existing host inventory in order to select hosts for your node pools. The namespace will be composed of 1 or more infrastructure environments. After the cluster is created, a host will become a worker node.',
                )}
              />
            }
            isRequired
            isInline
          >
            <Dropdown
              isOpen={namespaceDropdownOpen}
              onSelect={(_, value) => {
                setFieldValue('agentNamespace', value);
                setNamespaceDropdownOpen(false);
              }}
              onOpenChange={(isOpen: boolean) => setNamespaceDropdownOpen(isOpen)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setNamespaceDropdownOpen(!namespaceDropdownOpen)}
                  isExpanded={namespaceDropdownOpen}
                  isFullWidth
                  isDisabled={!infraEnvs.length}
                  aria-disabled={!infraEnvs.length}
                >
                  {values.agentNamespace || t('ai:No namespace with hosts is available')}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <DropdownList>
                {infraEnvOptions.map((option, i) => (
                  <DropdownItem key={`infra-env-option-${i}`} value={option.value}>
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownList>
            </Dropdown>
          </FormGroup>
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
                      nodePoolName: uniquePoolName,
                      count: 1,
                      agentLabels: [],
                      releaseImage: initReleaseImage,
                      clusterName,
                      useAutoscaling: false,
                      autoscaling: {
                        minReplicas: 1,
                        maxReplicas: 1,
                      },
                    } as NodePoolFormValue);
                  }}
                >
                  {t('ai:Add nodepool')}
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
