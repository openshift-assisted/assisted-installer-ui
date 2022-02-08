import React from 'react';
import { ENCRYPTING_DISK_DURING_INSTALLATION } from '../../../config/constants';
import PopoverIcon from '../../ui/PopoverIcon';
import { RadioField } from '../../ui/formik';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import {
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Text,
  TextVariants,
  TextContent,
} from '@patternfly/react-core';
import { TangServers } from './TangServers';
import '../tangServers.css';
import { DiskEncryption } from '../../../api/types';

const DiskEncryptionModeTPMv2: React.FC = () => {
  return (
    <>
      TPM v2
      <PopoverIcon
        component={'a'}
        variant={'plain'}
        IconComponent={HelpIcon}
        minWidth="22rem"
        bodyContent={
          <p>
            TPM v2 stores passphrases in a secure cryptoprocessor contained within as server. &nbsp;
            <a href={ENCRYPTING_DISK_DURING_INSTALLATION} target="_blank" rel="noopener noreferrer">
              {'Learn more'} <ExternalLinkAltIcon />
            </a>
          </p>
        }
      />
    </>
  );
};

const DiskEncryptionModeTang: React.FC = () => {
  return (
    <>
      Tang{' '}
      <PopoverIcon
        component={'a'}
        variant={'plain'}
        IconComponent={HelpIcon}
        minWidth="25rem"
        bodyContent={
          <p>
            Tang server component that enable network-bound disk encryption (NBDE). &nbsp;
            <a href={ENCRYPTING_DISK_DURING_INSTALLATION} target="_blank" rel="noopener noreferrer">
              {'Learn more'} <ExternalLinkAltIcon />
            </a>
          </p>
        }
      />
    </>
  );
};

export interface DiskEncryptionModeProps {
  isDisabled?: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
}

export const DiskEncryptionMode: React.FC<DiskEncryptionModeProps> = ({
  diskEncryptionMode,
  isDisabled,
}) => {
  return (
    <Stack>
      <StackItem>
        <Flex>
          <FlexItem spacer={{ default: 'spacer3xl' }}>
            <RadioField
              isDisabled={isDisabled}
              name="diskEncryptionMode"
              label={<DiskEncryptionModeTPMv2 />}
              id="TPMV2-button"
              value="tpmv2"
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacer3xl' }}>
            <RadioField
              isDisabled={isDisabled}
              name="diskEncryptionMode"
              label={<DiskEncryptionModeTang />}
              id="tang-button"
              value="tang"
            />
          </FlexItem>
        </Flex>
      </StackItem>
      {diskEncryptionMode === 'tang' && (
        <Stack>
          &nbsp;
          <StackItem>
            <TextContent>
              <Text component={TextVariants.h6}>Tang servers</Text>
            </TextContent>
          </StackItem>
          &nbsp;
          <TangServers isDisabled={isDisabled} />
        </Stack>
      )}
    </Stack>
  );
};
