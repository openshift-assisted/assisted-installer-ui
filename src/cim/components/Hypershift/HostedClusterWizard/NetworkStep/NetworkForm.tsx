import * as React from 'react';
import cidrTools from 'cidr-tools';
import { NetworkFormProps, NetworkFormValues } from './types';
import flattenDeep from 'lodash/flattenDeep';
import xor from 'lodash/xor';
import { Form, Grid, GridItem } from '@patternfly/react-core';
import {
  CheckboxField,
  getHumanizedSubnetRange,
  getSubnet,
  InputField,
  Interface,
  ProxyFields,
  SelectField,
  UploadSSH,
} from '../../../../../common';
import { useFormikContext } from 'formik';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';

import './NetworkForm.css';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

const NetworkForm: React.FC<NetworkFormProps> = ({ agents, onValuesChanged }) => {
  const { values, setFieldValue } = useFormikContext<NetworkFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const allIps = flattenDeep<string>(
    agents
      .filter((a) => !!a.status?.inventory.interfaces)
      .map((a) =>
        (a.status?.inventory.interfaces as Interface[]).map(
          // eslint-disable-next-line
          (i) => (i as any).ipV4Addresses as string[],
        ),
      ),
  );
  const agentCIDRs = allIps.map((ip) => cidrTools.merge([ip][0]));

  const cidrToAgentsMapping = agentCIDRs.reduce((acc, curr) => {
    acc[curr.toString()] = [];
    return acc;
  }, {} as { [key: string]: string[] });

  agents.forEach((agent) => {
    agentCIDRs.forEach((cidr) => {
      if (allIps.some((ipAddr) => cidrTools.overlap(ipAddr, cidr))) {
        cidrToAgentsMapping[cidr.toString()] = [
          ...(cidrToAgentsMapping[cidr.toString()] || []),
          agent.metadata?.uid || '',
        ];
      }
    });
  });

  const uids = agents.map((a) => a.metadata?.uid);

  const availableCIDRs = Object.keys(cidrToAgentsMapping).filter(
    (key) => xor(cidrToAgentsMapping[key], uids).length === 0,
  );

  const cidrOptions = availableCIDRs.map((cidr) => {
    return {
      value: cidr,
      label: getHumanizedSubnetRange(getSubnet(cidr)),
    };
  });

  React.useEffect(() => {
    if (values.machineCIDR === '' && availableCIDRs.length) {
      setFieldValue('machineCIDR', availableCIDRs[0]);
    }
  }, [setFieldValue, availableCIDRs, values.machineCIDR]);
  const { t } = useTranslation();
  return (
    <Form>
      <SelectField label={t('ai:Machine CIDR')} name="machineCIDR" options={cidrOptions} />
      <CheckboxField
        name="isAdvanced"
        label={t('ai:Use advanced networking')}
        className="ai-advanced-fields"
        body={
          values.isAdvanced && (
            <Grid hasGutter>
              <GridItem>
                <InputField name="podCIDR" label={t('ai:Cluster CIDR')} />
              </GridItem>
              <GridItem>
                <InputField name="serviceCIDR" label={t('ai:Service CIDR')} />
              </GridItem>
            </Grid>
          )
        }
        helperText={t('ai:Configure advanced networking properties (e.g. CIDR ranges).')}
      />
      <ProxyFields />
      <UploadSSH isRequired />
    </Form>
  );
};

export default NetworkForm;
