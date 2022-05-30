import React from 'react';
import { TextVariants, TextContent, Text, FormGroup, Grid } from '@patternfly/react-core';
import { useField } from 'formik';
import { CodeField, getFieldId, HostStaticNetworkConfig } from '../../../../../../common';
import { Language } from '@patternfly/react-code-editor';
import StaticIpHostsArray, { HostComponentProps } from '../StaticIpHostsArray';
import HostSummary from '../CollapsedHost';
import { MacIpMapping } from './MacIpMapping';
import { getEmptyYamlHost } from '../../data/emptyData';

const CollapsedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const mapFieldName = `${fieldName}.macInterfaceMap`;
  const [mapField, { error }] = useField<HostStaticNetworkConfig['macInterfaceMap']>({
    name: mapFieldName,
  });
  const macInterfaceMap = mapField.value ? mapField.value : [];
  let hasError = !!error;
  let macAddress = '';
  let mapValue = '';
  if (!macInterfaceMap.length) {
    hasError = true;
  } else {
    macAddress = macInterfaceMap[0].macAddress || '';
    mapValue = macInterfaceMap[0].logicalNicName || '';
  }
  return (
    <HostSummary
      title="MAC to Interface name mapping"
      numInterfaces={macInterfaceMap.length}
      macAddress={macAddress}
      mappingValue={mapValue}
      hostIdx={hostIdx}
      hasError={hasError}
    ></HostSummary>
  );
};

const ExpandedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const mapFieldName = `${fieldName}.macInterfaceMap`;
  const [mapField] = useField<HostStaticNetworkConfig['macInterfaceMap']>({
    name: mapFieldName,
  });
  const macInterfaceMap = mapField.value ? mapField.value : [];
  return (
    <>
      <FormGroup label="" fieldId={getFieldId('nmstateYaml', 'inputs')}>
        <CodeField
          language={Language.yaml}
          name={`${fieldName}.networkYaml`}
          data-testid={`yaml-${hostIdx}`}
        />
      </FormGroup>
      <FormGroup
        label="Mac to interface name mapping"
        fieldId={getFieldId('macNicMaping', 'inputs')}
      >
        <MacIpMapping
          fieldName={mapFieldName}
          macInterfaceMap={macInterfaceMap}
          hostIdx={hostIdx}
        />
      </FormGroup>
    </>
  );
};

export const YamlViewFields: React.FC = () => {
  const emptyHostData = getEmptyYamlHost();
  return (
    <Grid hasGutter>
      <TextContent>
        <Text component={TextVariants.small}>
          Upload, drag and drop, or copy and paste a YAML file that contains NMstate into the editor
          for network configurations. Each host also needs the MAC to interface name mapping.
        </Text>
      </TextContent>

      <StaticIpHostsArray<HostStaticNetworkConfig>
        ExpandedHostComponent={ExpandedHost}
        CollapsedHostComponent={CollapsedHost}
        emptyHostData={emptyHostData}
        enableCopyAboveConfiguration={true}
      ></StaticIpHostsArray>
    </Grid>
  );
};
