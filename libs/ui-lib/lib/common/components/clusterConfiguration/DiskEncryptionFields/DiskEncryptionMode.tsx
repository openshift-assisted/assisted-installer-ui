import React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import {
  Flex,
  FlexItem,
  Stack,
  StackItem,
  Content,
  ContentVariants,
  TooltipProps,
  Tooltip,
} from '@patternfly/react-core';
import { getEncryptingDiskDuringInstallationDocsLink } from '../../../config';
import PopoverIcon from '../../ui/PopoverIcon';
import { RadioField } from '../../ui/formik';
import { TangServers } from './TangServers';
import { DiskEncryption } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

const DiskEncryptionModeTPMv2 = ({ docVersion }: { docVersion: string }) => {
  const { t } = useTranslation();
  return (
    <>
      TPM v2{' '}
      <PopoverIcon
        component={'a'}
        minWidth="22rem"
        bodyContent={
          <p>
            {t(
              'ai:TPM v2 stores passphrases in a secure cryptoprocessor contained within as server.',
            )}
            &nbsp;
            <a
              href={getEncryptingDiskDuringInstallationDocsLink(docVersion)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('ai:Learn more')} <ExternalLinkAltIcon />
            </a>
          </p>
        }
      />
    </>
  );
};

const DiskEncryptionModeTang = ({ docVersion }: { docVersion: string }) => {
  const { t } = useTranslation();
  return (
    <>
      Tang{' '}
      <PopoverIcon
        component={'a'}
        minWidth="25rem"
        bodyContent={
          <p>
            {t('ai:Tang server component that enable network-bound disk encryption (NBDE).')} &nbsp;
            <a
              href={getEncryptingDiskDuringInstallationDocsLink(docVersion)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('ai:Learn more')} <ExternalLinkAltIcon />
            </a>
          </p>
        }
      />
    </>
  );
};

export interface DiskEncryptionModeProps {
  isDisabled: boolean;
  diskEncryptionMode: DiskEncryption['mode'];
  tooltipProps: TooltipProps;
  docVersion: string;
}

export const DiskEncryptionMode = ({
  diskEncryptionMode,
  isDisabled,
  tooltipProps,
  docVersion,
}: DiskEncryptionModeProps) => {
  const { t } = useTranslation();
  return (
    <Stack>
      <StackItem>
        <Flex>
          <FlexItem spacer={{ default: 'spacer3xl' }}>
            <Tooltip {...tooltipProps}>
              <RadioField
                isDisabled={isDisabled}
                name="diskEncryptionMode"
                label={<DiskEncryptionModeTPMv2 docVersion={docVersion} />}
                id="TPMV2-button"
                value="tpmv2"
              />
            </Tooltip>
          </FlexItem>
          <FlexItem spacer={{ default: 'spacer3xl' }}>
            <Tooltip {...tooltipProps}>
              <RadioField
                isDisabled={isDisabled}
                name="diskEncryptionMode"
                label={<DiskEncryptionModeTang docVersion={docVersion} />}
                id="tang-button"
                value="tang"
              />
            </Tooltip>
          </FlexItem>
        </Flex>
      </StackItem>
      {diskEncryptionMode === 'tang' && (
        <Stack>
          &nbsp;
          <StackItem>
            <Content>
              <Content component={ContentVariants.h6}>{t('ai:Tang servers')}</Content>
            </Content>
          </StackItem>
          &nbsp;
          <TangServers isDisabled={isDisabled} tooltipProps={tooltipProps} />
        </Stack>
      )}
    </Stack>
  );
};
