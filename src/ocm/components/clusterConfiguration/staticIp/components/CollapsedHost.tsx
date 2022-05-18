import {
  Flex,
  FlexItem,
  Label,
  StackItem,
  TextContent,
  TextVariants,
  Text,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import React from 'react';

export type HostSummaryProps = {
  title: string;
  macAddress: string;
  mappingValue: string;
  numInterfaces: number;
  hostIdx: number;
  hasError: boolean;
};

const HostSummary: React.FC<HostSummaryProps> = ({
  title,
  macAddress,
  mappingValue,
  numInterfaces,
  hasError,
  hostIdx,
}) => {
  return (
    <>
      <StackItem data-testid={`collapsed-host-${hostIdx}`}>
        <Flex>
          <FlexItem>
            <TextContent>
              <Text component={TextVariants.small}>{title}</Text>
            </TextContent>
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
                <Label
                  variant="outline"
                  data-testid="first-mapping-label"
                >{`${macAddress} -> ${mappingValue}`}</Label>{' '}
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
