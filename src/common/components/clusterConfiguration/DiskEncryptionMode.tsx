import React from 'react';
import { ENCRYPTING_DISK_DURING_INSTALLATION } from '../../config/constants';
import PopoverIcon from '../ui/PopoverIcon';
import { InputField, RadioField } from '../ui/formik';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
import { FieldArray, useFormikContext } from 'formik';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Text,
  TextVariants,
  TextInputTypes,
  TextContent,
  Tooltip,
} from '@patternfly/react-core';
import { PlusCircleIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { DiskEncryption } from '../../api';
import { ClusterDetailsValues } from '../clusterWizard/types';
import './tangServers.css';

export interface DiskEncryptionControlGroupProps {
  enableDiskEncryptionOnWorkers: boolean;
  enableDiskEncryptionOnMasters: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  isDisabled?: boolean;
}

const REMOVE_TANG_SERVER_SHOWN_TIMER = 1500;

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

export const TangServersFields: React.FC<{ isDisabled?: boolean }> = ({ isDisabled = false }) => {
  const { values } = useFormikContext<ClusterDetailsValues>();

  return (
    <FieldArray name="diskEncryptionTangServers">
      {({ remove, push }) => (
        <Stack>
          <StackItem>
            {values.diskEncryptionTangServers.length > 0 &&
              values.diskEncryptionTangServers.map((tang, index) => (
                <>
                  <Tooltip
                    hidden={index == 0 || isDisabled}
                    exitDelay={REMOVE_TANG_SERVER_SHOWN_TIMER}
                    flipBehavior={['right', 'bottom']}
                    distance={1}
                    className="tooltip-tang-servers"
                    position="right-start"
                    content={
                      <Button
                        variant={ButtonVariant.link}
                        onClick={() => {
                          remove(index);
                        }}
                      >
                        <MinusCircleIcon size="sm" />
                      </Button>
                    }
                  >
                    <div>
                      <InputField
                        type={TextInputTypes.url}
                        name={`diskEncryptionTangServers.${index}.url`}
                        placeholder="http//tang.srv"
                        label="Server URL"
                        isRequired
                        isDisabled={isDisabled}
                      />
                      &thinsp;
                      <InputField
                        type={TextInputTypes.text}
                        name={`diskEncryptionTangServers.${index}.thumbprint`}
                        label="Server Thumbprint"
                        isRequired
                        isDisabled={isDisabled}
                      />
                    </div>
                  </Tooltip>{' '}
                  &nbsp;
                </>
              ))}
          </StackItem>
          {!isDisabled && (
            <StackItem>
              <Button
                variant={ButtonVariant.link}
                onClick={() => push({ url: '', thumbprint: '' })}
                isInline
              >
                <PlusCircleIcon size="sm" hidden={isDisabled} />
                &nbsp;Add another Tang server
              </Button>
            </StackItem>
          )}
        </Stack>
      )}
    </FieldArray>
  );
};

export const DiskEncryptionMode: React.FC<DiskEncryptionControlGroupProps> = ({
  enableDiskEncryptionOnMasters,
  enableDiskEncryptionOnWorkers,
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
      {(enableDiskEncryptionOnMasters || enableDiskEncryptionOnWorkers) &&
        diskEncryptionMode == 'tang' && (
          <Stack>
            &nbsp;
            <StackItem>
              <TextContent>
                <Text component={TextVariants.h6}>Tang servers</Text>
              </TextContent>
            </StackItem>
            &nbsp;
            <TangServersFields isDisabled={isDisabled} />
          </Stack>
        )}
    </Stack>
  );
};
