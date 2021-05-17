import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import * as React from 'react';

type ConfigureNetworkModalProps = {
  isOpen: boolean;
  config: string | undefined;
  close: (config: string | undefined) => void;
};

const ConfigureNetworkModal: React.FC<ConfigureNetworkModalProps> = ({
  config: initConfig,
  close,
  isOpen,
}) => {
  const [config, setConfig] = React.useState('');
  React.useEffect(() => {
    if (isOpen) {
      setConfig(initConfig || '');
    }
  }, [initConfig, isOpen]);
  const onClose = React.useCallback(
    (cfg: string | undefined) => {
      setConfig('');
      close(cfg);
    },
    [close],
  );
  return (
    <Modal
      title="Configure network"
      isOpen={isOpen}
      actions={[
        <Button key="save" variant={ButtonVariant.primary} onClick={() => onClose(config)}>
          Save
        </Button>,
        <Button key="close" variant={ButtonVariant.link} onClick={() => onClose(initConfig)}>
          Cancel
        </Button>,
      ]}
      onClose={() => onClose(initConfig)}
      variant={ModalVariant.large}
    >
      <CodeEditor
        isUploadEnabled
        isDownloadEnabled
        isCopyEnabled
        isLanguageLabelVisible
        height="400px"
        language={Language.yaml}
        code={config}
        onChange={(value) => setConfig(value || '')}
      />
    </Modal>
  );
};

export default ConfigureNetworkModal;
