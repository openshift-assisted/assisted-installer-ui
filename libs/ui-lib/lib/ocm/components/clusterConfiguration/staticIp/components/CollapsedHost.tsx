import {
  Flex,
  FlexItem,
  Label,
  StackItem,
  Content,
  ContentVariants,
  } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import React from 'react';

export type HostSummaryProps = {
  title: string;
  macAddress: string;
  mappingValue: string;
  numInterfaces: number;
  hostIdx: number;
  hasError: boolean;
  bondPrimaryInterface: string;
  bondSecondaryInterface: string;
};

const getLabelCollapsedHost = (
  macAddress: string,
  mappingValue: string,
  bondPrimaryInterface: string,
  bondSecondaryInterface: string,
) => {
  if (bondPrimaryInterface !== '' && bondSecondaryInterface !== '') {
    return `${bondPrimaryInterface}/${bondSecondaryInterface} -> ${mappingValue}`;
  } else {
    return `${macAddress} -> ${mappingValue}`;
  }
};

const HostSummary: React.FC<HostSummaryProps> = ({
  title,
  macAddress,
  mappingValue,
  numInterfaces,
  hasError,
  hostIdx,
  bondPrimaryInterface,
  bondSecondaryInterface,
}) => {
  return (
    <>
      <StackItem data-testid={`collapsed-host-${hostIdx}`}>
        <Flex>
          <FlexItem>
            <Content>
              <Content component={ContentVariants.small}>{title}</Content>
            </Content>
          </FlexItem>
          {hasError && (
            <Label
              variant="outline"
              color="red"
              icon={<InfoCircleIcon />}
              data-testid="host-errors-label"
            >
              Missing Information
            </Label>
          )}
          {!hasError && (
            <>
              <FlexItem>
                <Label variant="outline" data-testid="first-mapping-label">
                  {getLabelCollapsedHost(
                    macAddress,
                    mappingValue,
                    bondPrimaryInterface,
                    bondSecondaryInterface,
                  )}
                </Label>{' '}
              </FlexItem>
              {numInterfaces > 1 && (
                <FlexItem>
                  <Label variant="outline" data-testid="remaining-mapping-label">{`${
                    numInterfaces - 1
                  } left`}</Label>
                </FlexItem>
              )}
            </>
          )}
        </Flex>
      </StackItem>
    </>
  );
};

export default HostSummary;
