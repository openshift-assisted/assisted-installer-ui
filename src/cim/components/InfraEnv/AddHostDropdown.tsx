import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { PopoverIcon } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { AddBmcHostModal, AddBmcHostYamlModal, AddHostModal } from '../modals';
import { AddHostDropdownProps } from './types';
import './AddHostDropdown.css';

type ModalType = 'iso' | 'bmc' | 'yaml' | 'ipxe' | undefined;

const AddHostDropdown = ({
  infraEnv,
  agentClusterInstall,
  onSaveISOParams,
  usedHostnames,
  onCreateBMH,
  docVersion,
  onCreateBmcByYaml,
  isBMPlatform,
}: AddHostDropdownProps) => {
  const [addModalType, setAddModalType] = React.useState<ModalType>(undefined);
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Dropdown
        id="infraenv-actions"
        toggle={
          <DropdownToggle id="dropdown-basic" onToggle={setIsKebabOpen} toggleVariant="primary">
            {t('ai:Add hosts')}
          </DropdownToggle>
        }
        isOpen={isKebabOpen}
        dropdownItems={[
          <DropdownItem
            key="discovery-iso"
            onClick={() => {
              setIsKebabOpen(false);
              setAddModalType('iso');
            }}
            description={t('ai:Discover hosts by booting a discovery image')}
          >
            {t('ai:With Discovery ISO')}
          </DropdownItem>,
          <DropdownItem
            key="ipxe"
            onClick={() => {
              setIsKebabOpen(false);
              setAddModalType('ipxe');
            }}
            description={t('ai:Use when you have an iPXE server that has already been set up.')}
          >
            {t('ai:With iPXE')}
          </DropdownItem>,
          <DropdownSeparator key="separator" />,
          <DropdownGroup
            id="discovery-bmc"
            key="discovery-bmc"
            className="ai-discovery-bmc__group"
            label={
              <Split hasGutter>
                <SplitItem>{t('ai:Baseboard Management Controller (BMC)')}</SplitItem>
                <SplitItem>
                  {!isBMPlatform && (
                    <>
                      {' '}
                      <PopoverIcon
                        noVerticalAlign
                        bodyContent={
                          <p>
                            {t(
                              `ai:To enable the host's baseboard management controller (BMC) on the hub cluster, deploy the hub cluster on vSphere, BareMetal, OpenStack, or platform-agnostic (none type).`,
                            )}
                          </p>
                        }
                      />
                    </>
                  )}
                </SplitItem>
              </Split>
            }
          >
            <DropdownItem
              key="with-credentials"
              onClick={() => {
                setIsKebabOpen(false);
                setAddModalType('bmc');
              }}
              description={t('ai:Discover a single host via Baseboard Management Controller')}
              isDisabled={!isBMPlatform}
            >
              {t('ai:With BMC form')}
            </DropdownItem>
            <DropdownItem
              key="upload-yaml"
              onClick={() => {
                setIsKebabOpen(false);
                setAddModalType('yaml');
              }}
              description={t(
                'ai:Discover multiple hosts by providing yaml with Bare Metal Host definitions',
              )}
              isDisabled={!isBMPlatform}
            >
              {t('ai:By uploading a YAML')}
            </DropdownItem>
          </DropdownGroup>,
        ]}
        position={'right'}
      />
      {addModalType === 'iso' && (
        <AddHostModal
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onSaveISOParams={onSaveISOParams}
          docVersion={docVersion}
        />
      )}
      {addModalType === 'ipxe' && (
        <AddHostModal
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onSaveISOParams={onSaveISOParams}
          docVersion={docVersion}
          isIPXE
        />
      )}
      {addModalType === 'bmc' && (
        <AddBmcHostModal
          infraEnv={infraEnv}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onCreateBMH={onCreateBMH}
          usedHostnames={usedHostnames}
          docVersion={docVersion}
        />
      )}
      {addModalType === 'yaml' && (
        <AddBmcHostYamlModal
          infraEnv={infraEnv}
          isOpen
          onClose={() => setAddModalType(undefined)}
          onCreateBmcByYaml={onCreateBmcByYaml}
          docVersion={docVersion}
        />
      )}
    </>
  );
};

export default AddHostDropdown;
