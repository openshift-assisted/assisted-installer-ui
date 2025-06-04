import * as React from 'react';
import {
  Button,
  ButtonType,
  ButtonVariant,
  Form,
  HelperText,
  HelperTextItem,
  Popover,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Modal, ModalBoxBody, ModalBoxFooter } from '@patternfly/react-core/deprecated';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { t_global_icon_color_status_info_default as blueInfoColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_info_default';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { TFunction } from 'i18next';

import {
  RichInputField,
  getRichTextValidation,
  richHostnameValidationSchema,
  hostnameValidationMessages,
  ModalProgress,
  FORBIDDEN_HOSTNAMES,
} from '../ui';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { getHostname as getHostnameUtils, getInventory } from './utils';
import { ActionCheck } from './types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getApiErrorMessage } from '../../api'; // eslint-disable-line no-restricted-imports

import './MassChangeHostnameModal.css';

const getHostname = (host: Host) => {
  const inventory = getInventory(host);
  return getHostnameUtils(host, inventory) || '';
};

const templateToHostname = (index: number, values: EditHostFormValues) =>
  values.hostname.replace(/{{n+}}/g, `${index + 1}`);

const getNewHostnames = (
  values: EditHostFormValues,
  selectedHosts: Host[],
  canChangeHostname: (host: Host) => ActionCheck,
) => {
  let index = 0;
  return selectedHosts.map((h) => {
    const [changeEnabled, reason] = canChangeHostname(h);
    const hostnameRes = {
      newHostname: changeEnabled ? templateToHostname(index, values) : undefined,
      reason: changeEnabled ? undefined : reason,
    };
    if (changeEnabled) {
      index++;
    }
    return hostnameRes;
  });
};

type EditHostFormValues = {
  hostname: string;
};

const initialValues = {
  hostname: '',
};

const validationSchema = (
  initialValues: EditHostFormValues,
  usedHostnames: string[],
  t: TFunction,
) =>
  Yup.object().shape({
    hostname: richHostnameValidationSchema(t, usedHostnames, initialValues.hostname).required(
      t('ai:Required field'),
    ),
  });

const updateHostnameValidationResult = (
  validationResult: { [key: string]: string[] } | undefined,
  message: string,
) => {
  validationResult = {
    ...(validationResult || {}),
    hostname: (validationResult?.hostname || []).concat(message),
  };
  return validationResult;
};

const withTemplate =
  (
    selectedHosts: Host[],
    hosts: Host[],
    schema: ReturnType<typeof validationSchema>,
    canChangeHostname: (host: Host) => ActionCheck,
    t: TFunction,
  ) =>
  async (values: EditHostFormValues) => {
    const newHostnames = getNewHostnames(values, selectedHosts, canChangeHostname)
      .filter((h) => !h.reason)
      .map(({ newHostname }) => newHostname);

    const usedHostnames = hosts.reduce<string[]>((acc, host) => {
      if (!selectedHosts.find((a) => a.id === host.id)) {
        acc.push(getHostname(host));
      }
      return acc;
    }, []);

    let validationResult = await getRichTextValidation(schema)({
      ...values,
      hostname: newHostnames[0] || '',
    });

    if (
      newHostnames.some((newHostname) => usedHostnames.includes(newHostname || '')) ||
      new Set(newHostnames).size !== newHostnames.length
    ) {
      validationResult = updateHostnameValidationResult(
        validationResult,
        hostnameValidationMessages(t).NOT_UNIQUE,
      );
    }

    if (newHostnames.some((hostname) => FORBIDDEN_HOSTNAMES.includes(hostname || ''))) {
      validationResult = updateHostnameValidationResult(
        validationResult,
        hostnameValidationMessages(t).LOCALHOST_ERR,
      );
    }

    return validationResult;
  };

type MassChangeHostnameFormProps = {
  selectedHosts: Host[];
  isOpen: boolean;
  onClose: VoidFunction;
  patchingHost: number;
  canChangeHostname: (host: Host) => ActionCheck;
};

const MassChangeHostnameForm = ({
  selectedHosts: initHosts,
  isOpen,
  patchingHost,
  onClose,
  canChangeHostname,
}: MassChangeHostnameFormProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { values, handleSubmit, isSubmitting, status, isValid } =
    useFormikContext<EditHostFormValues>();

  const hostnameInputRef = React.useRef<HTMLInputElement>();
  const ref = React.useRef<Host[]>(initHosts);

  React.useEffect(() => {
    isOpen && hostnameInputRef.current?.focus();
  }, [isOpen]);

  React.useCallback(() => {
    if (!isSubmitting) {
      ref.current = initHosts;
    }
  }, [initHosts, isSubmitting]);

  const selectedHosts = ref.current;

  const newHostnames = getNewHostnames(values, selectedHosts, canChangeHostname);
  const { t } = useTranslation();
  return (
    <Form onSubmit={handleSubmit}>
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            <div>{t('ai:Rename hostnames using the custom template:')}</div>
            <div>
              <strong>{`{{n}}`}</strong> {t('ai:to add a number.')}
            </div>
          </StackItem>
          <StackItem>
            <RichInputField
              name="hostname"
              ref={hostnameInputRef}
              isRequired
              richValidationMessages={hostnameValidationMessages(t)}
            />
            <HelperText>
              <HelperTextItem variant="indeterminate">
                {t('ai:For example: host-{{n}}', {
                  interpolation: { suffix: '###', prefix: '###' },
                })}
              </HelperTextItem>
            </HelperText>
          </StackItem>
          <StackItem>
            {t('ai:Preview')}
            <div className="hostname-preview">
              {selectedHosts.map((h, index) => {
                const { newHostname, reason } = newHostnames[index];
                return (
                  <Split key={h.id || index} hasGutter>
                    <SplitItem className="hostname-column">
                      <div className="hostname-column__text">
                        <strong>{getHostname(h)}</strong>
                      </div>
                    </SplitItem>
                    <SplitItem>
                      <div>
                        <strong>{'>'}</strong>
                      </div>
                    </SplitItem>
                    <SplitItem isFilled>
                      {reason ? (
                        <Popover
                          aria-label={t('ai:Cannot change hostname popover')}
                          headerContent={<div>{t('ai:Hostname cannot be changed')}</div>}
                          bodyContent={<div>{reason}</div>}
                        >
                          <Button
                            variant="link"
                            icon={<InfoCircleIcon color={blueInfoColor.value} />}
                            isInline
                          >
                            {t('ai:Not changeable')}
                          </Button>
                        </Popover>
                      ) : (
                        newHostname || t('ai:New hostname will appear here...')
                      )}
                    </SplitItem>
                  </Split>
                );
              })}
            </div>
          </StackItem>
          <StackItem>
            <ModalProgress
              // eslint-disable-next-line
              error={status?.error}
              progress={isSubmitting ? (100 * (patchingHost + 1)) / selectedHosts.length : null}
            />
          </StackItem>
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          key="submit"
          type={ButtonType.submit}
          isDisabled={isSubmitting || !isValid || !hostnameInputRef.current?.value.trim()}
        >
          {t('ai:Change')}
        </Button>
        <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={isSubmitting}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </Form>
  );
};

export type MassChangeHostnameModalProps = {
  hosts: Host[];
  selectedHostIDs: string[];
  isOpen: boolean;
  onClose: VoidFunction;
  // eslint-disable-next-line
  onChangeHostname: (host: Host, hostname: string) => Promise<any>;
  canChangeHostname: (host: Host) => ActionCheck;
  reloadCluster?: VoidFunction;
  onHostSaveError?: (e: Error) => void;
};

const MassChangeHostnameModal = ({
  isOpen,
  onClose,
  selectedHostIDs,
  hosts,
  onChangeHostname,
  canChangeHostname,
  reloadCluster,
  onHostSaveError,
}: MassChangeHostnameModalProps) => {
  const [patchingHost, setPatchingHost] = React.useState<number>(0);

  const selectedHosts = hosts.filter((h) => selectedHostIDs.includes(h.id));
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Change hostnames dialog')}
      title={t('ai:Change hostnames')}
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="mass-change-hostname-modal"
      variant="small"
    >
      <Formik
        initialValues={initialValues}
        validate={withTemplate(
          selectedHosts,
          hosts,
          validationSchema(initialValues, [], t),
          canChangeHostname,
          t,
        )}
        onSubmit={async (values, formikActions) => {
          let i = 0;
          try {
            for (const agent of selectedHosts) {
              setPatchingHost(i);
              const newHostname = templateToHostname(i, values);
              await onChangeHostname(agent, newHostname);
              i++;
            }
            reloadCluster && reloadCluster();
            onClose();
          } catch (e) {
            formikActions.setStatus({
              error: {
                title: t('ai:Failed to update host'),
                message: getApiErrorMessage(e),
              },
            });
            onHostSaveError && onHostSaveError(e as Error);
          }
        }}
      >
        <MassChangeHostnameForm
          isOpen={isOpen}
          selectedHosts={selectedHosts}
          patchingHost={patchingHost}
          onClose={onClose}
          canChangeHostname={canChangeHostname}
        />
      </Formik>
    </Modal>
  );
};

export default MassChangeHostnameModal;
