import * as React from 'react';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  ButtonVariant,
  Form,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { EditProxyModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { ProxyInputFields } from '../../../common/components/clusterConfiguration/ProxyFields';
import { Formik, useFormikContext } from 'formik';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  ProxyFieldsType,
} from '../../../common';
import { getErrorMessage } from '../../../common/utils';
import { getWarningMessage } from './utils';

const validationSchema = () =>
  Yup.lazy((values: ProxyFieldsType) =>
    Yup.object<ProxyFieldsType>().shape({
      httpProxy: httpProxyValidationSchema({
        values,
        pairValueName: 'httpsProxy',
        allowEmpty: true,
      }),
      httpsProxy: httpProxyValidationSchema({
        values,
        pairValueName: 'httpProxy',
        allowEmpty: true,
      }),
      noProxy: noProxyValidationSchema,
    }),
  );

const Footer = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  const { isSubmitting, submitForm, isValid } = useFormikContext();
  return (
    <ModalBoxFooter>
      <Button
        onClick={() => void submitForm()}
        isDisabled={isSubmitting || !isValid}
        isLoading={isSubmitting}
      >
        {t('ai:Save')}
      </Button>
      <Button onClick={onClose} variant={ButtonVariant.secondary}>
        {t('ai:Cancel')}
      </Button>
    </ModalBoxFooter>
  );
};

const EditProxyModal: React.FC<EditProxyModalProps> = ({
  onClose,
  infraEnv,
  onSubmit,
  hasAgents,
  hasBMHs,
}) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();
  const warningMsg = getWarningMessage(hasAgents, hasBMHs, t);
  const enableProxy =
    !!infraEnv.spec?.proxy?.httpProxy ||
    !!infraEnv.spec?.proxy?.httpsProxy ||
    !!infraEnv.spec?.proxy?.noProxy;
  return (
    <Modal
      aria-label={t('ai:Edit proxy settings')}
      title={t('ai:Edit proxy settings')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
    >
      <Formik<ProxyFieldsType>
        initialValues={{
          httpProxy: infraEnv.spec?.proxy?.httpProxy,
          httpsProxy: infraEnv.spec?.proxy?.httpsProxy,
          noProxy: infraEnv.spec?.proxy?.noProxy,
          enableProxy,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values: ProxyFieldsType) => {
          setError(undefined);
          try {
            await onSubmit(values, infraEnv);
            onClose();
          } catch (e) {
            setError(getErrorMessage(e));
          }
        }}
      >
        <>
          <ModalBoxBody>
            <Stack hasGutter>
              <StackItem>
                <Alert isInline variant="warning" title={warningMsg} />
              </StackItem>
              <StackItem>
                <Form>
                  <ProxyInputFields />
                  {error && (
                    <Alert variant="danger" title={t('ai:An error occured')} isInline>
                      {error}
                    </Alert>
                  )}
                </Form>
              </StackItem>
            </Stack>
          </ModalBoxBody>
          <Footer onClose={onClose} />
        </>
      </Formik>
    </Modal>
  );
};

export default EditProxyModal;
