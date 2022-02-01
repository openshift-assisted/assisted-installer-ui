import * as React from 'react';
import {
  Button,
  ButtonType,
  ButtonVariant,
  Form,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';

import {
  RichInputField,
  getRichTextValidation,
  hostnameValidationSchema,
  HOSTNAME_VALIDATION_MESSAGES,
  ModalProgress,
} from '../ui';
import { Host } from '../../api';
import { getHostname as getHostnameUtils, getInventory } from './utils';

import './MassChangeHostnameModal.css';

const getHostname = (host: Host) => {
  const inventory = getInventory(host);
  return getHostnameUtils(host, inventory) || '';
};

const getHostnameTemplateAndCount = (values: EditHostFormValues) => {
  const numberTemplate = values.hostname.match(/{{n+}}/) || [];
  const numberCount = numberTemplate[0]?.match(/n/g)?.length || 0;
  return { numberTemplate, numberCount };
};

const templateToHostname = (
  index: number,
  values: EditHostFormValues,
  numberTemplate: RegExpMatchArray,
  numberCount: number,
) => values.hostname.replace(numberTemplate[0], `${index + 1}`.padStart(numberCount, '0'));

const getNewHostnames = (values: EditHostFormValues, selectedHosts: Host[]) => {
  const { numberTemplate, numberCount } = getHostnameTemplateAndCount(values);
  return selectedHosts.map((h, index) =>
    templateToHostname(index, values, numberTemplate, numberCount),
  );
};

type EditHostFormValues = {
  hostname: string;
};

const initialValues = {
  hostname: '',
};

const validationSchema = (initialValues: EditHostFormValues, usedHostnames: string[]) =>
  Yup.object().shape({
    hostname: hostnameValidationSchema(initialValues.hostname, usedHostnames),
  });

const withTemplate = (
  selectedHosts: Host[],
  hosts: Host[],
  schema: ReturnType<typeof validationSchema>,
) => async (values: EditHostFormValues) => {
  const newHostnames = getNewHostnames(values, selectedHosts);

  const usedHostnames = hosts.reduce<string[]>((acc, host) => {
    if (!selectedHosts.find((a) => a.id === host.id)) {
      acc.push(getHostname(host));
    }
    return acc;
  }, []);
  let validationResult = await getRichTextValidation(schema)({
    ...values,
    hostname: newHostnames[0],
  });
  if (
    newHostnames.some((h) => usedHostnames.includes(h)) ||
    new Set(newHostnames).size !== newHostnames.length
  ) {
    validationResult = {
      ...(validationResult || {}),
      hostname: (validationResult?.hostname || []).concat(HOSTNAME_VALIDATION_MESSAGES.NOT_UNIQUE),
    };
  }
  return validationResult;
};

type MassChangeHostnameFormProps = {
  selectedHosts: Host[];
  isOpen: boolean;
  onClose: VoidFunction;
  patchingHost: number;
};

const MassChangeHostnameForm: React.FC<MassChangeHostnameFormProps> = ({
  selectedHosts: initHosts,
  isOpen,
  patchingHost,
  onClose,
}) => {
  const { values, handleSubmit, isSubmitting, status, isValid } = useFormikContext<
    EditHostFormValues
  >();

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

  const newHostnames = getNewHostnames(values, selectedHosts);

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <ModalBoxBody>
          <Stack hasGutter>
            <StackItem>
              <div>Rename hostnames using the custom template:</div>
              <div>
                <b>{`{{n}}`}</b> to add a number.
              </div>
            </StackItem>
            <StackItem>
              <RichInputField
                name="hostname"
                ref={hostnameInputRef}
                isRequired
                richValidationMessages={HOSTNAME_VALIDATION_MESSAGES}
              />
              <HelperText>
                <HelperTextItem variant="indeterminate">{`For example: host-{{n}}`}</HelperTextItem>
              </HelperText>
            </StackItem>
            <StackItem>
              Preview
              <Split hasGutter className="hostname-preview">
                <SplitItem className="hostname-column">
                  {selectedHosts.map((h, index) => (
                    <div key={h.id || index} className="hostname-column__text">
                      <b>{getHostname(h)}</b>
                    </div>
                  ))}
                </SplitItem>
                <SplitItem>
                  {selectedHosts.map((h, index) => (
                    <div key={h.id || index}>
                      <b>{'  >  '}</b>
                    </div>
                  ))}
                </SplitItem>
                <SplitItem isFilled>
                  {selectedHosts.map((h, index) => (
                    <div key={h.id || index}>
                      {newHostnames[index] || 'New hostname will appear here...'}
                    </div>
                  ))}
                </SplitItem>
              </Split>
            </StackItem>
            <StackItem>
              <ModalProgress
                error={status?.error}
                progress={isSubmitting ? (100 * (patchingHost + 1)) / selectedHosts.length : null}
              />
            </StackItem>
          </Stack>
        </ModalBoxBody>
        <ModalBoxFooter>
          <Button key="submit" type={ButtonType.submit} isDisabled={isSubmitting || !isValid}>
            Change hostnames
          </Button>
          <Button onClick={onClose} variant={ButtonVariant.secondary} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalBoxFooter>
      </div>
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
};

const MassChangeHostnameModal: React.FC<MassChangeHostnameModalProps> = ({
  isOpen,
  onClose,
  selectedHostIDs,
  hosts,
  onChangeHostname,
}) => {
  const [patchingHost, setPatchingHost] = React.useState<number>(0);

  const selectedHosts = hosts.filter((h) => selectedHostIDs.includes(h.id));

  return (
    <Modal
      aria-label="Change hostname dialog"
      title="Change hostname"
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
      id="mass-change-hostname-modal"
      variant="small"
    >
      <Formik
        initialValues={initialValues}
        initialStatus={{ error: null }}
        validate={withTemplate(selectedHosts, hosts, validationSchema(initialValues, []))}
        onSubmit={async (values, formikActions) => {
          const { numberTemplate, numberCount } = getHostnameTemplateAndCount(values);

          let i = 0;
          try {
            for (const agent of selectedHosts) {
              setPatchingHost(i);
              const newHostname = templateToHostname(i, values, numberTemplate, numberCount);
              await onChangeHostname(agent, newHostname);
              i++;
            }
            onClose();
          } catch (e) {
            formikActions.setStatus({
              error: {
                title: 'Failed to update host',
                message: e.message || 'Hostname update failed.',
              },
            });
          }
        }}
      >
        <MassChangeHostnameForm
          isOpen={isOpen}
          selectedHosts={selectedHosts}
          patchingHost={patchingHost}
          onClose={onClose}
        />
      </Formik>
    </Modal>
  );
};

export default MassChangeHostnameModal;
